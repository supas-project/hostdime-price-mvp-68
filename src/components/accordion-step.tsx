import { useState } from "react";
import { ServerComponent, ComponentOption } from "@/types/component";
import * as Icons from "lucide-react";
import { DataCenterCard } from "./data-center-card";
import { ContractDuration } from "./contract-duration";
import { ConnectivityOptions } from "./connectivity-options";
import { StorageStep } from "./wizard/steps/storage/storage-step";
import { ComponentStep } from "./wizard/steps/component/component-step";
import { StepHeader } from "./wizard/steps/step-header";
import { MemorySlider } from "./memory-slider";
import { Card } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { ComponentSelector } from "@/components/ui/component-selector";

interface AccordionStepProps {
  component: ServerComponent;
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
  isActive: boolean;
  isComplete: boolean;
  connectivityItems?: { [key: string]: { option: ComponentOption, quantity: number } };
  onUpdateConnectivityItems?: (items: { [key: string]: { option: ComponentOption, quantity: number } }) => void;
  onSelectStorageItem?: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
}

export function AccordionStep({ 
  component, 
  selectedOption, 
  onSelectOption,
  isActive,
  isComplete,
  connectivityItems = {},
  onUpdateConnectivityItems,
  onSelectStorageItem
}: AccordionStepProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const IconComponent = (Icons as any)[component.icon] || Icons.HelpCircle;

  const renderComponentContent = () => {
    switch (component.type) {
      case "Processador":
        return (
          <ComponentSelector
            label={component.friendlyName}
            options={component.options}
            value={selectedOption?.id || ""}
            onChange={(value) => {
              const option = component.options.find(opt => opt.id === value);
              if (option) onSelectOption(option);
            }}
            tooltip={component.description}
            highlightSelection={true}
          />
        );
      
      case "Memória":
        return (
          <Card className="p-6">
            <MemorySlider 
              value={selectedOption?.name 
                ? parseInt(selectedOption.name.replace(/\D/g, '')) || 8 
                : 8}
              onChange={(newValue) => {
                const updatedOption = {
                  ...component.options[0],
                  price: newValue * 7.5,
                  name: `${newValue}GB RAM`
                };
                onSelectOption(updatedOption);
              }}
              pricePerGB={7.5}
            />
          </Card>
        );
      
      case "DataCenter":
        return (
          <DataCenterCard
            options={component.options}
            selectedOption={selectedOption}
            onSelectOption={onSelectOption}
          />
        );
      
      case "Contrato":
        return (
          <ContractDuration
            options={component.options}
            selectedOption={selectedOption}
            onSelectOption={onSelectOption}
          />
        );
      
      case "Conectividade":
        if (onUpdateConnectivityItems) {
          return (
            <ConnectivityOptions
              options={component.options}
              selectedItems={connectivityItems}
              onUpdateItems={onUpdateConnectivityItems}
            />
          );
        }
        break;

      case "Armazenamento":
        if (onSelectStorageItem) {
          return <StorageStep onSelectStorageItem={onSelectStorageItem} />;
        }
        break;

      default:
        return (
          <ComponentStep
            options={component.options}
            selectedOption={selectedOption}
            onSelectOption={onSelectOption}
            componentType={component.type}
          />
        );
    }
  };
  
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
            <StepHeader 
              description={component.description}
              isSpecialComponent={isSpecialComponentType}
              hasSelectedOption={!!selectedOption}
            />
            {renderComponentContent()}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
