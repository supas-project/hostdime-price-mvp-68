
import { useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { serverData, ComponentOption } from "@/data/server-components";
import { AccordionStep } from "@/components/accordion-step";
import { FloatingCart } from "@/components/floating-cart";
import { FinalSummary } from "@/components/final-summary";
import { WizardHeader } from "@/components/wizard-header";
import { ProgressIndicator } from "@/components/progress-indicator";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Cog } from "lucide-react";

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
    
    // Automatically move to next step when selection is made (optional UX enhancement)
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

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleRestart = () => {
    setSelectedComponents({});
    setCurrentStep(0);
    setShowFinalSummary(false);
  };

  const handleComplete = () => {
    setShowFinalSummary(true);
  };

  const isStepComplete = (stepIndex: number) => {
    return selectedComponents[components[stepIndex].id] !== undefined;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold flex items-center">
            <span className="text-primary">Host</span>Dime
            <span className="text-primary ml-2 text-sm bg-primary/10 px-2 py-1 rounded-md">Servidor Wizard</span>
          </h1>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="container py-8">
        {!showFinalSummary ? (
          <div className="space-y-6">
            <ProgressIndicator 
              components={components} 
              currentStep={currentStep}
              completedSteps={components.map((_, index) => isStepComplete(index))}
            />
            
            <div className="flex justify-between items-center">
              <WizardHeader 
                components={components} 
                currentStep={currentStep} 
                onStepClick={handleStepClick}
                completedSteps={components.map((_, index) => isStepComplete(index))}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllSteps(!showAllSteps)}
                className="flex items-center gap-1"
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                {showAllSteps ? (
                  // Show all steps in accordion format
                  components.map((component, index) => (
                    <AccordionStep
                      key={component.id}
                      component={component}
                      selectedOption={selectedComponents[component.id] || null}
                      onSelectOption={handleSelectOption}
                      isActive={index === currentStep}
                      isComplete={isStepComplete(index)}
                    />
                  ))
                ) : (
                  // Show only current step
                  <AccordionStep
                    component={currentComponent}
                    selectedOption={selectedComponents[currentComponent.id] || null}
                    onSelectOption={handleSelectOption}
                    isActive={true}
                    isComplete={isStepComplete(currentStep)}
                  />
                )}

                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousStep} 
                    disabled={currentStep === 0}
                  >
                    Anterior
                  </Button>
                  <Button 
                    onClick={handleNextStep} 
                    disabled={!selectedComponents[currentComponent.id]}
                  >
                    {currentStep === components.length - 1 ? "Finalizar" : "Próximo"}
                  </Button>
                </div>
              </div>
              
              <FloatingCart
                selectedComponents={selectedComponents}
                currentStep={currentStep}
                totalSteps={components.length}
                onPrevious={handlePreviousStep}
                onNext={handleNextStep}
                onComplete={handleComplete}
              />
            </div>
          </div>
        ) : (
          <FinalSummary 
            selectedComponents={selectedComponents} 
            onRestart={handleRestart}
          />
        )}
      </main>
      
      <footer className="border-t border-border py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 HostDime. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
