
import React from "react";

interface EmptyDiskStateProps {
  selectedDiskType: "nvme" | "ssd" | "hdd" | undefined;
  selectedDisks: any[];
}

export function EmptyDiskState({ selectedDiskType, selectedDisks }: EmptyDiskStateProps) {
  // Only show if we have selected disks but none of the current type
  if (selectedDisks.length === 0) {
    return null;
  }
  
  return (
    <div className="text-center py-4 text-muted-foreground">
      <p>Nenhum disco {selectedDiskType?.toUpperCase()} adicionado.</p>
      <p className="text-sm mt-1">Selecione uma capacidade para adicionar.</p>
    </div>
  );
}
