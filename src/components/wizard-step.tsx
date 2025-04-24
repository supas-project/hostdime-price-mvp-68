
import { ServerComponent, ComponentOption } from "@/data/server-components";
import * as Icons from "lucide-react";
import { ComponentCard } from "./component-card";
import { HelpTooltip } from "./help-tooltip";

interface WizardStepProps {
  component: ServerComponent;
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function WizardStep({ component, selectedOption, onSelectOption }: WizardStepProps) {
  const IconComponent = (Icons as any)[component.icon] || Icons.HelpCircle;
  
  return (
    <div className="wizard-step space-y-6">
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
          <p className="text-muted-foreground text-sm">
            Selecione a opção que melhor atende suas necessidades
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {component.options.map((option) => (
          <ComponentCard
            key={option.id}
            option={option}
            isSelected={selectedOption?.id === option.id}
            onSelect={onSelectOption}
          />
        ))}
      </div>
    </div>
  );
}
