
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";
import { normalizeStorageCapacity } from "@/utils/storage-utils";
import { PriceService } from "@/services/price-service";

interface DiskPersistenceProps {
  selectedDisks: Array<{disk: PricedDiskOption, quantity: number}>;
  selectedDiskType: "nvme" | "ssd" | "hdd" | undefined;
  isInitialLoad: boolean;
  setIsInitialLoad: (isInitialLoad: boolean) => void;
}

export function useDiskPersistence({
  selectedDisks,
  selectedDiskType,
  isInitialLoad,
  setIsInitialLoad
}: DiskPersistenceProps) {
  const [isPersisted, setIsPersisted] = useState(true);

  // Load disks from database
  const loadSelectedDisksFromDatabase = async () => {
    try {
      console.log("Checking for previously saved disk selections in database");
      const data = await PriceService.getAllData();
      
      if (data && data.discos_internos && data.discos_internos.items && data.discos_internos.items.length > 0) {
        console.log("Found saved disk selections in database:", data.discos_internos.items);
        
        // Convert database items to disk selections
        const databaseDisks = data.discos_internos.items.map(item => {
          // Extract disk type from subtype
          const diskType = item.subtype as "nvme" | "ssd" | "hdd";
          
          // Extract capacity from name or specs
          let capacity = "";
          if (item.specs && item.specs.some(spec => spec.includes('Capacidade:'))) {
            const capacitySpec = item.specs.find(spec => spec.includes('Capacidade:'));
            if (capacitySpec) {
              capacity = capacitySpec.split(':')[1]?.trim() || "";
            }
          } else {
            // Extract from name
            const capacityMatch = item.name.match(/(\d+)TB|(\d+\.?\d*)TB|(\d+)GB/i);
            if (capacityMatch) {
              if (capacityMatch[1]) capacity = `${capacityMatch[1]}TB`;
              else if (capacityMatch[2]) capacity = `${capacityMatch[2]}TB`;
              else if (capacityMatch[3]) capacity = `${capacityMatch[3]}GB`;
            }
          }
          
          // Create disk object
          const disk: PricedDiskOption = {
            id: item.id,
            type: diskType,
            capacity: normalizeStorageCapacity(capacity),
            price: item.price / (item.metadata?.quantity || 1), // Calculate unit price
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
        
        return databaseDisks;
      }
      
      return null;
    } catch (error) {
      console.error("Error loading disk selections from database:", error);
      return null;
    }
  };

  // Effects for loading from database
  useEffect(() => {
    if (!isInitialLoad) return;
    
    const loadFromDatabase = async () => {
      const databaseDisks = await loadSelectedDisksFromDatabase();
      setIsInitialLoad(false);
    };
    
    loadFromDatabase();
  }, [isInitialLoad, setIsInitialLoad]);

  // Save selected disks to local storage whenever they change
  useEffect(() => {
    if (isInitialLoad) return; // Skip during initial load
    
    try {
      localStorage.setItem('selected_disks', JSON.stringify(selectedDisks));
      if (selectedDiskType) {
        localStorage.setItem('selected_disk_type', selectedDiskType);
      }
      
      // Mark as needing synchronization with database
      if (selectedDisks.length > 0 || isPersisted) {
        setIsPersisted(false);
      }
      
      console.log("Saved disk selections to local storage:", selectedDisks.length);
    } catch (error) {
      console.error("Error saving disk selections to local storage:", error);
    }
  }, [selectedDisks, selectedDiskType, isInitialLoad, isPersisted]);

  return { isPersisted, setIsPersisted };
}
