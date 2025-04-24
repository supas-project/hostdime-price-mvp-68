
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpTooltip } from "./help-tooltip";
import { formatCurrency } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Cpu } from "lucide-react";

interface Option {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface ComponentSelectorProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  tooltip?: string;
}

export function ComponentSelector({ 
  label, 
  options, 
  value, 
  onChange, 
  tooltip
}: ComponentSelectorProps) {
  const selectedOption = options.find(opt => opt.id === value);

  const formatCPUDescription = (option: Option) => {
    const [name, specs] = option.name.split('(');
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{name}</span>
        {specs && (
          <span className="text-sm text-muted-foreground">
            ({specs}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Cpu className="h-5 w-5 text-[#f58220]" />
        <label className="text-base font-medium text-white">
          {label}
          {tooltip && (
            <span className="ml-1">
              <HelpTooltip 
                title="Mais detalhes"
                description={tooltip}
              />
            </span>
          )}
        </label>
      </div>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
          <SelectValue placeholder="Escolha o processador ideal para você" />
        </SelectTrigger>
        <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a]">
          {options.map((option) => (
            <SelectItem 
              key={option.id} 
              value={option.id}
              className="flex justify-between items-start py-3 px-3 hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] cursor-pointer"
            >
              <div className="flex justify-between items-start w-full gap-4">
                <div className="flex-1">
                  {formatCPUDescription(option)}
                  {option.description && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs text-[#f58220] hover:underline mt-1 block">
                            Ver detalhes
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#2a2a2a] text-white border-[#3a3a3a]">
                          <p className="text-sm">{option.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

