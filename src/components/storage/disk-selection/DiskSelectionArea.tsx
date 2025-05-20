
import { Loader2 } from "lucide-react";
import { SelectedDiskDisplay } from "./SelectedDiskDisplay";
import { EmptyDiskState } from "./EmptyDiskState";
import { PricedDiskOption } from "@/types/storage";

interface DiskSelectionAreaProps {
  showLoadingOrNoDiskMessage: boolean;
  isLoading: boolean;
  selectedDiskType: "nvme" | "ssd" | "hdd" | undefined;
  visibleDisks: { disk: PricedDiskOption; quantity: number }[];
  selectedDisks: { disk: PricedDiskOption; quantity: number }[];
  onQuantityChange: (diskId: string, quantity: number) => void;
  onRemoveDisk: (diskId: string) => void;
}

export function DiskSelectionArea({ 
  showLoadingOrNoDiskMessage, 
  isLoading, 
  selectedDiskType,
  visibleDisks,
  selectedDisks,
  onQuantityChange,
  onRemoveDisk
}: DiskSelectionAreaProps) {
  if (showLoadingOrNoDiskMessage) {
    if (isLoading) {
      return (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Carregando opções de disco...</p>
        </div>
      );
    }
    
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground">
          Nenhum disco {selectedDiskType?.toUpperCase()} encontrado. 
          Por favor, adicione discos na Tabela de Preços ou selecione outro tipo.
        </p>
      </div>
    );
  }
  
  if (visibleDisks.length > 0) {
    return (
      <div className="space-y-4">
        {visibleDisks.map((item) => (
          <div key={item.disk.id} className="animate-fade-in">
            <SelectedDiskDisplay
              disk={item.disk}
              quantity={item.quantity}
              onQuantityChange={(qty) => onQuantityChange(item.disk.id, qty)}
              onRemove={() => onRemoveDisk(item.disk.id)}
            />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <EmptyDiskState 
      selectedDiskType={selectedDiskType}
      selectedDisks={selectedDisks}
    />
  );
}
