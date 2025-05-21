
import React from 'react';
import { ComponentOption } from "@/types/component";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { extractStorageCapacity, normalizeStorageCapacity } from "@/utils/storage-utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDiskUniqueKey, deduplicateStorageItems } from "@/utils/html/price-calculator";

interface StorageListProps {
  storageItems: ComponentOption[];
  onRemoveItem?: (diskId: string) => void;
}

export function StorageList({ storageItems, onRemoveItem }: StorageListProps) {
  // Deduplica itens usando a função centralizada
  const uniqueItems = deduplicateStorageItems(storageItems);
  
  // Agrupar discos por tipo e capacidade para exibição
  const groupedStorage = uniqueItems.reduce((groups, disk) => {
    const type = (disk.subtype || disk.name.split(' ')[0]).toLowerCase();
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(disk);
    return groups;
  }, {} as Record<string, ComponentOption[]>);

  // Mapeamento para variantes do Badge
  const diskTypeVariants: {[key: string]: "success" | "secondary" | "default"} = {
    nvme: "success",
    ssd: "secondary",
    hdd: "default"
  };

  if (Object.keys(groupedStorage).length === 0) return null;

  // Extrai capacidade do disco com tratamento para unidades
  const getDisplayCapacity = (disk: ComponentOption): string => {
    // Primeiro tenta extrair de specs
    if (disk.specs && disk.specs.length > 0) {
      const capacitySpec = disk.specs.find(spec => spec.toLowerCase().includes('capacidade:'));
      if (capacitySpec) {
        const capacity = capacitySpec.split(':')[1]?.trim();
        if (capacity) return capacity;
      }
    }
    
    // Se não encontrar nos specs, tenta extrair do nome
    const nameMatch = disk.name.match(/(\d+)\s*([GT]B)/i);
    if (nameMatch) {
      return `${nameMatch[1]}${nameMatch[2].toUpperCase()}`;
    }
    
    // Último recurso: pegar a segunda parte do nome
    const nameParts = disk.name.split(' ');
    if (nameParts.length > 1) {
      return normalizeStorageCapacity(nameParts.slice(1).join(' '));
    }
    
    return "N/A";
  };

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
            <div 
              key={disk.id} 
              className="flex justify-between items-center group animate-fade-in pl-2 hover:bg-accent/20 p-1 rounded-md transition-colors"
            >
              <p className="text-sm">
                {disk.metadata?.quantity && disk.metadata.quantity > 1 ? 
                  `${disk.metadata.quantity}x ${getDisplayCapacity(disk)}` : 
                  getDisplayCapacity(disk)
                }
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
