
import React from 'react';
import { ComponentOption } from "@/types/component";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { extractStorageCapacity, normalizeStorageCapacity } from "@/utils/storage-utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StorageListProps {
  storageItems: ComponentOption[];
  onRemoveItem?: (diskId: string) => void;
}

export function StorageList({ storageItems, onRemoveItem }: StorageListProps) {
  // Usar o ID como chave para garantir que temos apenas uma entrada por disco
  const uniqueDiskMap = new Map<string, { disk: ComponentOption, count: number }>();
  
  // Agrupar discos por ID e contar quantos de cada tipo temos
  storageItems.forEach(disk => {
    if (!disk || disk.price <= 0) return;
    
    const existingDisk = uniqueDiskMap.get(disk.id);
    
    if (existingDisk) {
      // Incrementar contagem para discos existentes
      existingDisk.count += disk.metadata?.quantity || 1;
    } else {
      // Adicionar novo disco
      uniqueDiskMap.set(disk.id, {
        disk,
        count: disk.metadata?.quantity || 1
      });
    }
  });
  
  // Converter o mapa para array
  const uniqueDisks = Array.from(uniqueDiskMap.values());
  
  // Agrupar discos por tipo para melhor organização
  const groupedStorage = uniqueDisks.reduce((groups, { disk }) => {
    const type = disk.subtype || disk.name.split(' ')[0].toLowerCase();
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push({
      disk,
      count: uniqueDiskMap.get(disk.id)?.count || 1
    });
    return groups;
  }, {} as Record<string, Array<{ disk: ComponentOption, count: number }>>);

  // Mapeamento explícito para tipos de variante do Badge
  const diskTypeVariants: {[key: string]: "success" | "secondary" | "default"} = {
    nvme: "success",
    ssd: "secondary",
    hdd: "default"
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
          {disks.map(({ disk, count }) => (
            <div 
              key={disk.id} 
              className="flex justify-between items-center group animate-fade-in pl-2 hover:bg-accent/20 p-1 rounded-md transition-colors"
            >
              <p className="text-sm">
                {count > 1 ? `${count}x ${disk.name}` : disk.name}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{formatCurrency(disk.price)}</p>
                
                {onRemoveItem && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveItem(disk.id)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remover disco</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
