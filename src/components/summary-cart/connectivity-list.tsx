
import React, { useEffect } from 'react';
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectivityItemsMap } from '@/types/wizard';

interface ConnectivityListProps {
  connectivityItems: ConnectivityItemsMap;
  onRemoveItem?: (itemId: string) => void;
}

export function ConnectivityList({ connectivityItems, onRemoveItem }: ConnectivityListProps) {
  const items = Object.entries(connectivityItems).filter(([_, item]) => item && item.option);
  
  // Debug para verificar os itens recebidos
  useEffect(() => {
    console.log("ConnectivityList: Rendering with", items.length, "items");
    
    if (items.length > 0) {
      // Log detalhes dos itens para debugging
      items.forEach(([itemId, item]) => {
        console.log(`ConnectivityItem: ${itemId} - ${item.option.name} (${item.option.subtype}) - Quantity: ${item.quantity}`);
      });
    }
  }, [connectivityItems]);
  
  if (!items.length) return null;

  // Organizar itens por tipo (porta/ip) para exibição mais clara
  const portItems = items.filter(([_, item]) => item.option.subtype === 'porta');
  const ipItems = items.filter(([_, item]) => item.option.subtype === 'ip');

  return (
    <>
      {/* Exibir primeiro os itens de porta */}
      {portItems.map(([itemId, item]) => (
        <div 
          key={item.option.id} 
          className="flex justify-between items-center group animate-fade-in hover:bg-accent/20 py-1 px-1.5 rounded-md transition-colors"
        >
          <p className="text-sm font-medium">
            <span className="text-muted-foreground text-xs">Porta: </span>
            {item.quantity > 1 ? `${item.quantity}x ${item.option.name}` : item.option.name}
          </p>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium">{formatCurrency(item.option.price * item.quantity)}</p>
            
            {onRemoveItem && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemoveItem(itemId)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remover item</span>
              </Button>
            )}
          </div>
        </div>
      ))}
      
      {/* Em seguida, exibir os blocos de IP */}
      {ipItems.map(([itemId, item]) => (
        <div 
          key={item.option.id} 
          className="flex justify-between items-center group animate-fade-in hover:bg-accent/20 py-1 px-1.5 rounded-md transition-colors"
        >
          <p className="text-sm font-medium">
            <span className="text-muted-foreground text-xs">IP: </span>
            {item.quantity > 1 ? `${item.quantity}x ${item.option.name}` : item.option.name}
          </p>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium">{formatCurrency(item.option.price * item.quantity)}</p>
            
            {onRemoveItem && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
