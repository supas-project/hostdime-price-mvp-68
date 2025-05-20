
import { useState, useEffect, useRef } from "react";
import { PriceService } from "@/services/price-service";
import { diskData } from "@/data/disk-data";
import { normalizeStorageCapacity } from "@/utils/storage-utils";
import { PricedDiskOption } from "@/types/storage";

export function useDiskDataLoader(selectedDiskType: "nvme" | "ssd" | "hdd" | undefined) {
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Store reference to update function to avoid recreations
  const updateDisksRef = useRef<() => Promise<void>>();

  // Load disk data function - extracted to be reusable
  const loadDisksFromPriceTable = async () => {
    if (!selectedDiskType) {
      setAvailableDisks([]);
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
          // Convert price table items to disk format
          const priceTableDisks = diskCategory.items
            .filter(item => item.subtype === selectedDiskType)
            .map(item => {
              // Extract capacity from name
              const capacityMatches = item.name.match(/(\d+)TB|(\d+\.?\d*)TB|(\d+)GB/i);
              let capacity = "";
              
              if (capacityMatches) {
                if (capacityMatches[1]) capacity = `${capacityMatches[1]}TB`;
                else if (capacityMatches[2]) capacity = `${capacityMatches[2]}TB`;
                else if (capacityMatches[3]) capacity = `${capacityMatches[3]}GB`;
              }
              
              // Normalize to ensure capacity has a unit
              capacity = normalizeStorageCapacity(capacity);
              
              // Create properly formatted specs object
              const specsObj = {
                readSpeed: item.specs?.find(s => s.toLowerCase().includes('leitura'))?.split(':')[1]?.trim() || "N/A",
                writeSpeed: item.specs?.find(s => s.toLowerCase().includes('escrita'))?.split(':')[1]?.trim() || "N/A",
                iops: item.specs?.find(s => s.toLowerCase().includes('iops'))?.split(':')[1]?.trim() || "N/A",
                recommended: item.specs?.filter(s => s.toLowerCase().includes('recomendado')) || []
              };
              
              return {
                id: item.id,
                type: item.subtype as "nvme" | "ssd" | "hdd",
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
          }
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
    }
  };

  // Load disks when type changes
  useEffect(() => {
    loadDisksFromPriceTable();
    
    // Store update function for data change listener
    updateDisksRef.current = loadDisksFromPriceTable;
    
    // Clean up on unmount
    return () => {
      updateDisksRef.current = undefined;
    };
  }, [selectedDiskType]);

  // Register listener for data updates
  useEffect(() => {
    // Define the update function that will be called when data changes
    const handleDataChange = () => {
      if (updateDisksRef.current) {
        console.log("Data change detected, reloading disk data");
        updateDisksRef.current();
      }
    };
    
    // Register for price table changes
    PriceService.addDataChangeListener(handleDataChange);
    
    // Clean up listener when component unmounts
    return () => {
      PriceService.removeDataChangeListener();
    };
  }, []);

  // Add refreshData function to the return object
  const refreshData = async () => {
    if (updateDisksRef.current) {
      await updateDisksRef.current();
    }
  };

  return {
    availableDisks,
    isLoading,
    refreshData
  };
}
