
import { ServerComponent, ComponentOption } from "@/data/server-components";
import * as Icons from "lucide-react";
import { ComponentCard, ComponentTooltip } from "./component-card";

interface WizardStepProps {
  component: ServerComponent;
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function WizardStep({ component, selectedOption, onSelectOption }: WizardStepProps) {
  // Dynamic icon lookup
  const IconComponent = (Icons as any)[component.icon] || Icons.HelpCircle;
  
  return (
    <div className="wizard-step space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{component.friendlyName}</h2>
          <ComponentTooltip content={component.description}>
            <p className="text-muted-foreground flex items-center">
              {component.description}
              <Icons.HelpCircle className="h-4 w-4 ml-1 text-muted-foreground/50 hover:text-primary" />
            </p>
          </ComponentTooltip>
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
