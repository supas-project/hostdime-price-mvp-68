
import React from 'react';
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

  // Get storage capacity from name or specs
  const getCapacity = (storage: ComponentOption): string => {
    // Try to extract from specs first
    if (storage.specs && storage.specs.length > 0) {
      const capacitySpec = storage.specs.find(spec => spec.includes('Capacidade:'));
      if (capacitySpec) {
        return capacitySpec.replace('Capacidade:', '').trim();
      }
    }
    
    // If not in specs, try to extract from name
    const capacityMatch = storage.name.match(/(\d+)\s*GB/i);
    if (capacityMatch && capacityMatch[1]) {
      return `${capacityMatch[1]} GB`;
    }
    
    return "N/A";
  };

  return (
    <>
      {filteredItems.map((storage) => (
        <div key={storage.id} className="flex justify-between items-center group animate-fade-in">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{storage.name}</p>
            <Badge variant={getBadgeVariant(storage.name)} className="text-xs">
              {getCapacity(storage)}
            </Badge>
          </div>
          <p className="text-sm font-medium">{formatCurrency(storage.price)}</p>
        </div>
      ))}
    </>
  );
}
