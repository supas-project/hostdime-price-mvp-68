
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpTooltip } from "./help-tooltip";
import { formatCurrency } from "@/lib/utils";
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
              className="flex items-center justify-between py-2 px-3 hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] cursor-pointer text-white"
            >
              <div className="flex justify-between items-center w-full gap-4">
                <span>{option.name}</span>
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
