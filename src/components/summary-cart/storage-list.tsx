
import React from 'react';
import { ComponentOption } from "@/types/component";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface StorageListProps {
  storageItems: ComponentOption[];
}

export function StorageList({ storageItems }: StorageListProps) {
  // Agrupar discos internos por tipo para melhor organização
  const groupedStorage = storageItems
    .filter(disk => disk && disk.price > 0)
    .reduce((groups, disk) => {
      const type = disk.subtype || disk.name.split(' ')[0].toLowerCase();
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(disk);
      return groups;
    }, {} as Record<string, ComponentOption[]>);

  // Mapeamento explícito para tipos de variante do Badge
  const diskTypeVariants: {[key: string]: "success" | "info" | "warning" | "default"} = {
    nvme: "success",
    ssd: "info",
    hdd: "warning"
  };

  if (Object.keys(groupedStorage).length === 0) return null;

  return (
    <>
      {Object.entries(groupedStorage).map(([type, disks]) => (
        <div key={type} className="space-y-2 pt-2 border-t border-border/50 first:border-t-0 first:pt-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={diskTypeVariants[type] || "default"}>
              {type.toUpperCase()}
            </Badge>
          </div>
          {disks.map((disk) => (
            <div key={disk.id} className="flex justify-between items-center group animate-fade-in pl-2">
              <p className="text-sm">
                {disk.metadata?.quantity && disk.metadata.quantity > 1 ? 
                  `${disk.metadata.quantity}x ${disk.specs?.[1]?.split(': ')[1] || disk.name.split(' ').slice(1).join(' ')}` : 
                  disk.specs?.[1]?.split(': ')[1] || disk.name.split(' ').slice(1).join(' ')
                }
              </p>
              <p className="text-sm font-medium">{formatCurrency(disk.price)}</p>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
