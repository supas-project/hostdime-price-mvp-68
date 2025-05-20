
import React from "react";

interface EmptyDiskStateProps {
  selectedDiskType: "nvme" | "ssd" | "hdd" | undefined;
  selectedDisks: any[];
}

export function EmptyDiskState({ selectedDiskType, selectedDisks }: EmptyDiskStateProps) {
  // Only show if we have selected some disks but none of the current type
  if (!selectedDiskType || selectedDisks.length === 0) {
    return null;
  }
  
  // Check if there are any disks of the selected type
  const hasSelectedTypeDisk = selectedDisks.some(item => item.disk.type === selectedDiskType);
  if (hasSelectedTypeDisk) {
    return null;
  }
  
  const diskTypeLabels = {
    nvme: "NVMe",
    ssd: "SSD",
    hdd: "HDD"
  };
  
  return (
    <div className="text-center py-4 text-muted-foreground">
      <p>Nenhum disco {diskTypeLabels[selectedDiskType]} adicionado.</p>
      <p className="text-sm mt-1">Selecione uma capacidade para adicionar.</p>
    </div>
  );
}
