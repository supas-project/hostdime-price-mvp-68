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

  // Modificamos esse efeito para NÃO notificar o componente pai automaticamente durante a inicialização
  useEffect(() => {
    // Apenas processar discos explicitamente selecionados pelo usuário após a inicialização,
    // não os que vieram do localStorage
    if (!isInitialLoad && isDataRefreshed && selectedDisks.length > 0) {
      // Verificar que cada disco possui os dados necessários
      const validDisks = selectedDisks.filter(item => 
        item && 
        item.disk && 
        item.disk.id && 
        item.disk.type && 
        typeof item.quantity === 'number' && 
        item.quantity > 0
      );
      
      // Armazenar validDisks para uso futuro em localStorage,
      // mas NÃO enviar para o componente pai durante a inicialização
      if (validDisks.length > 0) {
        localStorage.setItem('selectedDisks', JSON.stringify(validDisks));
        setHasLocalChanges(true);
        
        // NÃO notificar o componente pai durante a inicialização
        // Agora só notificamos quando há uma ação explícita do usuário (via handleAddSelectedDisk)
      } else if (validDisks.length === 0 && selectedDisks.length > 0) {
        localStorage.removeItem('selectedDisks');
      }
    }
  }, [selectedDisks, isInitialLoad, isDataRefreshed, setHasLocalChanges]);

  // Aqui está a função que só é chamada quando o usuário explicitamente adiciona um disco
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
          
          // AQUI é onde notificamos o componente pai após uma ação EXPLÍCITA do usuário
          if (onSelectDisk) {
            onSelectDisk(diskToAdd, 1);
          }
          
          toast.success(`Disco ${selectedDiskType.toUpperCase()} ${selectedCapacity} adicionado`);
        }
        
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
