import { ComponentOption, DataCenterOption } from "@/types/component";
import { HelpTooltip } from "./help-tooltip";
import { Globe, Info } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="grid grid-cols-1 gap-3">
      {options.map((option) => {
        const dcOption = option as DataCenterOption;
        const isSelected = selectedOption?.id === option.id;
        const features = dcOption.metadata?.features || [];
        
        return (
          <div 
            key={option.id}
            className={cn(
              "relative flex flex-col p-4 rounded-lg cursor-pointer transition-all duration-300 animate-fade-in",
              isSelected 
                ? "bg-primary/10 ring-1 ring-primary" 
                : "hover:bg-muted/20 hover:ring-1 hover:ring-border hover:translate-y-[-2px]"
            )}
            onClick={() => onSelectOption(option)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
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

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 mr-8">
                  {option.description}
                </p>
              </div>
              <HelpTooltip
                title="Detalhes do Data Center"
                description={`${option.description}\n\nCaracterísticas:\n• ${features.join('\n• ')}`}
                icon={true}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
