
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";
import { DiskTypeSelector } from "./disk-selection/DiskTypeSelector";
import { DiskCapacitySelector } from "./disk-selection/DiskCapacitySelector";
import { SelectedDiskTypeInfo } from "./disk-selection/SelectedDiskTypeInfo";
import { OtherDisksDisplay } from "./disk-selection/OtherDisksDisplay";
import { useDiskManagement } from "@/hooks/storage/useDiskManagement";
import { useDiskDataLoader } from "@/hooks/storage/useDiskDataLoader";
import { toast } from "sonner";
import { PriceService } from "@/services/price-service";
import { useDiskPersistence } from "@/hooks/storage/useDiskPersistence";
import { useInitialDiskLoader } from "@/hooks/storage/useInitialDiskLoader";
import { useDataSyncHandler } from "@/hooks/storage/useDataSyncHandler";
import { DiskPanelHeader } from "./disk-selection/DiskPanelHeader";
import { DiskSelectionArea } from "./disk-selection/DiskSelectionArea";

interface InternalStoragePanelProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function InternalStoragePanel({ onSelectDisk }: InternalStoragePanelProps) {
  // State for syncing
  const [isSyncingData, setIsSyncingData] = useState<boolean>(false);
  
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
  const { availableDisks, isLoading, refreshData } = useDiskDataLoader(selectedDiskType);

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

  // Manual sync function to force refresh data
  const handleSyncData = async () => {
    setIsSyncingData(true);
    try {
      // First refresh data from the backend
      await PriceService.forceRefreshFromLatestSource();
      
      // Then reload the disk data
      await refreshData();
      
      toast.success("Dados de discos sincronizados", {
        description: "As opções de discos foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Error syncing disk data:", error);
      toast.error("Erro na sincronização", {
        description: "Não foi possível sincronizar os dados de discos."
      });
    } finally {
      setIsSyncingData(false);
    }
  };

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
    }
  }, [selectedDisks, isInitialLoad, isDataRefreshed, setHasLocalChanges]);

  // Show loading state or no disks message
  const showLoadingOrNoDiskMessage = isLoading || (!availableDisks.length && selectedDiskType !== undefined);

  return (
    <div className="space-y-6 animate-fade-in">
      <DiskPanelHeader 
        onSyncData={handleSyncData}
        isSyncingData={isSyncingData}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <DiskTypeSelector
          selectedType={selectedDiskType}
          onTypeSelect={handleTypeSelect}
        />
        <DiskCapacitySelector
          selectedCapacity={selectedCapacity}
          onCapacitySelect={handleCapacitySelect}
          availableDisks={availableDisks}
          disabled={!selectedDiskType || isLoading}
          isLoading={isLoading}
        />
      </div>

      <SelectedDiskTypeInfo selectedDiskType={selectedDiskType} />

      <DiskSelectionArea
        showLoadingOrNoDiskMessage={showLoadingOrNoDiskMessage}
        isLoading={isLoading}
        selectedDiskType={selectedDiskType}
        visibleDisks={visibleDisks}
        selectedDisks={selectedDisks}
        onQuantityChange={handleQuantityChange}
        onRemoveDisk={handleRemoveDisk}
      />

      <OtherDisksDisplay 
        selectedDisks={selectedDisks}
        selectedDiskType={selectedDiskType}
        onSelectDiskType={handleTypeSelect}
      />
    </div>
  );
}
