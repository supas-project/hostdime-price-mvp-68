
import { ComponentOption } from "@/data/server-components";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server } from "lucide-react";
import { HelpTooltip } from "./help-tooltip";
import { cn } from "@/lib/utils";

interface DataCenterCardProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function DataCenterCard({ 
  options, 
  selectedOption, 
  onSelectOption 
}: DataCenterCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {options.map((option) => {
        const isSelected = selectedOption?.id === option.id;
        const features = option.metadata?.features || [];
        const badge = option.metadata?.badge;
        
        return (
          <Card 
            key={option.id}
            className={cn(
              "relative overflow-hidden border-2 transition-all cursor-pointer hover:scale-[1.02]",
              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            )}
            onClick={() => onSelectOption(option)}
          >
            {badge && (
              <Badge 
                variant="outline"
                className={cn(
                  "absolute top-2 right-2 capitalize",
                  badge === 'Recomendado' ? 'bg-primary/10 text-primary border-primary/20' 
                    : badge === 'Internacional' ? 'bg-blue-600/10 text-blue-600 border-blue-600/20' 
                    : ''
                )}
              >
                {badge}
              </Badge>
            )}
            
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  isSelected ? 'bg-primary/10' : 'bg-muted'
                )}>
                  <Server className={cn(
                    "h-5 w-5",
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{option.name}</h3>
                  <HelpTooltip
                    title="Detalhes do Data Center"
                    description={`${option.description}${features.length ? '\n\nCaracterísticas:\n• ' + features.join('\n• ') : ''}`}
                  />
                </div>
              </div>
            </CardContent>
            
            {isSelected && (
              <div className="h-1 w-full bg-primary absolute bottom-0 left-0"/>
            )}
          </Card>
        );
      })}
    </div>
  );
}
