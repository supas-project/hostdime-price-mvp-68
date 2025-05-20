
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";
import { DiskTypeSelector } from "./disk-selection/DiskTypeSelector";
import { DiskCapacitySelector } from "./disk-selection/DiskCapacitySelector";
import { SelectedDiskTypeInfo } from "./disk-selection/SelectedDiskTypeInfo";
import { OtherDisksDisplay } from "./disk-selection/OtherDisksDisplay";
import { useDiskManagement } from "@/hooks/storage/useDiskManagement";
import { useDiskDataLoader } from "@/hooks/storage/useDiskDataLoader";
import { toast } from "sonner";
import { useDiskPersistence } from "@/hooks/storage/useDiskPersistence";
import { useInitialDiskLoader } from "@/hooks/storage/useInitialDiskLoader";
import { useDataSyncHandler } from "@/hooks/storage/useDataSyncHandler";
import { SelectedDiskDisplay } from "./disk-selection/SelectedDiskDisplay";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InternalStoragePanelProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function InternalStoragePanel({ onSelectDisk }: InternalStoragePanelProps) {
  // State for disk selection
  const [showSelectedDisks, setShowSelectedDisks] = useState<boolean>(true);
  
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
          setSelectedDisks(prev => [...prev, { disk: diskToAdd, quantity: 1 }]);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {selectedDiskType && (
        <SelectedDiskTypeInfo selectedDiskType={selectedDiskType} />
      )}

      {selectedCapacity && selectedDiskType && (
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={handleAddSelectedDisk}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Adicionar Disco {selectedDiskType.toUpperCase()} {selectedCapacity}</span>
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Carregando opções de disco...</p>
        </div>
      ) : !availableDisks.length && selectedDiskType ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground">
            Nenhum disco {selectedDiskType?.toUpperCase()} encontrado. 
            Por favor, adicione discos na Tabela de Preços ou selecione outro tipo.
          </p>
        </div>
      ) : (
        <>
          {visibleDisks.length > 0 && (
            <div className="space-y-4 bg-background/5 p-4 rounded-lg border border-[#2a2a2a]">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Discos selecionados</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSelectedDisks(!showSelectedDisks)}
                  className={cn("text-xs px-2 py-1 h-auto")}
                >
                  {showSelectedDisks ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
              
              {showSelectedDisks && (
                <div className="space-y-4">
                  {visibleDisks.map((item) => (
                    <div key={item.disk.id} className="animate-fade-in">
                      <SelectedDiskDisplay
                        disk={item.disk}
                        quantity={item.quantity}
                        onQuantityChange={(qty) => handleQuantityChange(item.disk.id, qty)}
                        onRemove={() => handleRemoveDisk(item.disk.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      <OtherDisksDisplay 
        selectedDisks={selectedDisks}
        selectedDiskType={selectedDiskType}
        onSelectDiskType={handleTypeSelect}
      />
    </div>
  );
}

