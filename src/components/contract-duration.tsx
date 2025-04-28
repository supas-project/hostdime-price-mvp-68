
import { ComponentOption } from "@/types/component";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <Card className="p-3">
      <CardContent className="p-0 space-y-3">
        <div>
          <h3 className="text-base font-medium">Duração do Contrato</h3>
        </div>
        <RadioGroup 
          value={selectedOption?.id || ""}
          onValueChange={handleContractSelection}
          className="grid gap-1.5"
        >
          {options.map((option) => {
            const isSelected = selectedOption?.id === option.id;
            const discount = option.metadata?.discount || 0;
            
            return (
              <TooltipProvider key={option.id}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <label
                      className={`
                        flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all
                        hover:bg-primary/5 active:scale-[0.99]
                        ${isSelected 
                          ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                          : 'border-border hover:border-primary/50'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <span className="font-medium">{option.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {discount > 0 && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            {discount}% OFF
                          </span>
                        )}
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right"
                    className="max-w-[280px] p-3"
                  >
                    <p className="text-sm">{option.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

