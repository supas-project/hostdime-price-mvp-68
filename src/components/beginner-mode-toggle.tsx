
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { HelpCircle, Lightbulb } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useLocalStorage } from "@/hooks/component-selection/use-local-storage";

interface BeginnerModeToggleProps {
  className?: string;
}

export function BeginnerModeToggle({ className }: BeginnerModeToggleProps) {
  const [isBeginnerMode, setIsBeginnerMode] = useLocalStorage('beginnerMode', true);
  const [showTooltip, setShowTooltip] = useState(true);

  // Hide the tooltip after 5 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Switch 
                id="beginner-mode" 
                checked={isBeginnerMode}
                onCheckedChange={setIsBeginnerMode}
                className="data-[state=checked]:bg-primary"
              />
              <label 
                htmlFor="beginner-mode" 
                className="text-sm cursor-pointer flex items-center gap-1"
              >
                <Lightbulb className="h-3.5 w-3.5" /> Modo guiado
              </label>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[220px]">
            <p className="text-xs">
              O modo guiado exibe dicas e explicações adicionais para ajudar na configuração
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
