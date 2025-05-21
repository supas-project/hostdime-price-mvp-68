
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
  // Usar um mapa para garantir que cada ID de disco único seja mostrado apenas uma vez
  const uniqueDisksMap = new Map<string, ComponentOption>();
  
  // Adicionar apenas discos válidos ao mapa
  storageItems.forEach(disk => {
    if (!disk || disk.price <= 0) return;
    
    // Não adicionar duplicatas - manter apenas uma instância de cada disco por ID
    if (!uniqueDisksMap.has(disk.id)) {
      uniqueDisksMap.set(disk.id, disk);
    }
  });
  
  // Converter o mapa para array
  const uniqueDisks = Array.from(uniqueDisksMap.values());
  
  // Agrupar discos por tipo para melhor organização
  const groupedStorage = uniqueDisks.reduce((groups, disk) => {
    const type = disk.subtype || disk.name.split(' ')[0].toLowerCase();
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(disk);
    return groups;
  }, {} as Record<string, Array<ComponentOption>>);

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
          {disks.map((disk) => {
            // Obter a quantidade do metadado, ou usar 1 como padrão
            const quantity = disk.metadata?.quantity || 1;
            
            return (
              <div 
                key={disk.id} 
                className="flex justify-between items-center group animate-fade-in pl-2 hover:bg-accent/20 p-1 rounded-md transition-colors"
              >
                <p className="text-sm">
                  {quantity > 1 ? `${quantity}x ${disk.name}` : disk.name}
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
            );
          })}
        </div>
      ))}
    </>
  );
}
