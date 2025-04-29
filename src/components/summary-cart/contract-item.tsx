
import React from 'react';
import { ComponentOption } from "@/types/component";

interface ContractItemProps {
  component: ComponentOption;
}

export function ContractItem({ component }: ContractItemProps) {
  if (!component) return null;

  return (
    <div className="flex justify-between items-center group animate-fade-in">
      <div>
        <p className="text-sm font-medium flex items-center gap-2">
          {component.name}
          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
            Contrato
          </span>
        </p>
        {component.metadata?.discount && (
          <p className="text-xs text-green-500">
            Desconto de {component.metadata.discount}% incluído
          </p>
        )}
      </div>
      <span className="text-sm text-muted-foreground">Incluído</span>
    </div>
  );
}
