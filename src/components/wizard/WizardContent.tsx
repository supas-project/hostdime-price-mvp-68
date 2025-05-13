
import { serverData } from "@/data/server-components";
import { AccordionStep } from "@/components/accordion-step";
import { useWizard } from "@/contexts/WizardContext";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComponentOption, ServerComponent } from "@/types/component";
import { normalizeComponentType } from "@/hooks/use-component-selection";
import { findMatchingComponent } from "@/utils/component-matching";

export function WizardContent() {
  const [showAllSteps, setShowAllSteps] = useState(false);
  const { 
    currentStep, 
    selectedComponents, 
    connectivityItems,
    handleSelectOption,
    isStepComplete,
    setConnectivityItems,
    handleSelectStorageItem 
  } = useWizard();

  const getSelectedOption = (component: ServerComponent): ComponentOption | null => {
    if (!component) return null;
    
    const normalizedType = normalizeComponentType(component.type);
    
    if (normalizedType === "armazenamento") {
      return selectedComponents["storage_internal"] || selectedComponents["storage_external"];
    }
    
    // Find the component using the normalized type
    for (const key of Object.keys(selectedComponents)) {
      if (normalizeComponentType(key) === normalizedType) {
        const selectedOption = selectedComponents[key];
        
        // If we have options in this component and a selected option,
        // try to find its matching representation in the options list
        if (component.options.length > 0 && selectedOption) {
          const matchingOption = findMatchingComponent(selectedOption, component.options);
          return matchingOption || selectedOption;
        }
        
        return selectedOption;
      }
    }
    
    return null;
  };

  const currentComponent = serverData.componentes[currentStep];

  return (
    <div className="lg:col-span-2 space-y-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowAllSteps(!showAllSteps)}
        className="flex items-center gap-1 mb-4"
      >
        {showAllSteps ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Mostrar apenas ativo
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            Mostrar todos
          </>
        )}
      </Button>

      {showAllSteps ? (
        <ScrollArea className="max-h-[calc(100vh-200px)]">
          <div className="space-y-4 pr-4">
            {serverData.componentes.map((component, index) => (
              <AccordionStep
                key={component.id}
                component={component}
                selectedOption={getSelectedOption(component)}
                onSelectOption={handleSelectOption}
                isActive={index === currentStep}
                isComplete={isStepComplete(index)}
                connectivityItems={component.type === "Conectividade" ? connectivityItems : undefined}
                onUpdateConnectivityItems={component.type === "Conectividade" ? setConnectivityItems : undefined}
                onSelectStorageItem={component.type === "Armazenamento" ? handleSelectStorageItem : undefined}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <AccordionStep
          component={currentComponent}
          selectedOption={getSelectedOption(currentComponent)}
          onSelectOption={handleSelectOption}
          isActive={true}
          isComplete={isStepComplete(currentStep)}
          connectivityItems={currentComponent.type === "Conectividade" ? connectivityItems : undefined}
          onUpdateConnectivityItems={currentComponent.type === "Conectividade" ? setConnectivityItems : undefined}
          onSelectStorageItem={currentComponent.type === "Armazenamento" ? handleSelectStorageItem : undefined}
        />
      )}
    </div>
  );
}
