
import { ServerComponent } from "@/data/server-components";
import { Progress } from "@/components/ui/progress";
import { Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

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
  // Ensure we count all completed steps correctly
  const completedCount = completedSteps.filter(Boolean).length;
  
  // Calculate progress percentage based on completed steps
  const progress = Math.min(100, (completedCount / components.length) * 100);
  
  const currentComponent = components[currentStep];

  return (
    <div className="space-y-3 mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
            completedSteps[currentStep] ? "bg-primary/20 text-primary" : "bg-muted text-foreground"
          )}>
            {currentStep + 1}
          </div>
          <div>
            <p className="font-medium">
              {currentComponent.friendlyName}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 -mt-0.5">
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[250px]">{currentComponent.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            <p className="text-xs text-muted-foreground">Etapa {currentStep + 1} de {components.length}</p>
          </div>
        </div>
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
      
      <div className="relative">
        <Progress value={progress} className="h-2 rounded-full" />
        <div className="absolute top-full mt-1 flex justify-between w-full">
          {components.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex flex-col items-center",
                idx === 0 ? "ml-0" : "",
                idx === components.length - 1 ? "mr-0" : "",
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full -mt-3",
                completedSteps[idx] ? "bg-primary" : 
                currentStep === idx ? "bg-primary-hover" : "bg-muted"
              )}></div>
              {(idx === 0 || idx === components.length - 1 || idx === Math.floor(components.length / 2)) && (
                <span className="text-[10px] text-muted-foreground mt-1">{idx + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
