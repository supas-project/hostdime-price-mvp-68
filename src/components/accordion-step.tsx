
import { useState } from "react";
import { ServerComponent, ComponentOption } from "@/types/component";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionHeader } from "./wizard/accordion/accordion-header";
import { AccordionContent as StepContent } from "./wizard/accordion/accordion-content";

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
  connectivityItems,
  onUpdateConnectivityItems,
  onSelectStorageItem
}: AccordionStepProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);

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
            <AccordionHeader
              icon={component.icon}
              title={component.friendlyName}
              isExpanded={isExpanded}
              isActive={isActive}
              isComplete={isComplete}
              selectedOption={selectedOption}
            />
          </AccordionTrigger>
          
          <AccordionContent className="px-4 pb-6 pt-2">
            <StepContent
              component={component}
              selectedOption={selectedOption}
              onSelectOption={onSelectOption}
              connectivityItems={connectivityItems}
              onUpdateConnectivityItems={onUpdateConnectivityItems}
              onSelectStorageItem={onSelectStorageItem}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
