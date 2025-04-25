
import { serverData } from "@/data/server-components";
import { AccordionStep } from "@/components/accordion-step";
import { useWizard } from "@/contexts/WizardContext";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

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
        <div className="space-y-4">
          {serverData.componentes.map((component, index) => (
            <AccordionStep
              key={component.id}
              component={component}
              selectedOption={component.type === "Armazenamento" 
                ? selectedComponents["storage"] || null
                : selectedComponents[component.type.toLowerCase()] || null}
              onSelectOption={handleSelectOption}
              isActive={index === currentStep}
              isComplete={isStepComplete(index)}
              connectivityItems={component.type === "Conectividade" ? connectivityItems : undefined}
              onUpdateConnectivityItems={component.type === "Conectividade" ? setConnectivityItems : undefined}
              onSelectStorageItem={component.type === "Armazenamento" ? handleSelectStorageItem : undefined}
            />
          ))}
        </div>
      ) : (
        <AccordionStep
          component={currentComponent}
          selectedOption={currentComponent.type === "Armazenamento"
            ? selectedComponents["storage"] || null
            : selectedComponents[currentComponent.type.toLowerCase()] || null}
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
