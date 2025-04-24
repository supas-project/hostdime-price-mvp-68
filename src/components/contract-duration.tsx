
import { ComponentOption } from "@/data/server-components";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

interface ContractDurationProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function ContractDuration({ 
  options, 
  selectedOption, 
  onSelectOption 
}: ContractDurationProps) {
  return (
    <Card className="p-6">
      <CardContent className="p-0 space-y-4">
        <RadioGroup 
          value={selectedOption?.id || ""}
          onValueChange={(value) => {
            const option = options.find(opt => opt.id === value);
            if (option) onSelectOption(option);
          }}
        >
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = selectedOption?.id === option.id;
              const discount = option.metadata?.discount || 0;
              
              return (
                <div
                  key={option.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border 
                    ${isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'}
                    cursor-pointer transition-colors
                  `}
                  onClick={() => onSelectOption(option)}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="cursor-pointer font-medium">
                      {option.name}
                    </Label>
                  </div>
                  
                  {discount > 0 && (
                    <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
