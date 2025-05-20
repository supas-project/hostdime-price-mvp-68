
import React from "react";
import { PricedDiskOption } from "@/types/storage";
import { Badge } from "@/components/ui/badge";

interface OtherDisksDisplayProps {
  selectedDisks: Array<{disk: PricedDiskOption, quantity: number}>;
  selectedDiskType: "nvme" | "ssd" | "hdd" | undefined;
  onSelectDiskType: (type: "nvme" | "ssd" | "hdd") => void;
}

export function OtherDisksDisplay({ 
  selectedDisks, 
  selectedDiskType,
  onSelectDiskType 
}: OtherDisksDisplayProps) {
  // Only show if we have disks of other types
  if (!selectedDiskType || !selectedDisks.some(item => item.disk.type !== selectedDiskType)) {
    return null;
  }

  // Group disks by type
  const disksByType = selectedDisks
    .filter(item => item.disk.type !== selectedDiskType)
    .reduce((acc, curr) => {
      const type = curr.disk.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(curr);
      return acc;
    }, {} as Record<string, typeof selectedDisks>);

  const diskTypeLabels = {
    nvme: "NVMe",
    ssd: "SSD",
    hdd: "HDD"
  };

  return (
    <div className="mt-4 p-3 bg-card rounded-lg border border-border">
      <p className="text-sm font-medium mb-2">Outros discos no seu servidor:</p>
      <div className="space-y-2">
        {Object.entries(disksByType).map(([type, disks]) => {
          const totalDisks = disks.reduce((sum, item) => sum + item.quantity, 0);
          
          return (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="uppercase">{diskTypeLabels[type as keyof typeof diskTypeLabels]}</Badge>
                <span className="text-sm">
                  {totalDisks} {totalDisks === 1 ? "disco" : "discos"}
                </span>
              </div>
              <button
                onClick={() => onSelectDiskType(type as "nvme" | "ssd" | "hdd")}
                className="text-xs text-primary hover:underline"
              >
                Editar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
