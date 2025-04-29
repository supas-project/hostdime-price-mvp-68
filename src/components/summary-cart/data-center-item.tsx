
import React from 'react';
import { ComponentOption } from "@/types/component";
import { Check } from "lucide-react";

interface DataCenterItemProps {
  component: ComponentOption;
}

export function DataCenterItem({ component }: DataCenterItemProps) {
  if (!component) return null;

  return (
    <div className="flex justify-between items-center group animate-fade-in">
      <div>
        <p className="text-sm font-medium flex items-center gap-2">
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
      </div>
      <span className="text-sm text-muted-foreground">Incluído</span>
    </div>
  );
}
