
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PricedDiskOption } from "@/types/storage";
import { SelectedDiskDisplay } from "../disk-selection/SelectedDiskDisplay";
import { cn } from "@/lib/utils";

interface SelectedDisksDisplayProps {
  visibleDisks: { disk: PricedDiskOption; quantity: number }[];
  handleQuantityChange: (diskId: string, quantity: number) => void;
  handleRemoveDisk: (diskId: string) => void;
}

export function SelectedDisksDisplay({
  visibleDisks,
  handleQuantityChange,
  handleRemoveDisk
}: SelectedDisksDisplayProps) {
  const [showSelectedDisks, setShowSelectedDisks] = useState<boolean>(true);

  if (visibleDisks.length === 0) return null;

  return (
    <div className="space-y-4 bg-[#191919] p-4 rounded-lg border border-[#2a2a2a]">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-white">Discos selecionados</h4>
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
  );
}
