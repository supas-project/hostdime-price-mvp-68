
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
          "bg-[#1e1e1e] border-[#2a2a2a] text-white transition-colors",
          "text-sm sm:text-base py-2 px-3 sm:py-2.5 sm:px-4",
          !disabled ? "hover:border-[#f58220]" : "opacity-50"
        )}
      >
        <SelectValue placeholder="Capacidade" />
      </SelectTrigger>
      <SelectContent className="z-[51] bg-[#1e1e1e] border-[#2a2a2a]">
        {availableDisks.map((disk) => (
          <SelectItem key={disk.id} value={disk.capacity} className="sm:py-1.5">
            <div className="flex justify-between items-center gap-2 sm:gap-4 w-full">
              <span>{disk.capacity}</span>
              <span className="text-[#f58220] text-xs sm:text-sm font-medium">
                {formatCurrency(disk.price)}/mês
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
