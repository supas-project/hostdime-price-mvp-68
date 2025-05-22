
import React from 'react';
import { ComponentOption } from "@/types/component";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface DataCenterItemProps {
  component: ComponentOption | undefined;
}

export function DataCenterItem({ component }: DataCenterItemProps) {
  if (!component) return null;
  
  // Log para debug
  console.log("[DataCenterItem] Renderizando:", component.name, component);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="h-3.5 w-3.5" />
        <h3 className="font-medium text-xs sm:text-sm">Data Center</h3>
      </div>
      
      <div className={cn(
        "pl-2 animate-fade-in",
        "hover:bg-accent/20 p-1 rounded-md transition-colors"
      )}>
        <div className="flex justify-between items-center">
          <p className="text-sm">{component.name}</p>
          <p className="text-sm font-medium">{formatCurrency(component.price || 0)}</p>
        </div>
        
        {component.metadata?.location && (
          <p className="text-xs text-muted-foreground">
            {component.metadata.location}
          </p>
        )}
      </div>
    </div>
  );
}
