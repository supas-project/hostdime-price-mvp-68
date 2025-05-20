
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";

export function useDiskSelectionState(isInitialLoad: boolean) {
  // State for disk management
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd" | undefined>(undefined);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<Array<{disk: PricedDiskOption, quantity: number}>>([]);
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  
  // Restore selected disks from local storage on initial load
  useEffect(() => {
    if (!isInitialLoad) return;
    
    console.log("Initial load - restoring disk selections from storage");
    const savedDisks = localStorage.getItem('selected_disks');
    const savedDiskType = localStorage.getItem('selected_disk_type');
    
    if (savedDisks) {
      try {
        const parsedDisks = JSON.parse(savedDisks);
        setSelectedDisks(parsedDisks);
        console.log("Restored selected disks from local storage:", parsedDisks.length);
      } catch (error) {
        console.error("Error parsing saved disks from local storage:", error);
      }
    }
    
    if (savedDiskType) {
      setSelectedDiskType(savedDiskType as "nvme" | "ssd" | "hdd");
      console.log("Restored selected disk type from local storage:", savedDiskType);
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
