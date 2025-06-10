
import { serverData } from "@/data/server-components";
import { AccordionStep } from "@/components/accordion-step";
import { useWizard } from "@/contexts/WizardContext";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComponentOption, ServerComponent } from "@/types/component";
import { normalizeComponentType } from "@/hooks/use-component-selection";
import { findMatchingComponent } from "@/utils/component-matching";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function WizardContent() {
  const [showAllSteps, setShowAllSteps] = useState(false);
  
  const { 
    currentStep, 
    selectedComponents, 
    connectivityItems,
    storageItems,
    handleSelectOption,
    isStepComplete,
    setConnectivityItems,
    handleSelectStorageItem,
  } = useWizard();

  console.log(`[WizardContent] Current step: ${currentStep}, Selected components:`, selectedComponents);

  const refreshData = async () => {
    try {
      toast.success("Dados atualizados!", {
        description: "Componentes estáticos carregados."
      });
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      toast.error("Falha ao atualizar dados", {
        description: "Usando dados estáticos."
      });
    }
  };

  const getSelectedOption = (component: ServerComponent): ComponentOption | null => {
    if (!component) return null;
    
    const normalizedType = normalizeComponentType(component.type);
    
    if (normalizedType === "armazenamento") {
      return selectedComponents["storage_internal"] || selectedComponents["storage_external"];
    }
    
    for (const key of Object.keys(selectedComponents)) {
      if (normalizeComponentType(key) === normalizedType) {
        const selectedOption = selectedComponents[key];
        
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
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAllSteps(!showAllSteps)}
          className={cn(
            "flex items-center gap-1",
            "text-xs sm:text-sm py-1.5 px-2.5 sm:py-2 sm:px-3",
            "h-auto transition-colors"
          )}
        >
          {showAllSteps ? (
            <>
              <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">Mostrar apenas ativo</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">Mostrar todos</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          className="flex items-center gap-1 text-xs sm:text-sm py-1.5 px-2.5 sm:py-2 sm:px-3 h-auto"
        >
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Atualizar</span>
        </Button>
      </div>

      {showAllSteps ? (
        <ScrollArea className="max-h-[calc(100vh-200px)] pr-0 sm:pr-2 overflow-x-hidden">
          <div className="space-y-3 sm:space-y-4 pr-2 sm:pr-4">
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
        <div className="overflow-x-hidden">
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
        </div>
      )}
    </div>
  );
}
