
import React from 'react';
import { ComponentOption } from "@/types/component";
import { Clock, Check } from "lucide-react";

interface ContractItemProps {
  component: ComponentOption;
}

export function ContractItem({ component }: ContractItemProps) {
  if (!component) return null;

  return (
    <div className="flex justify-between items-center group animate-fade-in hover:bg-accent/20 p-1 rounded-md transition-colors">
      <div className="space-y-1">
        <p className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          {component.name}
          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
            Contrato
          </span>
        </p>
        <p className="text-xs text-muted-foreground">{component.description}</p>
        {component.metadata?.discount ? (
          <p className="text-xs text-green-500 flex items-center">
            <Check className="h-3 w-3 mr-1" />
            Desconto de {component.metadata.discount}% incluído
          </p>
        ) : null}
      </div>
      <span className="text-sm text-muted-foreground">Incluído</span>
    </div>
  );
}
