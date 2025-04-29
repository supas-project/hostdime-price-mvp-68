
import React from 'react';
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";

interface ExternalStorageListProps {
  storageItems: ComponentOption[];
}

export function ExternalStorageList({ storageItems }: ExternalStorageListProps) {
  const filteredItems = storageItems.filter(storage => storage && storage.price > 0);
  
  if (!filteredItems.length) return null;

  return (
    <>
      {filteredItems.map((storage) => (
        <div key={storage.id} className="flex justify-between items-center group animate-fade-in">
          <p className="text-sm font-medium">{storage.name}</p>
          <p className="text-sm font-medium">{formatCurrency(storage.price)}</p>
        </div>
      ))}
    </>
  );
}
