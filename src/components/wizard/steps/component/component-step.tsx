
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { HelpTooltip } from "@/components/help-tooltip";
import * as Icons from "lucide-react";

interface ComponentStepProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
  componentType: string;
}

export function ComponentStep({
  options,
  selectedOption,
  onSelectOption,
  componentType
}: ComponentStepProps) {
  // Determina o ícone apropriado para o tipo de componente
  const getIconComponent = () => {
    switch (componentType) {
      case "Processador": return Icons.Cpu;
      case "Armazenamento": return Icons.HardDrive;
      case "Conectividade": return Icons.Wifi;
      default: return Icons.CircleDot;
    }
  };
  
  const IconComponent = getIconComponent();

  return (
    <div className="grid grid-cols-1 gap-4">
      {options.map((option) => {
        const isSelected = selectedOption?.id === option.id;
        
        return (
          <Card
            key={option.id}
            className={cn(
              "p-4 hover:border-primary/50 transition-all duration-200 cursor-pointer",
              isSelected ? "ring-1 ring-primary bg-primary/5" : ""
            )}
            onClick={() => onSelectOption(option)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IconComponent className={cn(
                  "h-5 w-5",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <h3 className={cn(
                  "font-medium text-base",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {option.name}
                </h3>
              </div>
              <span className="text-base font-medium text-primary">
                {formatCurrency(option.price)}
              </span>
            </div>
            
            {option.description && (
              <div className="flex items-start justify-between mt-2">
                <p className="text-sm text-muted-foreground mr-8">
                  {option.description}
                </p>
                <HelpTooltip 
                  title={option.name}
                  description={option.description}
                  icon
                />
              </div>
            )}
            
            {option.specs && option.specs.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {option.specs.map((spec, index) => (
                    <div key={index} className="flex items-center text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary/50 mr-2"></div>
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
