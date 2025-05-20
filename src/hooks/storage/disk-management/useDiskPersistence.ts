
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";
import { normalizeStorageCapacity } from "@/utils/storage-utils";
import { PriceService } from "@/services/price-service";
import { toast } from "sonner";

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
      console.log("[useDiskPersistence] Checking for previously saved disk selections in database");
      const data = await PriceService.getAllData();
      
      if (data && data.discos_internos && data.discos_internos.items && data.discos_internos.items.length > 0) {
        console.log("[useDiskPersistence] Found saved disk selections in database:", data.discos_internos.items);
        
        // Convert database items to disk selections
        const databaseDisks = data.discos_internos.items.map(item => {
          // Extract disk type from subtype or type or metadata
          const diskType = item.subtype || item.type || "hdd";
          
          // Extract capacity from various possible locations
          let capacity = item.capacity || "";
          
          if (!capacity && item.metadata && typeof item.metadata === 'object' && 'capacity' in item.metadata) {
            capacity = item.metadata.capacity as string;
          }
          
          if (!capacity && item.specs && item.specs.some(spec => spec.includes('Capacidade:'))) {
            const capacitySpec = item.specs.find(spec => spec.includes('Capacidade:'));
            if (capacitySpec) {
              capacity = capacitySpec.split(':')[1]?.trim() || "";
            }
          } 
          
          if (!capacity) {
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
            type: diskType as "nvme" | "ssd" | "hdd",
            capacity: normalizeStorageCapacity(capacity),
            price: item.price / (item.metadata && typeof item.metadata === 'object' && 'quantity' in item.metadata ? 
              (item.metadata.quantity as number) || 1 : 1), // Calculate unit price
            specs: {
              readSpeed: "N/A",
              writeSpeed: "N/A",
              iops: "N/A",
              recommended: []
            },
            name: item.name,
            description: item.description
          };
          
          return {
            disk,
            quantity: item.metadata && typeof item.metadata === 'object' && 'quantity' in item.metadata ? 
              (item.metadata.quantity as number) || 1 : 1
          };
        });
        
        console.log("[useDiskPersistence] Converted database disks:", databaseDisks);
        return databaseDisks;
      }
      
      return null;
    } catch (error) {
      console.error("[useDiskPersistence] Error loading disk selections from database:", error);
      return null;
    }
  };

  // Effects for loading from database
  useEffect(() => {
    if (!isInitialLoad) return;
    
    const loadFromDatabase = async () => {
      try {
        console.log("[useDiskPersistence] Initial load - loading disks from database");
        const databaseDisks = await loadSelectedDisksFromDatabase();
        setIsInitialLoad(false);
      } catch (error) {
        console.error("[useDiskPersistence] Error in initial database load:", error);
        setIsInitialLoad(false);
      }
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
      
      console.log("[useDiskPersistence] Saved disk selections to local storage:", selectedDisks.length);
    } catch (error) {
      console.error("[useDiskPersistence] Error saving disk selections to local storage:", error);
    }
  }, [selectedDisks, selectedDiskType, isInitialLoad, isPersisted]);

  return { isPersisted, setIsPersisted };
}
