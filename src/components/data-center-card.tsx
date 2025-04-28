
import { ComponentOption, DataCenterOption } from "@/types/component";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataCenterCardProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function DataCenterCard({ 
  options, 
  selectedOption, 
  onSelectOption 
}: DataCenterCardProps) {
  return (
    <Card className="p-3">
      <CardContent className="p-0 space-y-3">
        <div>
          <h3 className="text-base font-medium">Localização do Data Center</h3>
        </div>
        <RadioGroup 
          value={selectedOption?.id || ""}
          onValueChange={(value) => {
            const option = options.find(opt => opt.id === value);
            if (option) {
              onSelectOption(option);
            }
          }}
          className="grid gap-1.5"
        >
          {options.map((option) => {
            const dcOption = option as DataCenterOption;
            const isSelected = selectedOption?.id === option.id;
            const badge = dcOption.metadata?.badge;
            
            return (
              <TooltipProvider key={option.id}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <label
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all",
                        "hover:bg-primary/5 active:scale-[0.99]",
                        isSelected 
                          ? "border-primary bg-primary/10 ring-1 ring-primary" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Globe className={cn(
                          "h-4 w-4",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="font-medium">{option.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {badge && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            badge === "Recomendado" ? "bg-primary/20 text-primary" : "bg-blue-600/10 text-blue-600"
                          )}>
                            {badge}
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
                    <div className="space-y-2">
                      <p className="text-sm">{option.description}</p>
                      {dcOption.metadata?.features && dcOption.metadata.features.length > 0 && (
                        <ul className="text-xs space-y-1">
                          {dcOption.metadata.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-primary/70" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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

