
import * as Icons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionHeaderProps {
  icon: string;
  title: string;
  description: string;
  isExpanded: boolean;
  isActive: boolean;
  isComplete: boolean;
  selectedOption: { name: string } | null;
}

export function AccordionHeader({
  icon,
  title,
  description,
  isExpanded,
  isActive,
  isComplete,
  selectedOption
}: AccordionHeaderProps) {
  const IconComponent = (Icons as any)[icon] || Icons.HelpCircle;

  return (
    <div className="flex flex-1 items-center space-x-3">
      <div className={cn(
        "p-2.5 rounded-full",
        isExpanded || isActive ? "bg-primary/10" : "bg-muted"
      )}>
        <IconComponent className={cn(
          "h-5 w-5",
          isExpanded || isActive ? "text-primary" : "text-muted-foreground"
        )} />
      </div>
      <div className="text-left">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "font-medium text-lg",
            !isExpanded && !isActive && "text-muted-foreground"
          )}>
            {title}
          </h3>
          
          {isComplete && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
              <Check className="h-3 w-3" />
              <span>Concluído</span>
            </Badge>
          )}
        </div>
        
        {selectedOption && !isExpanded && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            Selecionado: <span className="font-medium text-foreground">{selectedOption.name}</span>
          </p>
        )}
        
        {!selectedOption && !isExpanded && (
          <p className="text-sm text-muted-foreground">
            Clique para configurar
          </p>
        )}
      </div>
    </div>
  );
}
