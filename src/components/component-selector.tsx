
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
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
        {tooltip && <HelpTooltip title="Ajuda" description={tooltip} />}
      </div>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              <div className="flex justify-between items-center gap-4">
                <span>{option.name}</span>
                {showPrice && (
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(option.price)}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
