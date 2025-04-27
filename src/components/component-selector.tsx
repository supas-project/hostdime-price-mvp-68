
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpTooltip } from "./help-tooltip";
import { formatCurrency } from "@/lib/utils";
import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
  price: number;
  description?: string;
  specs?: string[];
}

interface ComponentSelectorProps {
  label: string;
  options: Option[];
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
  highlightSelection
}: ComponentSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Cpu className="h-5 w-5 text-[#f58220]" />
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
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
          <SelectValue placeholder={`Escolha o ${label.toLowerCase()} ideal para você`} />
        </SelectTrigger>
        <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a] z-50">
          {options.map((option) => (
            <SelectItem 
              key={option.id} 
              value={option.id}
              className={cn(
                "flex items-center justify-between py-2 px-3 hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] cursor-pointer text-white",
                highlightSelection && option.id === value && "bg-primary/10 border-l-2 border-primary"
              )}
            >
              <div className="flex justify-between items-center w-full gap-4">
                <div className="flex items-center gap-2">
                  <span>{option.name}</span>
                  {option.specs && (
                    <HelpTooltip 
                      title={option.name}
                      description={option.specs.join('\n• ')}
                      iconOnly
                    />
                  )}
                </div>
                <span className="text-[#f58220] font-medium whitespace-nowrap">
                  {formatCurrency(option.price)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
