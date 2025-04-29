
import React from 'react';
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StandardComponentListProps {
  components: ComponentOption[];
  onRemoveItem?: (type: string) => void;
}

export function StandardComponentList({ components, onRemoveItem }: StandardComponentListProps) {
  if (!components.length) return null;

  return (
    <>
      {components.map((component) => (
        <div 
          key={component.id} 
          className="flex justify-between items-center group animate-fade-in hover:bg-accent/20 p-1 rounded-md transition-colors"
        >
          <p className="text-sm font-medium">{component.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{formatCurrency(component.price)}</p>
            
            {onRemoveItem && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemoveItem(component.type.toLowerCase())}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remover {component.name}</span>
              </Button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
