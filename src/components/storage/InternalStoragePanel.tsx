
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";
import { useDiskManagement } from "@/hooks/storage/useDiskManagement";
import { useDiskDataLoader } from "@/hooks/storage/useDiskDataLoader";
import { toast } from "sonner";
import { useDiskPersistence } from "@/hooks/storage/useDiskPersistence";
import { useInitialDiskLoader } from "@/hooks/storage/useInitialDiskLoader";
import { useDataSyncHandler } from "@/hooks/storage/useDataSyncHandler";
import { DiskPanelRecommendation } from "./disk-panel/DiskPanelRecommendation";
import { DiskPanelContent } from "./disk-panel/DiskPanelContent";

interface InternalStoragePanelProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function InternalStoragePanel({ onSelectDisk }: InternalStoragePanelProps) {
  // Use our custom hooks
  const {
    selectedDiskType,
    selectedCapacity,
    selectedDisks,
    visibleDisks,
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk,
    setSelectedDisks
  } = useDiskManagement({ onSelectDisk });

  // Load disk data using the data loader hook
  const { availableDisks, isLoading, refreshData, loadAttempted } = useDiskDataLoader(selectedDiskType);

  // Use the persistence hook
  const { hasLocalChanges, setHasLocalChanges, persistSelectionsToDatabase } = useDiskPersistence();

  // Use the initial loader hook with strictly typed boolean values
  const { 
    isInitialLoad, 
    setIsInitialLoad, 
    isDataRefreshed, 
    setIsDataRefreshed 
  } = useInitialDiskLoader(setSelectedDisks);

  // Use the data sync handler hook
  useDataSyncHandler({
    selectedDisks,
    hasLocalChanges,
    persistSelectionsToDatabase,
    refreshData
  });

  // Save selections whenever they change
  useEffect(() => {
    // Convert to strictly boolean values using strict equality comparison
    const initialLoadComplete = isInitialLoad === false;
    const dataIsRefreshed = isDataRefreshed === true;
    
    if (initialLoadComplete && dataIsRefreshed && selectedDisks.length > 0) {
      // Store selections in localStorage immediately
      localStorage.setItem('selectedDisks', JSON.stringify(selectedDisks));
      
      // Set flag that we have changes to persist
      setHasLocalChanges(true);
      
      // Notify parent component about all selected disks
      if (onSelectDisk) {
        selectedDisks.forEach(item => {
          onSelectDisk(item.disk, item.quantity);
        });
      }
    }
  }, [selectedDisks, isInitialLoad, isDataRefreshed, setHasLocalChanges, onSelectDisk]);

  // Find the selected disk based on capacity for adding to configuration
  const handleAddSelectedDisk = () => {
    if (selectedCapacity && selectedDiskType) {
      const diskToAdd = availableDisks.find(
        disk => disk.capacity === selectedCapacity && disk.type === selectedDiskType
      );
      
      if (diskToAdd) {
        // Check if this disk is already selected
        const existingDisk = selectedDisks.find(
          item => item.disk.capacity === selectedCapacity && item.disk.type === selectedDiskType
        );
        
        if (existingDisk) {
          // Increase quantity if disk already exists
          handleQuantityChange(existingDisk.disk.id, existingDisk.quantity + 1);
          toast.success(`Quantidade do disco ${selectedDiskType.toUpperCase()} ${selectedCapacity} aumentada`);
        } else {
          // Add new disk with quantity 1
          const newSelectedDisks = [...selectedDisks, { disk: diskToAdd, quantity: 1 }];
          setSelectedDisks(newSelectedDisks);
          setHasLocalChanges(true);
          
          if (onSelectDisk) {
            onSelectDisk(diskToAdd, 1);
          }
          
          toast.success(`Disco ${selectedDiskType.toUpperCase()} ${selectedCapacity} adicionado`);
        }
        
        // Reset capacity selection using the function from useDiskManagement
        handleCapacitySelect("");
      }
    }
  };

  // Determine if we should show loading or no disk message
  const showLoadingOrNoDiskMessage = 
    (isLoading || (loadAttempted && availableDisks.length === 0)) && 
    !!selectedDiskType;

  return (
    <div className="space-y-6 animate-fade-in">
      <DiskPanelRecommendation />
      
      <DiskPanelContent
        selectedDiskType={selectedDiskType}
        selectedCapacity={selectedCapacity}
        handleTypeSelect={handleTypeSelect}
        handleCapacitySelect={handleCapacitySelect}
        handleAddSelectedDisk={handleAddSelectedDisk}
        availableDisks={availableDisks}
        isLoading={isLoading}
        showLoadingOrNoDiskMessage={showLoadingOrNoDiskMessage}
        visibleDisks={visibleDisks}
        selectedDisks={selectedDisks}
        handleQuantityChange={handleQuantityChange}
        handleRemoveDisk={handleRemoveDisk}
      />
    </div>
  );
}
