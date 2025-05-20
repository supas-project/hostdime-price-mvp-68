
// This file contains the original implementation that is now deprecated.
// It's kept for backward compatibility if needed.

import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";

export function useDiskManagement() {
  // State for disk management
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd" | undefined>(undefined);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<Array<{disk: PricedDiskOption, quantity: number}>>([]);
  
  // Basic implementation of disk actions
  const handleTypeSelect = (type: "nvme" | "ssd" | "hdd") => {
    setSelectedDiskType(type);
    setSelectedCapacity("");
  };
  
  const handleCapacitySelect = (capacity: string) => {
    setSelectedCapacity(capacity);
  };
  
  const handleQuantityChange = (diskId: string, newQuantity: number) => {
    setSelectedDisks(prev => prev.map(item => {
      if (item.disk.id === diskId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };
  
  const handleRemoveDisk = (diskId: string) => {
    setSelectedDisks(prev => prev.filter(item => item.disk.id !== diskId));
    toast.success("Disco removido com sucesso");
  };
  
  // Calculate visible disks
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
    visibleDisks,
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk
  };
}
