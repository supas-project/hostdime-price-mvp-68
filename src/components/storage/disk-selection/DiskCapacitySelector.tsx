
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { PricedDiskOption } from "@/types/storage";

interface DiskCapacitySelectorProps {
  selectedCapacity: string;
  onCapacitySelect: (capacity: string) => void;
  availableDisks: PricedDiskOption[];
  disabled: boolean;
}

export function DiskCapacitySelector({ 
  selectedCapacity, 
  onCapacitySelect, 
  availableDisks,
  disabled 
}: DiskCapacitySelectorProps) {
  return (
    <Select 
      value={selectedCapacity} 
      onValueChange={onCapacitySelect}
      disabled={disabled}
    >
      <SelectTrigger 
        className={cn(
          "bg-[#1e1e1e] border-[#2a2a2a] text-white transition-colors w-full",
          "text-xs sm:text-sm py-2 px-2.5 sm:py-2.5 sm:px-4 min-h-[40px]",
          !disabled ? "hover:border-[#f58220]" : "opacity-50",
          "touch-target"
        )}
      >
        <SelectValue placeholder="Capacidade" />
      </SelectTrigger>
      <SelectContent className="z-[51] bg-[#1e1e1e] border-[#2a2a2a] max-h-[220px]">
        {availableDisks.map((disk) => (
          <SelectItem key={disk.id} value={disk.capacity} className="sm:py-2.5 py-2">
            <div className="flex justify-between items-center gap-2 sm:gap-4 w-full">
              <span>{disk.capacity}</span>
              <span className="text-[#f58220] text-xs sm:text-sm font-medium whitespace-nowrap">
                {formatCurrency(disk.price)}/mês
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
