
import React from 'react';
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HardDrive } from "lucide-react";

interface ExternalStorageListProps {
  storageItems: ComponentOption[];
}

export function ExternalStorageList({ storageItems }: ExternalStorageListProps) {
  const filteredItems = storageItems.filter(storage => storage && storage.price > 0);
  
  if (!filteredItems.length) return null;
  
  // Get badge variant based on storage type name
  const getBadgeVariant = (name: string): "default" | "secondary" | "outline" | "success" | "warning" | "info" => {
    const typeName = name.toLowerCase();
    if (typeName.includes('standard')) return "info";
    if (typeName.includes('performance')) return "warning";
    if (typeName.includes('premium')) return "success";
    return "secondary";
  };

  // Get storage capacity and type from name or specs
  const getStorageInfo = (storage: ComponentOption): { capacity: string; type: string } => {
    let capacity = "N/A";
    let type = "Padrão";
    
    // Try to extract from specs first
    if (storage.specs && storage.specs.length > 0) {
      const capacitySpec = storage.specs.find(spec => spec.includes('Capacidade:'));
      if (capacitySpec) {
        capacity = capacitySpec.replace('Capacidade:', '').trim();
      }
      
      const typeSpec = storage.specs.find(spec => spec.includes('Tipo:'));
      if (typeSpec) {
        type = typeSpec.replace('Tipo:', '').trim();
        // Remove "Storage" prefix if present
        type = type.replace('Storage', '').trim();
      }
    }
    
    // If not in specs, try to extract from name
    if (capacity === "N/A") {
      const capacityMatch = storage.name.match(/(\d+)\s*GB/i);
      if (capacityMatch && capacityMatch[1]) {
        capacity = `${capacityMatch[1]} GB`;
      }
      
      const nameArr = storage.name.split(' ');
      if (nameArr.length > 1) {
        type = nameArr[1];
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
          <div key={storage.id} className="flex justify-between items-center group p-1.5 pl-2 rounded-md hover:bg-accent/40 transition-colors">
            <div className="flex items-center gap-2">
              <Badge variant={badgeVariant} className="text-xs">
                {type}
              </Badge>
              <p className="text-sm font-medium">{capacity}</p>
            </div>
            <p className="text-sm font-medium">{formatCurrency(storage.price)}</p>
          </div>
        );
      })}
    </div>
  );
}
