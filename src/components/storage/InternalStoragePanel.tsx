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

interface InternalStoragePanelProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function InternalStoragePanel({ onSelectDisk }: InternalStoragePanelProps) {
  // Track whether this is the initial load or a subsequent load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDataRefreshed, setIsDataRefreshed] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  
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

  // Function to persist selections to the database
  const persistSelectionsToDatabase = async (disks: {disk: PricedDiskOption, quantity: number}[]) => {
    try {
      // Get current data from the database first
      const allData = await PriceService.getAllData();
      
      if (!allData.disk) {
        console.warn("No disk category found in database, cannot persist selections");
        return;
      }
      
      // Transform selected disks for storage
      const disksToStore = disks.map(item => ({
        id: item.disk.id,
        name: item.disk.name || `${item.disk.type} ${item.disk.capacity}`,
        description: item.disk.description || `${item.disk.type} disk with ${item.disk.capacity} capacity`,
        price: item.disk.price,
        type: item.disk.type,
        specs: [
          `Type: ${item.disk.type}`,
          `Capacity: ${item.disk.capacity}`,
          `Quantity: ${item.quantity}`
        ],
        metadata: {
          quantity: item.quantity,
          unitPrice: item.disk.price
        }
      }));
      
      // Update the disk category
      const updatedCategory = {
        ...allData.disk,
        items: disksToStore
      };
      
      // Update the data
      const updatedData = {
        ...allData,
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
        
        if (allData && allData.disk && allData.disk.items) {
          const dbSelections = allData.disk.items.map(item => {
            const capacitySpec = item.specs?.find(spec => spec.includes('Capacity:'));
            const capacity = capacitySpec ? capacitySpec.split('Capacity:')[1]?.trim() : '500GB';
            
            // Create a properly formatted disk object with all required properties
            const disk: PricedDiskOption = {
              id: item.id,
              name: item.name,
              type: item.type || 'ssd' as "ssd" | "nvme" | "hdd",
              capacity: capacity || '500GB',
              price: item.price || 0,
              description: item.description,
              specs: {
                readSpeed: "N/A",
                writeSpeed: "N/A", 
                iops: "N/A",
                recommended: []
              }
            };
            
            return {
              disk,
              quantity: item.metadata?.quantity || 1
            };
          });
          
          // Only if we have database selections and we're on initial load, use them
          if (dbSelections.length > 0 && isInitialLoad) {
            console.log("[InternalStoragePanel] Setting selections from database:", dbSelections);
            setSelectedDisks(dbSelections);
            
            // Update localStorage with latest database data
            localStorage.setItem('selectedDisks', JSON.stringify(dbSelections));
          }
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
                  toast.error("Error refreshing disk data");
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

  
  return (
    <div className="space-y-6 animate-fade-in">
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

      <OtherDisksDisplay 
        selectedDisks={selectedDisks}
        selectedDiskType={selectedDiskType}
        onSelectDiskType={handleTypeSelect}
      />
    </div>
  );
}
