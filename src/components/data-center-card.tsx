
import { ComponentOption } from "@/data/server-components";
import { DataCenterOption } from "@/types/server";
import { HelpTooltip } from "./help-tooltip";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataCenterCardProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

const getBadgeStyles = (badge?: string) => {
  if (!badge) return '';
  
  return cn(
    "absolute top-1 right-1 text-xs px-2 py-0.5 rounded",
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
    <div className="grid grid-cols-3 gap-2">
      {options.map((baseOption) => {
        const option = baseOption as DataCenterOption;
        const isSelected = selectedOption?.id === option.id;
        const features = option.metadata?.features || [];
        
        return (
          <div 
            key={option.id}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all",
              isSelected 
                ? "bg-primary/10 ring-1 ring-primary" 
                : "hover:bg-muted/20 hover:ring-1 hover:ring-border"
            )}
            onClick={() => onSelectOption(option)}
          >
            <div className="flex items-center gap-2 mb-1">
              <Globe 
                className={cn(
                  "h-5 w-5", 
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} 
              />
              <span className={cn(
                "text-sm font-medium",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {option.name}
              </span>
              <HelpTooltip
                title="Detalhes do Data Center"
                description={`${option.description}\n\nCaracterísticas:\n• ${features.join('\n• ')}`}
              />
            </div>
            
            {option.metadata?.badge && (
              <div className={getBadgeStyles(option.metadata.badge)}>
                {option.metadata.badge}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
