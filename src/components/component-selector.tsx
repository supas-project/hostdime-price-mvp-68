
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { HelpTooltip } from "./help-tooltip";
import { Badge } from "./ui/badge";
import { usePaybackPricing } from "@/hooks/usePaybackPricing";

interface ComponentSelectorProps {
  label: string;
  options: ComponentOption[];
  value: string;
  onChange: (value: string) => void;
  tooltip?: string;
  highlightSelection?: boolean;
}

export function ComponentSelector({
  label,
  options,
  value,
  onChange,
  tooltip,
  highlightSelection = false
}: ComponentSelectorProps) {
  const { calculatePriceWithPayback, getPaybackInfo, hasActiveContract } = usePaybackPricing();

  const shouldShowPrice = (option: ComponentOption) => {
    return option.type !== "DataCenter" && option.type !== "Contrato" && option.price > 0;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">{label}</label>
        {tooltip && (
          <HelpTooltip
            title={label}
            description={tooltip}
            iconOnly
          />
        )}
      </div>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`w-full ${highlightSelection && value ? 'ring-2 ring-orange-500' : ''}`}>
          <SelectValue placeholder={`Escolha ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {options.map((option) => {
            const paybackInfo = getPaybackInfo(option);
            const displayPrice = calculatePriceWithPayback(option);
            
            return (
              <SelectItem
                key={option.id}
                value={option.id}
                className="flex items-center justify-between py-3 px-3"
              >
                <div className="flex justify-between items-center w-full gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col">
                      <span className="font-medium">{option.name}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      )}
                    </div>
                    
                    {option.specs && (
                      <HelpTooltip
                        title={option.name}
                        description={option.specs.join('\n')}
                        iconOnly
                      />
                    )}
                  </div>
                  
                  {shouldShowPrice(option) && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        {paybackInfo?.hasPayback && (
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(paybackInfo.originalPrice)}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-bold text-green-600">
                                {formatCurrency(displayPrice)}
                              </span>
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                {paybackInfo.paybackValue}x
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                        {!paybackInfo?.hasPayback && (
                          <span className="font-bold text-orange-600">
                            {formatCurrency(displayPrice)}
                          </span>
                        )}
                      </div>
                      
                      {hasActiveContract && !option.isHardware && (
                        <span className="text-xs text-muted-foreground">sem payback</span>
                      )}
                    </div>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
