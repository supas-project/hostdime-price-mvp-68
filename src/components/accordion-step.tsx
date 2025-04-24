
import { useState } from "react";
import { ServerComponent, ComponentOption } from "@/data/server-components";
import * as Icons from "lucide-react";
import { ComponentCard } from "./component-card";
import { HelpTooltip } from "./help-tooltip";
import { ComponentSelector } from "./component-selector";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface AccordionStepProps {
  component: ServerComponent;
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
  isActive: boolean;
  isComplete: boolean;
  connectivityItems?: { [key: string]: { option: ComponentOption, quantity: number } };
  onUpdateConnectivityItems?: (items: { [key: string]: { option: ComponentOption, quantity: number } }) => void;
}

export function AccordionStep({ 
  component, 
  selectedOption, 
  onSelectOption,
  isActive,
  isComplete,
  connectivityItems = {},
  onUpdateConnectivityItems
}: AccordionStepProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);
  
  // Dynamic icon lookup
  const IconComponent = (Icons as any)[component.icon] || Icons.HelpCircle;
  
  // Determine if this is a special component type
  const isSpecialComponentType = ["Memória", "DataCenter", "Contrato", "Conectividade"].includes(component.type);
  
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
                    {component.friendlyName}
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
          </AccordionTrigger>
          
          <AccordionContent className="px-4 pb-6 pt-2">
            {!selectedOption && component.type !== "Processador" && !isSpecialComponentType && (
              <p className="text-muted-foreground flex items-center mb-4">
                {component.description}
                <HelpTooltip 
                  title="Mais detalhes" 
                  description={component.description} 
                />
              </p>
            )}

            {component.type === "Processador" ? (
              <ComponentSelector
                label="Escolha o processador ideal para você"
                options={component.options}
                value={selectedOption?.id || ""}
                onChange={(value) => {
                  const option = component.options.find(opt => opt.id === value);
                  if (option) onSelectOption(option);
                }}
                tooltip={component.description}
                highlightSelection={true}
              />
            ) : component.type === "DataCenter" ? (
              <ComponentCard
                option={selectedOption || component.options[0]}
                options={component.options}
                isSelected={!!selectedOption}
                onSelect={onSelectOption}
                componentType="DataCenter"
              />
            ) : component.type === "Contrato" ? (
              <ComponentCard
                option={selectedOption || component.options[0]}
                options={component.options}
                isSelected={!!selectedOption}
                onSelect={onSelectOption}
                componentType="Contrato"
              />
            ) : component.type === "Conectividade" ? (
              <ComponentCard
                option={selectedOption || component.options[0]}
                options={component.options}
                isSelected={!!selectedOption}
                onSelect={onSelectOption}
                componentType="Conectividade"
                selectedConnectivityItems={connectivityItems}
                onUpdateConnectivityItems={onUpdateConnectivityItems}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {component.options.map((option) => (
                  <ComponentCard
                    key={option.id}
                    option={option}
                    isSelected={selectedOption?.id === option.id}
                    onSelect={onSelectOption}
                    componentType={component.type}
                  />
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
