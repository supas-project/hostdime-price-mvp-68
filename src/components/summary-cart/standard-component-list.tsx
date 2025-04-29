
import React from 'react';
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";

interface StandardComponentListProps {
  components: ComponentOption[];
}

export function StandardComponentList({ components }: StandardComponentListProps) {
  if (!components.length) return null;

  return (
    <>
      {components.map((component) => (
        <div key={component.id} className="flex justify-between items-center group animate-fade-in">
          <p className="text-sm font-medium">{component.name}</p>
          <p className="text-sm font-medium">{formatCurrency(component.price)}</p>
        </div>
      ))}
    </>
  );
}
