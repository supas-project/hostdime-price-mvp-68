
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
  selectedOption: {
    name: string;
  } | null;
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
    <div className="flex items-center w-full gap-3">
      <div className={cn(
        "flex items-center justify-center rounded-full p-1.5",
        isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {isComplete ? (
          <Check className="h-5 w-5" />
        ) : (
          <IconComponent className="h-5 w-5" />
        )}
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{title}</h3>
          {isComplete && !isActive && (
            <Badge variant="success" className="text-xs">
              Concluído
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      
      {selectedOption && !isExpanded && (
        <div className="hidden sm:block">
          <p className="text-xs font-medium">{selectedOption.name}</p>
        </div>
      )}
    </div>
  );
}
