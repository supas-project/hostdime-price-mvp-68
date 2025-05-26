
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
        "flex items-center justify-between py-3 px-4 hover:bg-[#f58220]/10 focus:bg-[#f58220]/10 cursor-pointer text-white",
        "transition-all duration-300 min-h-[48px] group hover:shadow-md", // Micro-interação aprimorada
        highlightSelection && option.id === localValue && "bg-[#f58220]/20 border-l-4 border-[#f58220] shadow-lg" // Destaque estratégico
      )}
    >
      <div className="flex justify-between items-center w-full gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <span className={cn(
            "truncate text-sm sm:text-base transition-all duration-200",
            "group-hover:text-[#f58220] group-hover:font-medium" // Micro-interação de texto
          )}>
            {option.name}
          </span>
          {option.specs && (
            <HelpTooltip
              title={option.name}
              description={option.specs.join('\n• ')}
              iconOnly
            />
          )}
        </div>
        {shouldShowPrice(option) && (
          <span className={cn(
            "font-semibold text-sm sm:text-base whitespace-nowrap flex-shrink-0 transition-all duration-200",
            "text-[#f58220] group-hover:scale-105" // Destaque de preço com micro-interação
          )}>
            {formatCurrency(option.price)}
          </span>
        )}
      </div>
    </SelectItem>
  );

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      {label && (
        <div className="flex items-center gap-3 p-1">
          <div className={cn(
            "p-2 rounded-lg bg-[#f58220]/10 transition-all duration-300",
            "hover:bg-[#f58220]/20 hover:shadow-md" // Micro-interação no ícone
          )}>
            <Server className="h-5 w-5 sm:h-6 sm:w-6 text-[#f58220]" />
          </div>
          <label className="text-base sm:text-lg font-semibold text-white flex items-center gap-3">
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
        <SelectTrigger className={cn(
          "w-full bg-[#1e1e1e] border-2 border-[#2a2a2a] text-white min-h-[48px] text-sm sm:text-base py-3 px-4",
          "transition-all duration-300 hover:border-[#f58220] hover:shadow-lg hover:shadow-[#f58220]/20", // Micro-interação estratégica
          "focus:border-[#f58220] focus:ring-2 focus:ring-[#f58220]/30" // Estados de foco consistentes
        )}>
          <SelectValue placeholder={`Escolha o ${label?.toLowerCase() || 'componente'} ideal para você`} />
        </SelectTrigger>
        
        <SelectContent className={cn(
          "bg-[#1e1e1e] border-2 border-[#2a2a2a] z-[1060] w-[var(--radix-select-trigger-width)] min-w-[250px]",
          "shadow-xl shadow-black/40 rounded-xl overflow-hidden" // Sombras consistentes
        )}>
          <ScrollArea className="max-h-[300px] sm:max-h-[350px] overflow-y-auto">
            {groupedOptions ? (
              groupedOptions.map((group) => (
                <SelectGroup key={group.group} className="py-2">
                  <SelectLabel className={cn(
                    "flex items-center justify-between px-4 py-3 text-sm sm:text-base",
                    "text-[#f58220] font-semibold border-b border-[#2a2a2a]" // Consistência na tipografia
                  )}>
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
