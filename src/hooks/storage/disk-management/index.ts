
import { useState, useCallback, useMemo, useEffect } from "react";
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
        const updatedDisks = currentDisks.map((item) => {
          if (item.disk.id === diskId) {
            // Notify parent component if callback provided
            const updatedItem = { ...item, quantity: newQuantity };
            return updatedItem;
          }
          return item;
        });
        
        // Find the updated disk to notify parent component
        const updatedDisk = updatedDisks.find(item => item.disk.id === diskId);
        
        if (updatedDisk && onSelectDisk) {
          onSelectDisk(updatedDisk.disk, newQuantity);
        }
        
        return updatedDisks;
      });
    },
    [onSelectDisk]
  );

  // Handler for removing a disk
  const handleRemoveDisk = useCallback(
    (diskId: string) => {
      setSelectedDisks((currentDisks) => {
        // Find disk before removal to notify parent
        const diskToRemove = currentDisks.find(item => item.disk.id === diskId);
        
        // Remove the disk from state
        const updatedDisks = currentDisks.filter((item) => item.disk.id !== diskId);
        
        // Notify parent of removal with quantity = 0
        if (diskToRemove && onSelectDisk) {
          onSelectDisk(diskToRemove.disk, 0);
        }
        
        return updatedDisks;
      });
    },
    [onSelectDisk]
  );

  // Compute visible disks based on selected type
  const visibleDisks = useMemo(() => {
    if (!selectedDiskType) return [];
    return selectedDisks.filter((item) => item.disk.type === selectedDiskType);
  }, [selectedDiskType, selectedDisks]);

  // Ensure synchronization with server summary on selected disks change
  useEffect(() => {
    // This effect ensures that we notify the parent of all selected disks
    // when the component mounts or when selectedDisks change
    if (onSelectDisk) {
      selectedDisks.forEach(item => {
        onSelectDisk(item.disk, item.quantity);
      });
    }
  }, [onSelectDisk]);

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
