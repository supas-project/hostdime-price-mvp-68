
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";

export function useDiskSelectionState(isInitialLoad: boolean) {
  // State for disk management - starting with undefined or empty values
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd" | undefined>(undefined);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<Array<{disk: PricedDiskOption, quantity: number}>>([]);
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  
  // Restore selected disks from local storage on initial load
  useEffect(() => {
    if (!isInitialLoad) return;
    
    console.log("Initial load - checking for disk selections in storage");
    const savedDisks = localStorage.getItem('selected_disks');
    const savedDiskType = localStorage.getItem('selected_disk_type');
    
    if (savedDisks) {
      try {
        const parsedDisks = JSON.parse(savedDisks);
        
        // Validate the structure of each disk before restoring
        const validDisks = Array.isArray(parsedDisks) ? parsedDisks.filter(item => 
          item && 
          item.disk && 
          item.disk.id && 
          item.disk.type && 
          typeof item.quantity === 'number' &&
          item.quantity > 0
        ) : [];
        
        if (validDisks.length > 0) {
          setSelectedDisks(validDisks);
          console.log("Restored selected disks from local storage:", validDisks.length);
        }
      } catch (error) {
        console.error("Error parsing saved disks from local storage:", error);
      }
    }
    
    if (savedDiskType) {
      const validType = ['nvme', 'ssd', 'hdd'].includes(savedDiskType) ? 
                        savedDiskType as "nvme" | "ssd" | "hdd" : undefined;
      
      if (validType) {
        setSelectedDiskType(validType);
        console.log("Restored selected disk type from local storage:", validType);
      }
    }
  }, [isInitialLoad]);

  // Calculate visible disks based on selected type
  const visibleDisks = selectedDisks.filter(
    item => selectedDiskType ? item.disk.type === selectedDiskType : true
  );

  return {
    selectedDiskType,
    setSelectedDiskType,
    selectedCapacity,
    setSelectedCapacity,
    selectedDisks,
    setSelectedDisks,
    availableDisks,
    setAvailableDisks,
    visibleDisks
  };
}
