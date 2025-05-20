import { useState, useCallback, useMemo, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";

interface UseDiskManagementProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function useDiskManagement({ onSelectDisk }: UseDiskManagementProps) {
  // State for disk selection - starting with undefined/empty values
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd" | undefined>(undefined);
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
        // Validate that newQuantity is a positive number
        const validQuantity = typeof newQuantity === 'number' && !isNaN(newQuantity) ? 
                              Math.max(0, newQuantity) : 0;
        
        let updatedDisks = [...currentDisks];
        
        if (validQuantity <= 0) {
          // If quantity is 0 or negative, remove the disk
          updatedDisks = updatedDisks.filter(item => item.disk.id !== diskId);
        } else {
          // Otherwise update the quantity
          updatedDisks = updatedDisks.map((item) => {
            if (item.disk.id === diskId) {
              return { ...item, quantity: validQuantity };
            }
            return item;
          });
        }
        
        // Find the affected disk to notify parent component
        const affectedDisk = currentDisks.find(item => item.disk.id === diskId);
        
        if (affectedDisk && onSelectDisk) {
          // Notify with either the updated quantity or 0 if removed
          onSelectDisk(affectedDisk.disk, validQuantity);
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
