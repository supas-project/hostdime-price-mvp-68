
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PricedDiskOption } from '@/types/storage';

interface DiskCapacitySelectorProps {
  selectedCapacity: string;
  onCapacitySelect: (capacity: string) => void;
  availableDisks: PricedDiskOption[];
  disabled: boolean;
  isLoading: boolean;
}

export function DiskCapacitySelector({
  selectedCapacity,
  onCapacitySelect,
  availableDisks,
  disabled,
  isLoading
}: DiskCapacitySelectorProps) {
  // Get unique capacities from available disks
  const uniqueCapacities = Array.from(
    new Set(availableDisks.map(disk => disk.capacity))
  ).sort((a, b) => {
    // Parse capacity values for sorting
    const valueA = parseFloat(a.replace(/[^0-9.]/g, ''));
    const valueB = parseFloat(b.replace(/[^0-9.]/g, ''));
    return valueA - valueB;
  });

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2">
        Capacidade do Disco
      </label>
      <Select
        value={selectedCapacity}
        onValueChange={onCapacitySelect}
        disabled={disabled || uniqueCapacities.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione a capacidade" />
        </SelectTrigger>
        <SelectContent>
          {uniqueCapacities.length > 0 ? (
            uniqueCapacities.map((capacity) => (
              <SelectItem key={capacity} value={capacity}>
                {capacity}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              Nenhuma capacidade disponível
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
