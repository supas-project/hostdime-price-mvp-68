
import { useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { serverData, ComponentOption } from "@/data/server-components";
import { AccordionStep } from "@/components/accordion-step";
import { FloatingCart } from "@/components/floating-cart";
import { FinalSummary } from "@/components/final-summary";
import { WizardHeader } from "@/components/wizard-header";
import { ProgressIndicator } from "@/components/progress-indicator";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectedComponents {
  [key: string]: ComponentOption;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponents>({});
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);

  const { componentes: components } = serverData;
  const currentComponent = components[currentStep];

  const handleSelectOption = (option: ComponentOption) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [currentComponent.id]: option
    }));
    
    if (currentStep < components.length - 1 && !showAllSteps) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 300);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < components.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowFinalSummary(true);
    }
  };

  const handleRestart = () => {
    setSelectedComponents({});
    setCurrentStep(0);
    setShowFinalSummary(false);
  };

  const isStepComplete = (stepIndex: number) => {
    return selectedComponents[components[stepIndex].id] !== undefined;
  };

  if (showFinalSummary) {
    return (
      <div className="container py-8 animate-fade-in">
        <FinalSummary 
          selectedComponents={selectedComponents} 
          onRestart={handleRestart}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container max-w-4xl mx-auto py-12 px-4 space-y-8 animate-fade-in">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl font-bold tracking-tight">
            Configure seu Servidor
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Selecione as opções ideais para seu servidor dedicado em poucos passos
          </p>
        </div>

        <ProgressIndicator 
          components={components} 
          currentStep={currentStep}
          completedSteps={components.map((_, index) => isStepComplete(index))}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                {components.map((component, index) => (
                  <AccordionStep
                    key={component.id}
                    component={component}
                    selectedOption={selectedComponents[component.id] || null}
                    onSelectOption={handleSelectOption}
                    isActive={index === currentStep}
                    isComplete={isStepComplete(index)}
                  />
                ))}
              </div>
            ) : (
              <AccordionStep
                component={currentComponent}
                selectedOption={selectedComponents[currentComponent.id] || null}
                onSelectOption={handleSelectOption}
                isActive={true}
                isComplete={isStepComplete(currentStep)}
              />
            )}
          </div>
          
          <FloatingCart
            selectedComponents={selectedComponents}
            currentStep={currentStep}
            totalSteps={components.length}
            onPrevious={handlePreviousStep}
            onNext={handleNextStep}
            onComplete={() => setShowFinalSummary(true)}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
