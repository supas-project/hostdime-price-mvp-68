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
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm text-slate-400">
          {label}
        </label>
        {tooltip && (
          <HelpTooltip 
            title="Ajuda"
            description={tooltip}
          />
        )}
      </div>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-[#0A0A0A] border-[#1A1A1A] text-white hover:bg-[#111111] transition-colors">
          <SelectValue placeholder="Escolha o processador ideal" />
        </SelectTrigger>
        <SelectContent className="bg-[#0A0A0A] border-[#1A1A1A]">
          {options.map((option) => (
            <SelectItem 
              key={option.id} 
              value={option.id}
              className="py-2.5 px-3 focus:bg-[#111111] hover:bg-[#111111] cursor-pointer transition-colors data-[state=checked]:bg-[#111111]"
            >
              <div className="flex flex-col gap-0.5">
                <div className="font-medium text-white">{option.name}</div>
                {option.description && (
                  <div className="text-sm text-slate-400">
                    {option.description}
                  </div>
                )}
                {showPrice && (
                  <div className="text-sm text-primary mt-1">
                    {formatCurrency(option.price)}
                  </div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
