
import React from "react";
import { ComponentOption } from "@/types/component";
import { QuantitySelector } from "@/components/quantity-selector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CoreSelectorProps {
  option: ComponentOption;
  coreCount: number;
  onCoreCountChange: (count: number) => void;
  onRemove: () => void;
}

export function CoreSelector({
  option,
  coreCount,
  onCoreCountChange,
  onRemove
}: CoreSelectorProps) {
  const unitPrice = option.metadata?.unitPrice || option.price;
  const licensesNeeded = Math.ceil(coreCount / 2);
  const totalPrice = unitPrice * licensesNeeded;

  return (
    <Card className="p-4 border-2 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{option.name}</h4>
          <p className="text-xs text-muted-foreground">
            Licenciamento por 2 cores - R$ {unitPrice.toFixed(2)} por licença
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Cores do Processador:</span>
          <QuantitySelector
            value={coreCount}
            onChange={onCoreCountChange}
            min={2}
            max={128}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-muted-foreground">Cores: {coreCount}</div>
            <div className="text-muted-foreground">Licenças: {licensesNeeded}</div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-muted-foreground">Preço unitário: R$ {unitPrice.toFixed(2)}</div>
            <div className="font-semibold text-primary">Total: R$ {totalPrice.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
