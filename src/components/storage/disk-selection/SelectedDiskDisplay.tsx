
import { Button } from "@/components/ui/button";
import { CircleDot, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PricedDiskOption } from "@/types/storage";
import { QuantitySelector } from "@/components/quantity-selector";

interface SelectedDiskDisplayProps {
  disk: PricedDiskOption;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function SelectedDiskDisplay({ 
  disk, 
  quantity, 
  onQuantityChange, 
  onRemove 
}: SelectedDiskDisplayProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#1e1e1e] border border-[#2a2a2a] transition-all duration-300">
      <div className="flex items-center gap-3">
        <CircleDot className="w-4 h-4 text-[#f58220]" />
        <span className="text-white">
          {disk.type.toUpperCase()} {disk.capacity}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white">Quantidade:</span>
          <QuantitySelector 
            value={quantity} 
            onChange={onQuantityChange} 
            min={1} 
            max={10} 
          />
        </div>
        <span className="text-[#f58220] font-medium">
          {formatCurrency(disk.price * quantity)}/mês
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="ml-2 text-destructive hover:text-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
