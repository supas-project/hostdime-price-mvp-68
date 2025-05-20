
// Main export file for the disk management hooks
import { useDiskSelectionState } from './useDiskSelectionState';
import { useDiskPersistence } from './useDiskPersistence';
import { useDiskSync } from './useDiskSync';
import { useDiskActions } from './useDiskActions';
import { useState } from 'react';
import { PricedDiskOption } from '@/types/storage';

interface UseDiskManagementProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function useDiskManagement({ onSelectDisk }: UseDiskManagementProps = {}) {
  // Setup initial state flag
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Use specialized hooks
  const {
    selectedDiskType,
    setSelectedDiskType,
    selectedCapacity,
    setSelectedCapacity,
    selectedDisks,
    setSelectedDisks,
    availableDisks,
    setAvailableDisks,
    visibleDisks
  } = useDiskSelectionState(isInitialLoad);

  // Handle persistence
  const { isPersisted, setIsPersisted } = useDiskPersistence({
    selectedDisks,
    selectedDiskType,
    isInitialLoad,
    setIsInitialLoad
  });

  // Handle sync with database
  useDiskSync({
    selectedDisks,
    isPersisted,
    setIsPersisted,
    isInitialLoad
  });

  // User actions
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

// Re-export the legacy function with a different name to avoid conflicts
export { useDiskManagement as useDiskManagementOriginal } from './useDiskManagementLegacy';
