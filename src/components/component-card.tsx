
import { ComponentOption } from "@/data/server-components";
import { Card } from "@/components/ui/card";
import { ComponentSelector } from "./component-selector";
import { QuantitySelector } from "./quantity-selector";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface ComponentCardProps {
  option: ComponentOption;
  isSelected: boolean;
  onSelect: (option: ComponentOption) => void;
}

export function ComponentCard({ option, isSelected, onSelect }: ComponentCardProps) {
  const [quantity, setQuantity] = useState(1);
  
  return (
    <Card className="p-6 space-y-6">
      <ComponentSelector
        label={option.name}
        options={[option]}
        value={option.id}
        onChange={() => onSelect(option)}
        tooltip={option.description}
      />
      
      {isSelected && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Quantidade</span>
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={10}
            />
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-semibold text-primary">
              {formatCurrency(option.price * quantity)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
