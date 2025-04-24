
import { useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { serverData, ComponentOption } from "@/data/server-components";
import { WizardStep } from "@/components/wizard-step";
import { FloatingCart } from "@/components/floating-cart";
import { FinalSummary } from "@/components/final-summary";
import { WizardHeader } from "@/components/wizard-header";
import { ProgressIndicator } from "@/components/progress-indicator";

interface SelectedComponents {
  [key: string]: ComponentOption;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponents>({});
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  const { componentes: components } = serverData;
  const currentComponent = components[currentStep];

  const handleSelectOption = (option: ComponentOption) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [currentComponent.id]: option
    }));
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
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <WizardHeader 
                  components={components} 
                  currentStep={currentStep} 
                  onStepClick={handleStepClick} 
                />
                
                <WizardStep
                  component={currentComponent}
                  selectedOption={selectedComponents[currentComponent.id] || null}
                  onSelectOption={handleSelectOption}
                />
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
