
import { useDiskActions } from './useDiskActions';
import { useState, useEffect } from 'react';
import { PricedDiskOption } from '@/types/storage';

interface DiskManagementProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
  initialDiskType?: "nvme" | "ssd" | "hdd";
}

export function useDiskManagement(props: DiskManagementProps = {}) {
  const { onSelectDisk } = props;
  
  // Local state for disk management
  const [selectedDiskType, setSelectedDiskType] = useState<"nvme" | "ssd" | "hdd" | undefined>(props.initialDiskType);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedDisks, setSelectedDisks] = useState<Array<{disk: PricedDiskOption, quantity: number}>>([]);
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  const [isPersisted, setIsPersisted] = useState(true);
  
  // Use the disk actions with all required parameters
  const { 
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk
  } = useDiskActions({
    setSelectedDiskType,
    setSelectedCapacity,
    selectedDisks,
    setSelectedDisks,
    availableDisks,
    setIsPersisted,
    onSelectDisk
  });
  
  // Filter visible disks based on selected type
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
    visibleDisks,
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk
  };
}
