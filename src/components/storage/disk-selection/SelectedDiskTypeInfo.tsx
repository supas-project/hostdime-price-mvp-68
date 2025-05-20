
import React from "react";

interface SelectedDiskTypeInfoProps {
  selectedDiskType: "nvme" | "ssd" | "hdd" | undefined;
}

export function SelectedDiskTypeInfo({ selectedDiskType }: SelectedDiskTypeInfoProps) {
  if (!selectedDiskType) {
    return null;
  }
  
  const diskTypeLabels = {
    nvme: "NVMe",
    ssd: "SSD",
    hdd: "HDD"
  };
  
  return (
    <div className="px-3 py-2 bg-primary/10 rounded-md border border-primary/20">
      <p className="text-sm text-center">
        Configurando discos <span className="font-semibold">{diskTypeLabels[selectedDiskType]}</span>
      </p>
    </div>
  );
}
