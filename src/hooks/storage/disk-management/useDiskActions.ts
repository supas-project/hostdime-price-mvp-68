
import { PricedDiskOption } from "@/types/storage";
import { Dispatch, SetStateAction } from "react";

export interface DiskActionsProps {
  setSelectedDiskType: Dispatch<SetStateAction<"nvme" | "ssd" | "hdd" | undefined>>;
  setSelectedCapacity: Dispatch<SetStateAction<string>>;
  selectedDisks: Array<{disk: PricedDiskOption, quantity: number}>;
  setSelectedDisks: Dispatch<SetStateAction<Array<{disk: PricedDiskOption, quantity: number}>>>;
  availableDisks: PricedDiskOption[];
  setIsPersisted: Dispatch<SetStateAction<boolean>>;
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function useDiskActions({
  setSelectedDiskType,
  setSelectedCapacity,
  selectedDisks,
  setSelectedDisks,
  availableDisks,
  setIsPersisted,
  onSelectDisk
}: DiskActionsProps) {
  
  // Handle disk type selection
  const handleTypeSelect = (type: "nvme" | "ssd" | "hdd") => {
    console.log(`[useDiskActions] Selecting disk type: ${type}`);
    setSelectedDiskType(type);
    setSelectedCapacity(""); // Reset capacity when type changes
  };
  
  // Handle capacity selection
  const handleCapacitySelect = (capacity: string) => {
    console.log(`[useDiskActions] Selecting capacity: ${capacity}`);
    setSelectedCapacity(capacity);
  };
  
  // Change quantity of an existing disk
  const handleQuantityChange = (diskId: string, newQuantity: number) => {
    console.log(`[useDiskActions] Changing quantity for disk ${diskId} to ${newQuantity}`);
    
    if (newQuantity < 1) {
      handleRemoveDisk(diskId);
      return;
    }
    
    const updatedDisks = selectedDisks.map(item => {
      if (item.disk.id === diskId) {
        const updatedItem = {
          disk: { ...item.disk },
          quantity: newQuantity
        };
        
        // Notify parent component if callback exists
        if (onSelectDisk) {
          onSelectDisk(item.disk, newQuantity);
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setSelectedDisks(updatedDisks);
    setIsPersisted(false); // Mark data as needing persistence
  };
  
  // Remove a disk from selection
  const handleRemoveDisk = (diskId: string) => {
    console.log(`[useDiskActions] Removing disk: ${diskId}`);
    const diskToRemove = selectedDisks.find(item => item.disk.id === diskId);
    
    const updatedDisks = selectedDisks.filter(item => item.disk.id !== diskId);
    setSelectedDisks(updatedDisks);
    setIsPersisted(false); // Mark data as needing persistence
    
    // Notify parent component of removal with quantity 0
    if (diskToRemove && onSelectDisk) {
      onSelectDisk(diskToRemove.disk, 0);
    }
  };
  
  return {
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk
  };
}
