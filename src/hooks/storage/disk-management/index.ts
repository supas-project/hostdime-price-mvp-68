
import { useState, useCallback, useMemo } from "react";
import { PricedDiskOption } from "@/types/storage";

interface UseDiskManagementProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function useDiskManagement({ onSelectDisk }: UseDiskManagementProps) {
  // State for disk selection
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd">();
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<{ disk: PricedDiskOption; quantity: number }[]>([]);

  // Handler for type selection
  const handleTypeSelect = useCallback((type: "nvme" | "ssd" | "hdd") => {
    setSelectedDiskType(type);
    setSelectedCapacity("");
  }, []);

  // Handler for capacity selection
  const handleCapacitySelect = useCallback((capacity: string) => {
    setSelectedCapacity(capacity);
  }, []);

  // Handler for quantity changes
  const handleQuantityChange = useCallback(
    (diskId: string, newQuantity: number) => {
      setSelectedDisks((currentDisks) => {
        return currentDisks.map((item) => {
          if (item.disk.id === diskId) {
            const updatedItem = { ...item, quantity: newQuantity };
            
            // Notify parent component if callback provided
            if (onSelectDisk) {
              onSelectDisk(item.disk, newQuantity);
            }
            
            return updatedItem;
          }
          return item;
        });
      });
    },
    [onSelectDisk]
  );

  // Handler for removing a disk
  const handleRemoveDisk = useCallback(
    (diskId: string) => {
      setSelectedDisks((currentDisks) => {
        return currentDisks.filter((item) => item.disk.id !== diskId);
      });
    },
    []
  );

  // Compute visible disks based on selected type
  const visibleDisks = useMemo(() => {
    if (!selectedDiskType) return [];
    return selectedDisks.filter((item) => item.disk.type === selectedDiskType);
  }, [selectedDiskType, selectedDisks]);

  return {
    selectedDiskType,
    selectedCapacity,
    selectedDisks,
    visibleDisks,
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk,
    setSelectedDisks
  };
}

// Export the original implementation for backward compatibility if needed
export { useDiskManagement as useDiskManagementOriginal };
