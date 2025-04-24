
import { ServerComponent } from "@/data/server-components";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardHeaderProps {
  components: ServerComponent[];
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps?: boolean[];
}

export function WizardHeader({ 
  components, 
  currentStep, 
  onStepClick,
  completedSteps = []
}: WizardHeaderProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {components.map((component, index) => {
        const IconComponent = (Icons as any)[component.icon] || Icons.HelpCircle;
        const isActive = index === currentStep;
        const isComplete = completedSteps[index];
        
        return (
          <button
            key={component.id}
            className={cn(
              "flex items-center space-x-2 py-2 px-4 rounded-xl transition-all",
              isActive && "bg-primary text-primary-foreground font-medium",
              isComplete && !isActive && "bg-primary/20 text-foreground",
              !isActive && !isComplete && "bg-card text-muted-foreground hover:bg-accent"
            )}
            onClick={() => onStepClick(index)}
          >
            <IconComponent className="h-4 w-4" />
            <span className="hidden sm:inline">{component.friendlyName}</span>
            {isComplete && !isActive && <Icons.Check className="h-4 w-4 ml-2" />}
          </button>
        );
      })}
    </div>
  );
}
