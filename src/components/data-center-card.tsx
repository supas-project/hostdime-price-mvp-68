
import { ComponentOption, DataCenterOption } from "@/types/component";
import { Globe } from "lucide-react";
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

const getBadgeStyles = (badge?: string) => {
  if (!badge) return '';
  
  return cn(
    "inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium",
    {
      'bg-primary/10 text-primary': badge === 'Recomendado',
      'bg-blue-600/10 text-blue-600': badge === 'Internacional'
    }
  );
};

export function DataCenterCard({ 
  options, 
  selectedOption, 
  onSelectOption 
}: DataCenterCardProps) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {options.map((option) => {
        const dcOption = option as DataCenterOption;
        const isSelected = selectedOption?.id === option.id;
        const features = dcOption.metadata?.features || [];
        
        return (
          <TooltipProvider key={option.id}>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 animate-fade-in",
                    isSelected 
                      ? "bg-primary/10 ring-1 ring-primary" 
                      : "hover:bg-muted/20 hover:ring-1 hover:ring-border hover:translate-y-[-2px]"
                  )}
                  onClick={() => onSelectOption(option)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Globe 
                      className={cn(
                        "h-5 w-5", 
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} 
                    />
                    <span className={cn(
                      "text-base font-medium",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {option.name}
                    </span>
                  </div>

                  {dcOption.metadata?.badge && (
                    <div className={getBadgeStyles(dcOption.metadata.badge)}>
                      {dcOption.metadata.badge}
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              
              <TooltipContent 
                side="right" 
                className="max-w-[280px] p-3"
              >
                <div className="space-y-2">
                  <p className="text-sm">
                    {option.description}
                  </p>
                  {features.length > 0 && (
                    <ul className="text-xs space-y-1">
                      {features.map((feature, index) => (
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
    </div>
  );
}
