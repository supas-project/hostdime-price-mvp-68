
import { ServerComponent, ComponentOption } from "@/data/server-components";
import * as Icons from "lucide-react";
import { ComponentSelector } from "./component-selector";
import { HelpTooltip } from "./help-tooltip";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WizardStepProps {
  component: ServerComponent;
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function WizardStep({ component, selectedOption, onSelectOption }: WizardStepProps) {
  const IconComponent = (Icons as any)[component.icon] || Icons.HelpCircle;
  const shouldShowPrice = (option: ComponentOption) => {
    return option.type !== "DataCenter" && option.type !== "Contrato";
  };
  
  return (
    <div className="wizard-step space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {component.friendlyName}
            <HelpTooltip 
              title="Saiba mais"
              description={component.description}
            />
          </h2>
          <p className="text-sm text-muted-foreground">
            {component.description.slice(0, 100)}
            {component.description.length > 100 && '...'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {component.type === "Processador" && (
          <ComponentSelector
            label="Escolha o processador ideal para você"
            options={component.options}
            value={selectedOption?.id || ""}
            onChange={(value) => {
              const option = component.options.find(opt => opt.id === value);
              if (option) onSelectOption(option);
            }}
            tooltip={component.description}
          />
        )}
        
        {component.type !== "Processador" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
            {component.options.map((option) => (
              <div 
                key={option.id}
                className={cn(
                  "bg-card p-4 rounded-lg cursor-pointer border border-transparent transition-all duration-200 hover-lift",
                  "hover:border-primary hover:border-opacity-50",
                  selectedOption?.id === option.id && "border-primary shadow-md shadow-primary/15"
                )}
                onClick={() => onSelectOption(option)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className="h-5 w-5 text-primary" />
                  <div className="font-medium text-white">{option.name}</div>
                  <HelpTooltip 
                    title="Mais detalhes"
                    description={option.description || ""}
                    icon={true}
                  />
                </div>
                
                <div className="flex items-center justify-between bg-black/30 p-2 rounded">
                  <span className="text-sm text-white truncate">{option.name}</span>
                  {shouldShowPrice(option) && (
                    <span className="text-primary font-medium whitespace-nowrap">
                      {formatCurrency(option.price)}
                    </span>
                  )}
                </div>
                
                {option.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {option.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
