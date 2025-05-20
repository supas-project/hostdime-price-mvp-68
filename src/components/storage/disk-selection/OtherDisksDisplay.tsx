
import React from "react";
import { PricedDiskOption } from "@/types/storage";

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
  if (!selectedDisks.some(item => item.disk.type !== selectedDiskType)) {
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

  return (
    <div className="mt-4 p-3 bg-card rounded-lg border border-border">
      <p className="text-sm font-medium mb-2">Outros discos no seu servidor:</p>
      <div className="space-y-2">
        {Object.entries(disksByType).map(([type, disks]) => (
          <div key={type} className="flex items-center justify-between">
            <span className="text-sm">
              {type.toUpperCase()} ({disks.length} {disks.length === 1 ? "disco" : "discos"})
            </span>
            <button
              onClick={() => onSelectDiskType(type as "nvme" | "ssd" | "hdd")}
              className="text-xs text-primary hover:underline"
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
