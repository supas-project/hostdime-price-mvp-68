
import { ServerComponent } from "@/data/server-components";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  components: ServerComponent[];
  currentStep: number;
}

export function ProgressIndicator({ components, currentStep }: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / components.length) * 100;
  const currentComponent = components[currentStep];

  return (
    <div className="space-y-2 mb-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Etapa {currentStep + 1} de {components.length} - {currentComponent.friendlyName}
        </p>
        <span className="text-sm font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-1" />
    </div>
  );
}
