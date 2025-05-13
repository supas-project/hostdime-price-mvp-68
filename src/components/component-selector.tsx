
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpTooltip } from "./help-tooltip";
import { formatCurrency } from "@/lib/utils";
import { Server } from "lucide-react";
import { cn } from "@/lib/utils";

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
        highlightSelection && option.id === localValue && "bg-primary/10 border-l-2 border-primary"
      )}
    >
      <div className="flex justify-between items-center w-full gap-4">
        <div className="flex items-center gap-2 max-w-[70%]">
          <span className="truncate">{option.name}</span>
          {option.specs && (
            <HelpTooltip
              title={option.name}
              description={option.specs.join('\n• ')}
              iconOnly
            />
          )}
        </div>
        {shouldShowPrice(option) && (
          <span className="text-[#f58220] font-medium whitespace-nowrap">
            {formatCurrency(option.price)}
          </span>
        )}
      </div>
    </SelectItem>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Server className="h-5 w-5 text-[#f58220]" />
        <label className="text-base font-medium text-white flex items-center gap-2">
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

      <Select value={localValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
          <SelectValue placeholder={`Escolha o ${label.toLowerCase()} ideal para você`} />
        </SelectTrigger>
        <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a] z-[1060] max-h-[280px] min-w-[250px] w-[var(--radix-select-trigger-width)]">
          {groupedOptions ? (
            groupedOptions.map((group) => (
              <SelectGroup key={group.group}>
                <SelectLabel className="flex items-center justify-between px-3 py-2">
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
        </SelectContent>
      </Select>
    </div>
  );
}
