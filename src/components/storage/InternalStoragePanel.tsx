
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";
import { DiskTypeSelector } from "./disk-selection/DiskTypeSelector";
import { DiskCapacitySelector } from "./disk-selection/DiskCapacitySelector";
import { SelectedDiskDisplay } from "./disk-selection/SelectedDiskDisplay";
import { OtherDisksDisplay } from "./disk-selection/OtherDisksDisplay";
import { EmptyDiskState } from "./disk-selection/EmptyDiskState";
import { SelectedDiskTypeInfo } from "./disk-selection/SelectedDiskTypeInfo";
import { useDiskManagement } from "@/hooks/storage/useDiskManagement";
import { useDiskDataLoader } from "@/hooks/storage/useDiskDataLoader";
import { toast } from "sonner";
import { PriceService } from "@/services/price-service";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InternalStoragePanelProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function InternalStoragePanel({ onSelectDisk }: InternalStoragePanelProps) {
  // Track whether this is the initial load or a subsequent load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDataRefreshed, setIsDataRefreshed] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [isSyncingData, setIsSyncingData] = useState(false);
  
  // Use our custom hooks
  const {
    selectedDiskType,
    selectedCapacity,
    selectedDisks,
    visibleDisks,
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk,
    setSelectedDisks
  } = useDiskManagement({ onSelectDisk });

  // Load disk data using the data loader hook
  const { availableDisks, isLoading, refreshData } = useDiskDataLoader(selectedDiskType);

  // Manual sync function to force refresh data
  const handleSyncData = async () => {
    setIsSyncingData(true);
    try {
      // First refresh data from the backend
      await PriceService.forceRefreshFromLatestSource();
      
      // Then reload the disk data
      await refreshData();
      
      toast.success("Dados de discos sincronizados", {
        description: "As opções de discos foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Error syncing disk data:", error);
      toast.error("Erro na sincronização", {
        description: "Não foi possível sincronizar os dados de discos."
      });
    } finally {
      setIsSyncingData(false);
    }
  };

  // Function to persist selections to the database
  const persistSelectionsToDatabase = async (disks: {disk: PricedDiskOption, quantity: number}[]) => {
    try {
      // Get current data from the database first
      const allData = await PriceService.getAllData();
      
      if (!allData || !allData.disk) {
        console.warn("No disk category found in database, creating one to persist selections");
        await PriceService.addCategory({
          id: 'disk',
          name: 'Discos',
          items: []
        });
        
        // Refresh data after creating the category
        const refreshedData = await PriceService.getAllData();
        if (!refreshedData || !refreshedData.disk) {
          console.error("Failed to create disk category");
          return;
        }
      }
      
      // Transform selected disks for storage
      const disksToStore = disks.map(item => ({
        id: item.disk.id,
        name: item.disk.name || `${item.disk.type.toUpperCase()} ${item.disk.capacity}`,
        description: item.disk.description || `${item.disk.type.toUpperCase()} disk with ${item.disk.capacity} capacity`,
        price: item.disk.price,
        type: item.disk.type,
        subtype: item.disk.type, // Explicitly add subtype to ensure proper filtering
        capacity: item.disk.capacity, // Explicitly add capacity to ensure proper display
        specs: [
          `Tipo: ${item.disk.type.toUpperCase()}`,
          `Capacidade: ${item.disk.capacity}`,
          `Quantidade: ${item.quantity}`
        ],
        metadata: {
          quantity: item.quantity,
          unitPrice: item.disk.price
        }
      }));
      
      // Get the existing data again to make sure we have the latest
      const latestData = await PriceService.getAllData();
      
      // Update the disk category
      const updatedCategory = {
        ...latestData.disk,
        items: disksToStore
      };
      
      // Update the data
      const updatedData = {
        ...latestData,
        disk: updatedCategory
      };
      
      // Save to database
      await PriceService.saveData(updatedData);
      console.log("[InternalStoragePanel] Disk selections persisted to database", disksToStore);
      
      // Also save to localStorage for redundancy
      localStorage.setItem('selectedDisks', JSON.stringify(disks));
      console.log("[InternalStoragePanel] Disk selections persisted to localStorage", disks);
      
      setHasLocalChanges(false);
    } catch (error) {
      console.error("Error persisting disk selections to database:", error);
    }
  };

  // Load saved disk selections on initial mount
  useEffect(() => {
    const loadSavedSelections = async () => {
      try {
        // First try to get from localStorage for quick load
        const savedSelectionsString = localStorage.getItem('selectedDisks');
        let savedSelections = [];
        
        if (savedSelectionsString) {
          try {
            savedSelections = JSON.parse(savedSelectionsString);
            console.log("[InternalStoragePanel] Loaded selections from localStorage:", savedSelections);
          } catch (e) {
            console.error("Error parsing saved disk selections:", e);
          }
        }
        
        // If we have local selections, use them initially
        if (savedSelections && savedSelections.length > 0) {
          // Make sure each disk has the required specs property
          const validatedSelections = savedSelections.map(item => {
            // Ensure disk has all required properties
            const validatedDisk: PricedDiskOption = {
              id: item.disk.id,
              type: item.disk.type as "nvme" | "ssd" | "hdd",
              capacity: item.disk.capacity,
              price: item.disk.price,
              specs: item.disk.specs || {
                readSpeed: "N/A",
                writeSpeed: "N/A",
                iops: "N/A",
                recommended: []
              },
              name: item.disk.name,
              description: item.disk.description
            };
            
            return {
              disk: validatedDisk,
              quantity: item.quantity
            };
          });
          
          setSelectedDisks(validatedSelections);
        }

        // Then check database for most up-to-date data
        const allData = await PriceService.getAllData();
        
        if (allData && allData.disk && allData.disk.items && allData.disk.items.length > 0) {
          console.log("[InternalStoragePanel] Found disk items in database:", allData.disk.items.length);
          
          const dbSelections = allData.disk.items.map(item => {
            // Extract capacity from various possible sources
            let capacity;
            
            // First check explicit capacity property
            if (item.capacity) {
              capacity = item.capacity;
            } else {
              // Try to extract from specs
              const capacitySpec = item.specs?.find(spec => spec.toLowerCase().includes('capacidade:'));
              capacity = capacitySpec ? capacitySpec.split(':')[1]?.trim() : '';
              
              // If not in specs, try to extract from name
              if (!capacity) {
                const capacityMatch = item.name.match(/(\d+(?:\.\d+)?)\s*([TGM]B)/i);
                if (capacityMatch) {
                  capacity = `${capacityMatch[1]}${capacityMatch[2].toUpperCase()}`;
                }
              }
            }
            
            // Default capacity if nothing was found
            capacity = capacity || '500GB';
            
            // Determine disk type from various sources
            let diskType = item.subtype || item.type;
            if (!diskType || typeof diskType !== 'string') {
              const typeSpec = item.specs?.find(spec => spec.toLowerCase().includes('tipo:'));
              diskType = typeSpec 
                ? typeSpec.split(':')[1]?.trim().toLowerCase()
                : 'ssd';  // Default to SSD if no type found
            }
            
            // Validate disk type is one of the allowed values
            const validDiskType = (diskType === 'nvme' || diskType === 'ssd' || diskType === 'hdd') 
              ? diskType as "nvme" | "ssd" | "hdd" 
              : 'ssd' as "ssd";
            
            // Build the disk object  
            const disk: PricedDiskOption = {
              id: item.id,
              name: item.name,
              type: validDiskType,
              capacity: capacity,
              price: item.price || 0,
              description: item.description,
              specs: {
                readSpeed: "N/A",
                writeSpeed: "N/A", 
                iops: "N/A",
                recommended: []
              }
            };
            
            // Determine quantity from metadata or default to 1
            const quantity = item.metadata?.quantity || 1;
            
            return {
              disk,
              quantity
            };
          });
          
          if (dbSelections.length > 0 && isInitialLoad) {
            console.log("[InternalStoragePanel] Setting selections from database:", dbSelections);
            setSelectedDisks(dbSelections);
            
            // Update localStorage with latest database data
            localStorage.setItem('selectedDisks', JSON.stringify(dbSelections));
          }
        } else {
          console.log("[InternalStoragePanel] No disk selections found in database");
        }
        
        setIsInitialLoad(false);
        setIsDataRefreshed(true);
      } catch (error) {
        console.error("Error loading saved disk selections:", error);
        setIsInitialLoad(false);
      }
    };

    if (isInitialLoad) {
      loadSavedSelections();
    }
  }, [isInitialLoad, setSelectedDisks]);

  // Save selections whenever they change
  useEffect(() => {
    if (!isInitialLoad && isDataRefreshed && selectedDisks.length > 0) {
      // Store selections in localStorage immediately
      localStorage.setItem('selectedDisks', JSON.stringify(selectedDisks));
      
      // Set flag that we have changes to persist
      setHasLocalChanges(true);
    }
  }, [selectedDisks, isInitialLoad, isDataRefreshed]);

  // Periodically save changes to the database if we have local changes
  useEffect(() => {
    if (hasLocalChanges) {
      const timer = setTimeout(() => {
        persistSelectionsToDatabase(selectedDisks);
      }, 2000); // Save to database after 2 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [selectedDisks, hasLocalChanges]);

  // Add visibility state handler for leaving/returning to page
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log("[InternalStoragePanel] Page visibility changed to visible, checking for data changes");
        
        try {
          // Check if there are any conflicts between our local state and the server
          const conflict = await PriceService.checkForDataConflicts();
          
          if (conflict) {
            console.log("[InternalStoragePanel] Data conflicts detected, refreshing from server");
            
            // If there are conflicts, refresh data from the server
            await PriceService.forceRefreshFromLatestSource()
              .then(() => {
                console.log("[InternalStoragePanel] Disk data refreshed from latest source");
                
                // After refreshing server data, reload data in the UI
                if (refreshData) {
                  refreshData();
                }
              })
              .catch(error => {
                if (!error.message.includes("Authentication")) {
                  console.error("[InternalStoragePanel] Error refreshing disk data:", error);
                  toast.error("Erro ao atualizar dados de disco");
                }
              });
          } else {
            console.log("[InternalStoragePanel] No data conflicts detected");
            
            // If we have unsaved local changes, persist them now
            if (hasLocalChanges) {
              await persistSelectionsToDatabase(selectedDisks);
            }
          }
        } catch (error) {
          console.error("[InternalStoragePanel] Error checking for data conflicts:", error);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Always persist changes when component unmounts
      if (hasLocalChanges && selectedDisks.length > 0) {
        persistSelectionsToDatabase(selectedDisks);
      }
    };
  }, [hasLocalChanges, selectedDisks, refreshData]);

  // Listen for storage data updates from parent
  useEffect(() => {
    const handleStorageDataUpdated = () => {
      console.log("[InternalStoragePanel] Storage data updated event received");
      refreshData();
    };
    
    window.addEventListener('storage-data-updated', handleStorageDataUpdated);
    
    return () => {
      window.removeEventListener('storage-data-updated', handleStorageDataUpdated);
    };
  }, [refreshData]);

  // Show loading state or no disks message
  const showLoadingOrNoDiskMessage = isLoading || (!availableDisks.length && selectedDiskType);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Discos Internos</h3>
        <Button 
          onClick={handleSyncData} 
          variant="outline" 
          size="sm"
          disabled={isSyncingData}
          className="flex items-center gap-2"
        >
          {isSyncingData ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sincronizando...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Sincronizar Dados</span>
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <DiskTypeSelector
          selectedType={selectedDiskType}
          onTypeSelect={handleTypeSelect}
        />
        <DiskCapacitySelector
          selectedCapacity={selectedCapacity}
          onCapacitySelect={handleCapacitySelect}
          availableDisks={availableDisks}
          disabled={!selectedDiskType || isLoading}
          isLoading={isLoading}
        />
      </div>

      <SelectedDiskTypeInfo selectedDiskType={selectedDiskType} />

      {showLoadingOrNoDiskMessage ? (
        isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Carregando opções de disco...</p>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">
              Nenhum disco {selectedDiskType?.toUpperCase()} encontrado. 
              Por favor, adicione discos na Tabela de Preços ou selecione outro tipo.
            </p>
          </div>
        )
      ) : (
        <>
          {visibleDisks.length > 0 ? (
            <div className="space-y-4">
              {visibleDisks.map((item) => (
                <div key={item.disk.id} className="animate-fade-in">
                  <SelectedDiskDisplay
                    disk={item.disk}
                    quantity={item.quantity}
                    onQuantityChange={(qty) => handleQuantityChange(item.disk.id, qty)}
                    onRemove={() => handleRemoveDisk(item.disk.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyDiskState 
              selectedDiskType={selectedDiskType}
              selectedDisks={selectedDisks}
            />
          )}
        </>
      )}

      <OtherDisksDisplay 
        selectedDisks={selectedDisks}
        selectedDiskType={selectedDiskType}
        onSelectDiskType={handleTypeSelect}
      />
    </div>
  );
}
