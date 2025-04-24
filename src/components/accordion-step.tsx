
import { useState } from "react";
import { ServerComponent, ComponentOption } from "@/data/server-components";
import * as Icons from "lucide-react";
import { ComponentCard } from "./component-card";
import { HelpTooltip } from "./help-tooltip";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface AccordionStepProps {
  component: ServerComponent;
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
  isActive: boolean;
  isComplete: boolean;
}

export function AccordionStep({ 
  component, 
  selectedOption, 
  onSelectOption,
  isActive,
  isComplete 
}: AccordionStepProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);
  
  // Dynamic icon lookup
  const IconComponent = (Icons as any)[component.icon] || Icons.HelpCircle;
  
  return (
    <div className={cn(
      "wizard-step space-y-2 border border-border rounded-xl transition-all",
      isActive && "ring-1 ring-primary",
      isComplete && !isActive && "bg-card/50"
    )}>
      <Accordion
        type="single"
        defaultValue={isActive ? "item-1" : undefined}
        collapsible
        onValueChange={(value) => setIsExpanded(!!value)}
        className="w-full"
      >
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="p-4 hover:no-underline">
            <div className="flex flex-1 items-center space-x-3">
              <div className={cn(
                "p-2 rounded-full",
                isExpanded || isActive ? "bg-primary/10" : "bg-muted"
              )}>
                <IconComponent className={cn(
                  "h-6 w-6",
                  isExpanded || isActive ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div className="text-left">
                <h3 className={cn(
                  "font-medium text-lg",
                  !isExpanded && !isActive && "text-muted-foreground"
                )}>
                  {component.friendlyName}
                </h3>
                {selectedOption && !isExpanded && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    Selecionado: {selectedOption.name}
                  </p>
                )}
                {!selectedOption && !isExpanded && (
                  <p className="text-sm text-muted-foreground">
                    Selecione uma opção
                  </p>
                )}
              </div>
            </div>
            {isComplete && !isActive && !isExpanded && (
              <span className="text-primary flex items-center text-sm mr-2">
                <Icons.Check className="h-4 w-4 mr-1" />
                Completo
              </span>
            )}
          </AccordionTrigger>
          
          <AccordionContent className="px-4 pb-4">
            <p className="text-muted-foreground flex items-center mb-4">
              {component.description}
              <HelpTooltip 
                title="Mais detalhes" 
                description={component.description} 
              />
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {component.options.map((option) => (
                <ComponentCard
                  key={option.id}
                  option={option}
                  isSelected={selectedOption?.id === option.id}
                  onSelect={onSelectOption}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
