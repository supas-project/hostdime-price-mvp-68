
import React from 'react';
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HardDrive, X } from "lucide-react";
import { extractStorageCapacity, normalizeStorageCapacity } from "@/utils/storage-utils";
import { Button } from "@/components/ui/button";

interface ExternalStorageListProps {
  storageItems: ComponentOption[];
  onRemoveItem?: (storageId: string) => void;
}

export function ExternalStorageList({ storageItems, onRemoveItem }: ExternalStorageListProps) {
  const filteredItems = storageItems.filter(storage => storage && storage.price > 0);
  
  if (!filteredItems.length) return null;
  
  // Get badge variant based on storage type name
  const getBadgeVariant = (name: string): "default" | "secondary" | "outline" | "success" => {
    const typeName = name.toLowerCase();
    if (typeName.includes('standard')) return "secondary";
    if (typeName.includes('performance')) return "default";
    if (typeName.includes('premium')) return "success";
    return "secondary";
  };

  // Get storage capacity and type from name or specs
  const getStorageInfo = (storage: ComponentOption): { capacity: string; type: string } => {
    let capacity = "N/A";
    let type = "Padrão";
    
    // Try to extract from specs first
    if (storage.specs && storage.specs.length > 0) {
      const capacitySpec = storage.specs.find(spec => spec.toLowerCase().includes('capacidade:'));
      if (capacitySpec) {
        capacity = capacitySpec.split(':')[1]?.trim() || "N/A";
        capacity = normalizeStorageCapacity(capacity);
      }
      
      const typeSpec = storage.specs.find(spec => spec.toLowerCase().includes('tipo:'));
      if (typeSpec) {
        type = typeSpec.split(':')[1]?.trim() || "Padrão";
        // Remove "Storage" prefix if present
        type = type.replace(/storage/i, '').trim();
      }
    }
    
    // If capacity still N/A, try to extract from name
    if (capacity === "N/A") {
      const capacityMatch = storage.name.match(/(\d+)\s*([GT]B)/i);
      if (capacityMatch) {
        capacity = `${capacityMatch[1]}${capacityMatch[2].toUpperCase()}`;
      } else {
        // Try to find any number that might be capacity
        const numMatch = storage.name.match(/(\d+)/);
        if (numMatch) {
          capacity = `${numMatch[1]}GB`; // Assume GB if no unit specified
        }
      }
      
      if (!type || type === "Padrão") {
        const nameArr = storage.name.split(' ');
        if (nameArr.length > 1) {
          // First word after "Storage" is likely the type
          const storageIndex = nameArr.findIndex(word => 
            word.toLowerCase() === 'storage'
          );
          
          if (storageIndex >= 0 && nameArr[storageIndex + 1]) {
            type = nameArr[storageIndex + 1];
          } else if (nameArr.length > 1) {
            type = nameArr[1]; // Fallback to second word
          }
        }
      }
    }
    
    return { capacity, type };
  };

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
        <HardDrive className="h-3.5 w-3.5" />
        <span>Storage Externo</span>
      </div>
      
      {filteredItems.map((storage) => {
        const { capacity, type } = getStorageInfo(storage);
        const badgeVariant = getBadgeVariant(type);
        
        return (
          <div key={storage.id} 
               className="flex justify-between items-center group p-1.5 pl-2 rounded-md hover:bg-accent/40 transition-colors">
            <div className="flex items-center gap-2">
              <Badge variant={badgeVariant} className="text-xs">
                {type}
              </Badge>
              <p className="text-sm font-medium">{capacity}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{formatCurrency(storage.price)}</p>
              
              {onRemoveItem && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveItem(storage.id)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remover storage</span>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
