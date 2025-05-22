
import React from 'react';
import { ComponentOption } from "@/types/component";
import { Check, MapPin } from "lucide-react";

interface DataCenterItemProps {
  component: ComponentOption;
}

export function DataCenterItem({ component }: DataCenterItemProps) {
  if (!component) return null;

  return (
    <div className="flex justify-between items-center group animate-fade-in hover:bg-accent/20 p-1 rounded-md transition-colors">
      <div>
        <p className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {component.name}
          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
            Data Center
          </span>
        </p>
        {component.metadata?.features && (
          <div className="mt-1">
            {component.metadata.features.map((feature, index) => (
              <p key={index} className="text-xs text-muted-foreground flex items-center">
                <Check className="h-3 w-3 text-primary mr-1" />
                {feature}
              </p>
            ))}
          </div>
        )}
        {component.description && (
          <p className="text-xs text-muted-foreground mt-1">{component.description}</p>
        )}
      </div>
      <span className="text-sm text-muted-foreground">Incluído</span>
    </div>
  );
}
