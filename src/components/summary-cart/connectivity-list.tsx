
import React from 'react';
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectivityListProps {
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } };
  onRemoveItem?: (itemId: string) => void;
}

export function ConnectivityList({ connectivityItems, onRemoveItem }: ConnectivityListProps) {
  const items = Object.entries(connectivityItems).filter(([_, item]) => item && item.option);
  
  if (!items.length) return null;

  return (
    <>
      {items.map(([itemId, item]) => (
        <div 
          key={item.option.id} 
          className="flex justify-between items-center group animate-fade-in hover:bg-accent/20 p-1 rounded-md transition-colors"
        >
          <p className="text-sm font-medium">
            {item.quantity > 1 ? `${item.quantity}x ${item.option.name}` : item.option.name}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{formatCurrency(item.option.price * item.quantity)}</p>
            
            {onRemoveItem && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemoveItem(itemId)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remover item</span>
              </Button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
