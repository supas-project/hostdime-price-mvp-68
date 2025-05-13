
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpTooltip } from "./help-tooltip";
import { formatCurrency } from "@/lib/utils";
import { Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Option {
  id: string;
  name: string;
  price: number;
  description?: string;
  specs?: string[];
  type?: string;
}

interface OptionGroup {
  group: string;
  options: Option[];
  tooltip?: string;
}

interface ComponentSelectorProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  tooltip?: string;
  highlightSelection?: boolean;
  groupedOptions?: OptionGroup[];
}

export function ComponentSelector({
  label,
  options,
  value,
  onChange,
  tooltip,
  highlightSelection,
  groupedOptions
}: ComponentSelectorProps) {
  const [localValue, setLocalValue] = useState(value);
  
  // Sync external value with internal state
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const shouldShowPrice = (option: Option) => {
    return option.type !== "DataCenter" && option.type !== "Contrato";
  };

  const renderOption = (option: Option) => (
    <SelectItem
      key={option.id}
      value={option.id}
      className={cn(
        "flex items-center justify-between py-2 px-3 hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] cursor-pointer text-white",
        "transition-colors duration-200 min-h-[44px]", // Improved touch target
        highlightSelection && option.id === localValue && "bg-primary/10 border-l-2 border-primary"
      )}
    >
      <div className="flex justify-between items-center w-full gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
          <span className="truncate text-xs sm:text-sm">{option.name}</span>
          {option.specs && (
            <HelpTooltip
              title={option.name}
              description={option.specs.join('\n• ')}
              iconOnly
            />
          )}
        </div>
        {shouldShowPrice(option) && (
          <span className="text-[#f58220] font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
            {formatCurrency(option.price)}
          </span>
        )}
      </div>
    </SelectItem>
  );

  return (
    <div className="flex flex-col gap-2 sm:gap-4 w-full">
      {label && (
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 sm:h-5 sm:w-5 text-[#f58220]" />
          <label className="text-sm sm:text-base font-medium text-white flex items-center gap-2">
            {label}
            {tooltip && (
              <HelpTooltip
                title={`Sobre: ${label}`}
                description={tooltip}
                iconOnly
              />
            )}
          </label>
        </div>
      )}

      <Select value={localValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors min-h-[40px] text-xs sm:text-sm py-2 px-2.5 sm:py-2.5 sm:px-4">
          <SelectValue placeholder={`Escolha o ${label?.toLowerCase() || 'componente'} ideal para você`} />
        </SelectTrigger>
        
        <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a] z-[1060] w-[var(--radix-select-trigger-width)] min-w-[200px] overflow-hidden">
          <ScrollArea className="max-h-[280px] sm:max-h-[320px] overflow-y-auto">
            {groupedOptions ? (
              groupedOptions.map((group) => (
                <SelectGroup key={group.group} className="py-1">
                  <SelectLabel className="flex items-center justify-between px-3 py-2 text-xs sm:text-sm">
                    {group.group}
                    {group.tooltip && (
                      <HelpTooltip
                        title={group.group}
                        description={group.tooltip}
                        iconOnly
                      />
                    )}
                  </SelectLabel>
                  {group.options.map(renderOption)}
                </SelectGroup>
              ))
            ) : (
              options.map(renderOption)
            )}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
