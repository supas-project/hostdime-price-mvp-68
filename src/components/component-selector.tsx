
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-lg font-medium text-white">
            {label}
          </label>
          {tooltip && (
            <HelpTooltip 
              title="Ajuda"
              description={tooltip}
            />
          )}
        </div>
      </div>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-background/95 border-slate-800 text-white">
          <SelectValue placeholder="Escolha o processador ideal para você" />
        </SelectTrigger>
        <SelectContent className="bg-background/95 border-slate-800">
          {options.map((option) => (
            <SelectItem 
              key={option.id} 
              value={option.id}
              className="py-3 hover:bg-slate-800 focus:bg-slate-800"
            >
              <div className="flex flex-col gap-1">
                <div className="font-medium text-white">{option.name}</div>
                {option.description && (
                  <div className="text-sm text-slate-400">
                    {option.description}
                  </div>
                )}
                {showPrice && (
                  <div className="text-sm font-medium text-primary mt-1">
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
