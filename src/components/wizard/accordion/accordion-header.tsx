
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
    <div className="flex flex-1 items-center space-x-4">
      <div className={cn(
        "p-3 rounded-xl transition-all duration-300 shadow-md",
        isExpanded || isActive 
          ? "bg-[#f58220] shadow-[#f58220]/30 scale-105" 
          : "bg-muted hover:bg-[#f58220]/20 hover:shadow-lg"
      )}>
        <IconComponent className={cn(
          "h-6 w-6 transition-all duration-300",
          isExpanded || isActive ? "text-white" : "text-muted-foreground"
        )} />
      </div>
      <div className="text-left flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className={cn(
            "font-semibold text-xl transition-all duration-300",
            isExpanded || isActive ? "text-[#f58220]" : "text-foreground",
            !isExpanded && !isActive && "hover:text-[#f58220]"
          )}>
            {title}
          </h3>
          
          {isComplete && (
            <Badge className={cn(
              "bg-[#f58220] text-white border-none shadow-md",
              "flex items-center gap-2 animate-fade-in hover:scale-105 transition-transform duration-200"
            )}>
              <Check className="h-4 w-4" />
              <span className="font-medium">Concluído</span>
            </Badge>
          )}
        </div>
        
        {selectedOption && !isExpanded && (
          <p className={cn(
            "text-sm text-muted-foreground line-clamp-1 transition-all duration-200",
            "hover:text-[#f58220]"
          )}>
            Selecionado: <span className="font-semibold text-[#f58220]">{selectedOption.name}</span>
          </p>
        )}
        
        {!selectedOption && !isExpanded && (
          <p className={cn(
            "text-sm text-muted-foreground transition-all duration-200",
            "hover:text-[#f58220]"
          )}>
            Clique para configurar
          </p>
        )}
      </div>
    </div>
  );
}
