
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpTooltip } from "./help-tooltip";
import { formatCurrency } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
  price: number;
  description?: string;
  details?: string;
}

interface ComponentSelectorProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  tooltip?: string;
  showPrice?: boolean;
}

export function ComponentSelector({ 
  label, 
  options, 
  value, 
  onChange, 
  tooltip,
  showPrice = true 
}: ComponentSelectorProps) {
  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-lg font-medium text-white">
          {label}
        </label>
        {tooltip && (
          <HelpTooltip 
            title="Mais detalhes"
            description={tooltip}
          />
        )}
      </div>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-[#0A0A0A] border-[#1A1A1A] text-white h-[60px]">
          <div className="flex justify-between items-center w-full">
            <span className="text-white font-medium">
              {selectedOption?.name || "Escolha o processador ideal"}
            </span>
            {selectedOption && (
              <span className="text-[#F58220] font-medium">
                {formatCurrency(selectedOption.price)}
              </span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="bg-[#0A0A0A] border-[#1A1A1A] w-full">
          {options.map((option) => (
            <SelectItem 
              key={option.id} 
              value={option.id}
              className="flex justify-between items-center py-3 px-4 hover:bg-[#111111] focus:bg-[#111111] cursor-pointer"
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-white font-medium">{option.name}</span>
                <span className="text-[#F58220] font-medium">{formatCurrency(option.price)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
