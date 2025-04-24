
import { useState } from "react";
import { ServerComponent, ComponentOption } from "@/data/server-components";
import * as Icons from "lucide-react";
import { ComponentCard } from "./component-card";
import { HelpTooltip } from "./help-tooltip";
import { ComponentSelector } from "./component-selector";
import { StorageSelector } from "./storage/StorageSelector";
import { PricedDiskOption } from "@/types/storage";
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
  
  const isSpecialComponentType = ["Memória", "DataCenter", "Contrato", "Conectividade", "Armazenamento"].includes(component.type);
  
  const handleSelectOption = (option: ComponentOption | null) => {
    if (option) {
      onSelectOption(option);
    }
  };

  // Handler for internal disk selection
  const handleSelectInternalDisk = (disk: PricedDiskOption, quantity: number) => {
    if (onSelectStorageItem) {
      const storageOption: ComponentOption = {
        id: `internal-disk-${disk.id}`,
        type: "Armazenamento",
        name: `${quantity}x ${disk.type.toUpperCase()} ${disk.capacity}`,
        description: `Disco interno: ${disk.type.toUpperCase()} ${disk.capacity}`,
        price: disk.price * quantity,
        specs: [
          `Tipo: ${disk.type.toUpperCase()}`,
          `Capacidade: ${disk.capacity}`,
          `Quantidade: ${quantity}`
        ]
      };
      onSelectStorageItem(storageOption, 'internal');
    }
  };

  // Handler for external storage selection
  const handleSelectExternalStorage = (type: string, capacity: number, price: number) => {
    if (onSelectStorageItem) {
      const storageOption: ComponentOption = {
        id: `external-storage-${type}-${capacity}`,
        type: "Armazenamento",
        name: `Storage ${type} ${capacity} GB`,
        description: `Storage externo: ${type} ${capacity} GB`,
        price: price,
        specs: [
          `Tipo: Storage ${type}`,
          `Capacidade: ${capacity} GB`
        ]
      };
      onSelectStorageItem(storageOption, 'external');
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
                  if (option) handleSelectOption(option);
                }}
                tooltip={component.description}
                highlightSelection={true}
              />
            ) : component.type === "DataCenter" ? (
              <ComponentCard
                option={selectedOption || component.options[0]}
                options={component.options}
                isSelected={!!selectedOption}
                onSelect={handleSelectOption}
                componentType="DataCenter"
              />
            ) : component.type === "Contrato" ? (
              <ComponentCard
                option={selectedOption || component.options[0]}
                options={component.options}
                isSelected={!!selectedOption}
                onSelect={handleSelectOption}
                componentType="Contrato"
              />
            ) : component.type === "Conectividade" ? (
              <ComponentCard
                option={selectedOption || component.options[0]}
                options={component.options}
                isSelected={!!selectedOption}
                onSelect={handleSelectOption}
                componentType="Conectividade"
                selectedConnectivityItems={connectivityItems}
                onUpdateConnectivityItems={onUpdateConnectivityItems}
              />
            ) : component.type === "Armazenamento" ? (
              <StorageSelector
                onSelectInternalDisk={handleSelectInternalDisk}
                onSelectExternalStorage={handleSelectExternalStorage}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {component.options.map((option) => (
                  <ComponentCard
                    key={option.id}
                    option={option}
                    isSelected={selectedOption?.id === option.id}
                    onSelect={handleSelectOption}
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
