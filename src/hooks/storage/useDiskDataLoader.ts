
import { useState, useEffect, useRef, useCallback } from "react";
import { PriceService } from "@/services/price-service";
import { diskData } from "@/data/disk-data";
import { normalizeStorageCapacity } from "@/utils/storage-utils";
import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";

export function useDiskDataLoader(selectedDiskType: "nvme" | "ssd" | "hdd" | undefined) {
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [loadAttempted, setLoadAttempted] = useState(false);
  
  // Store reference to update function to avoid recreations
  const updateDisksRef = useRef<() => Promise<void>>();

  // Load disk data function - extracted to be reusable
  const loadDisksFromPriceTable = useCallback(async () => {
    if (!selectedDiskType) {
      setAvailableDisks([]);
      setIsLoading(false);
      setLoadAttempted(true);
      return;
    }

    setIsLoading(true);
    try {
      // Start with empty array
      const disks: PricedDiskOption[] = [];
      
      try {
        console.log(`Loading disks for type ${selectedDiskType}`);
        
        // Try to get disk category from price table
        const diskCategory = await PriceService.getCategory('disk');
        
        if (diskCategory && diskCategory.items && diskCategory.items.length > 0) {
          console.log(`Found ${diskCategory.items.length} total disk items in price table`);
          
          // Convert price table items to disk format, filtering by selected type
          const priceTableDisks = diskCategory.items
            .filter(item => {
              // First check explicit subtype property
              if (item.subtype && item.subtype.toLowerCase() === selectedDiskType.toLowerCase()) {
                return true;
              }
              
              // Then check type property
              if (item.type && item.type.toLowerCase() === selectedDiskType.toLowerCase()) {
                return true;
              }
              
              // Finally check specs array for type info
              return item.specs?.some(spec => 
                spec.toLowerCase().includes(`tipo: ${selectedDiskType.toLowerCase()}`)
              );
            })
            .map(item => {
              // Extract capacity from name or specs
              let capacity = "";
              
              // First try to get from explicit capacity property
              if (item.capacity) {
                capacity = item.capacity;
              }
              // Then try to extract from name
              else {
                const capacityMatches = item.name.match(/(\d+(?:\.\d+)?)\s*([TGM]B)/i);
                if (capacityMatches) {
                  capacity = `${capacityMatches[1]}${capacityMatches[2].toUpperCase()}`;
                }
              }
              
              // If still no capacity, try to extract from specs
              if (!capacity) {
                const capacitySpec = item.specs?.find(s => s.toLowerCase().includes('capacidade:'));
                if (capacitySpec) {
                  capacity = capacitySpec.split(':')[1]?.trim() || "";
                }
              }
              
              // Normalize to ensure capacity has a unit
              capacity = normalizeStorageCapacity(capacity || "500GB");
              
              // Create properly formatted specs object
              const specsObj = {
                readSpeed: item.specs?.find(s => s.toLowerCase().includes('leitura'))?.split(':')[1]?.trim() || "N/A",
                writeSpeed: item.specs?.find(s => s.toLowerCase().includes('escrita'))?.split(':')[1]?.trim() || "N/A",
                iops: item.specs?.find(s => s.toLowerCase().includes('iops'))?.split(':')[1]?.trim() || "N/A",
                recommended: item.specs?.filter(s => s.toLowerCase().includes('recomendado')) || []
              };
              
              return {
                id: item.id,
                type: selectedDiskType,
                capacity,
                price: item.price,
                name: item.name,
                description: item.description,
                specs: specsObj
              };
            });
          
          // Only use price table disks if we found some
          if (priceTableDisks.length > 0) {
            console.log(`Found ${priceTableDisks.length} disks in price table for type ${selectedDiskType}`);
            disks.push(...priceTableDisks);
          } else {
            console.log(`No disks found in price table for type ${selectedDiskType}, checking static data`);
          }
        } else {
          console.warn(`No disk category or items found in price table`);
        }
      } catch (error) {
        console.error('Error loading disks from price table:', error);
        // No need to throw here, we'll fall back to static data
      }
      
      // If we didn't get any disks from price table, use static data
      if (disks.length === 0) {
        console.log('Falling back to static disk data for type', selectedDiskType);
        const staticDisks = diskData
          .filter(disk => disk.type === selectedDiskType)
          .map(disk => ({
            ...disk,
            capacity: normalizeStorageCapacity(disk.capacity)
          }));
        
        disks.push(...staticDisks);
      }
      
      console.log(`Loaded ${disks.length} disks for type ${selectedDiskType}`);
      setAvailableDisks(disks);
    } catch (error) {
      console.error('Error loading disks:', error);
      // Fallback to static original data as last resort
      if (selectedDiskType) {
        const fallbackDisks = diskData
          .filter(disk => disk.type === selectedDiskType)
          .map(disk => ({
            ...disk,
            capacity: normalizeStorageCapacity(disk.capacity)
          }));
        setAvailableDisks(fallbackDisks);
      } else {
        setAvailableDisks([]);
      }
    } finally {
      setIsLoading(false);
      setLoadAttempted(true);
    }
  }, [selectedDiskType]);

  // Load disks when type changes
  useEffect(() => {
    if (selectedDiskType) {
      // Reset load attempted state when type changes
      setLoadAttempted(false);
      loadDisksFromPriceTable();
    } else {
      // Clear disks when no type is selected
      setAvailableDisks([]);
      setIsLoading(false);
    }
    
    // Store update function for data change listener
    updateDisksRef.current = loadDisksFromPriceTable;
    
    // Clean up on unmount
    return () => {
      updateDisksRef.current = undefined;
    };
  }, [selectedDiskType, loadDisksFromPriceTable]);
  
  // Register listener for data updates with error handling
  useEffect(() => {
    // Define the update function that will be called when data changes
    const handleDataChange = () => {
      if (updateDisksRef.current) {
        try {
          console.log("Data change detected, reloading disk data");
          updateDisksRef.current();
          setLastUpdated(Date.now()); // Force re-render when data changes
        } catch (error) {
          console.error("Error handling data change:", error);
          toast.error("Erro ao atualizar dados de disco");
        }
      }
    };
    
    try {
      // Register for price table changes
      PriceService.addDataChangeListener(handleDataChange);
      
      // Clean up listener when component unmounts
      return () => {
        PriceService.removeDataChangeListener();
      };
    } catch (error) {
      console.error("Error setting up data change listener:", error);
      return () => {}; // Empty cleanup in case of error
    }
  }, []);

  // Force refresh method that can be called externally
  const refreshData = useCallback(async () => {
    if (updateDisksRef.current) {
      try {
        await updateDisksRef.current();
        toast.success("Dados de disco atualizados", {
          description: "As opções de disco foram sincronizadas com sucesso."
        });
      } catch (error) {
        console.error("Error refreshing disk data:", error);
        toast.error("Erro ao atualizar dados de disco");
      }
    }
  }, []);

  return {
    availableDisks,
    isLoading,
    refreshData,
    lastUpdated,
    loadAttempted
  };
}
