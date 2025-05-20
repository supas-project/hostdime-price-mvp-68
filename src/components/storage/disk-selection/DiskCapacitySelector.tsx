
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PricedDiskOption } from "@/types/storage";
import { Loader2 } from "lucide-react";

interface DiskCapacitySelectorProps {
  selectedCapacity: string;
  onCapacitySelect: (capacity: string) => void;
  availableDisks: PricedDiskOption[];
  disabled?: boolean;
  isLoading?: boolean;
}

export function DiskCapacitySelector({
  selectedCapacity,
  onCapacitySelect,
  availableDisks,
  disabled = false,
  isLoading = false
}: DiskCapacitySelectorProps) {
  // Sort capacities by size (numeric)
  const sortedDisks = [...availableDisks].sort((a, b) => {
    // Extract numeric value from capacity strings
    const aSize = parseFloat(a.capacity.replace(/[^\d.]/g, ''));
    const bSize = parseFloat(b.capacity.replace(/[^\d.]/g, ''));
    return aSize - bSize;
  });

  // Get unique capacities
  const uniqueCapacities = Array.from(new Set(sortedDisks.map(disk => disk.capacity)));
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Capacidade do Disco</label>
      <Select
        value={selectedCapacity || ""}
        onValueChange={onCapacitySelect}
        disabled={disabled || uniqueCapacities.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={
            isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Carregando...</span>
              </div>
            ) : "Selecione a capacidade"
          } />
        </SelectTrigger>
        <SelectContent>
          {uniqueCapacities.map((capacity) => (
            <SelectItem key={capacity} value={capacity}>
              {capacity}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
