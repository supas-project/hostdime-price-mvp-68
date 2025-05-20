
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
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

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

  // Find the current selected disk based on capacity
  const selectedDisk = selectedCapacity 
    ? availableDisks.find(disk => disk.capacity === selectedCapacity) 
    : undefined;

  if (isLoading) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium mb-2 text-white">Capacidade</label>
        <Skeleton className="h-10 w-full bg-[#2a2a2a]" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2 text-white">
        Capacidade
      </label>
      <Select
        value={selectedCapacity}
        onValueChange={onCapacitySelect}
        disabled={disabled || uniqueCapacities.length === 0}
      >
        <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white transition-colors hover:border-[#f58220] text-xs sm:text-sm py-2 px-2.5 sm:py-2.5 sm:px-4 min-h-[40px] touch-target">
          <SelectValue placeholder="Selecione a capacidade" />
        </SelectTrigger>
        <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a]">
          {uniqueCapacities.length > 0 ? (
            uniqueCapacities.map((capacity) => (
              <SelectItem key={capacity} value={capacity} className="hover:bg-[#2a2a2a] py-2">
                {capacity}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled className="text-gray-400">
              Nenhuma capacidade disponível
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
