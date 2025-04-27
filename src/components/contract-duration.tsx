
import { ComponentOption } from "@/types/component";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { HelpTooltip } from "@/components/help-tooltip";

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
  const handleContractSelection = (value: string) => {
    const option = options.find(opt => opt.id === value);
    if (option) {
      onSelectOption(option);
      toast.success(`Contrato de ${option.name} selecionado`);
    }
  };

  return (
    <Card className="p-6">
      <CardContent className="p-0 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-base font-medium">Duração do Contrato</h3>
          <HelpTooltip 
            title="Duração do Contrato"
            description="Quanto maior o tempo de contrato, maior o desconto aplicado ao valor mensal do servidor."
          />
        </div>
        <RadioGroup 
          value={selectedOption?.id || ""}
          onValueChange={handleContractSelection}
        >
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = selectedOption?.id === option.id;
              const discount = option.metadata?.discount || 0;
              
              return (
                <label
                  key={option.id}
                  htmlFor={option.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer
                    ${isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'}
                  `}
                  onClick={() => handleContractSelection(option.id)}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <span className="font-medium">
                      {option.name}
                    </span>
                  </div>
                  
                  {discount > 0 && (
                    <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                      {discount}% OFF
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
