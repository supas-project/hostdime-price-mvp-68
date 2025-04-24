
import { ServerComponent } from "@/data/server-components";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  components: ServerComponent[];
  currentStep: number;
  completedSteps?: boolean[];
}

export function ProgressIndicator({ 
  components, 
  currentStep,
  completedSteps = [] 
}: ProgressIndicatorProps) {
  const completedCount = completedSteps.filter(Boolean).length;
  const progress = (completedCount / components.length) * 100;
  const currentComponent = components[currentStep];

  return (
    <div className="space-y-2 mb-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Etapa {currentStep + 1} de {components.length} - {currentComponent.friendlyName}
        </p>
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">
            {completedCount} de {components.length} completo
          </span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded",
            progress === 100 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {Math.round(progress)}%
            {progress === 100 && <Check className="h-3 w-3 inline ml-1" />}
          </span>
        </div>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}
