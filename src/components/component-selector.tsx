
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpTooltip } from "./help-tooltip";
import { formatCurrency } from "@/lib/utils";

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

  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium text-white whitespace-nowrap min-w-32">
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
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full max-w-md bg-[#1e1e1e] border-[#2a2a2a] text-white h-10">
          <SelectValue placeholder="Selecione uma opção">
            {selectedOption ? selectedOption.name : "Selecione uma opção"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a]">
          {options.map((option) => (
            <SelectItem 
              key={option.id} 
              value={option.id}
              className="flex justify-between items-center py-2 px-3 hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] cursor-pointer"
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-white">{option.name}</span>
                <span className="text-[#f58220] font-medium ml-4">{formatCurrency(option.price)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
