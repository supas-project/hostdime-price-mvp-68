
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FloatingCart } from "@/components/floating-cart";
import { FinalSummary } from "@/components/final-summary";
import { ProgressIndicator } from "@/components/progress-indicator";
import { WizardProvider, useWizard } from "@/contexts/WizardContext";
import { WizardContent } from "@/components/wizard/WizardContent";
import { serverData } from "@/data/server-components";

// Create a separate component to use the context
const WizardContainer = () => {
  const { 
    currentStep, 
    selectedComponents, 
    setCurrentStep,
    showFinalSummary,
    setShowFinalSummary,
    isStepComplete,
    handleRestart
  } = useWizard();

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
          {/* BeginnerModeToggle completely removed */}
        </div>

        <ProgressIndicator 
          components={serverData.componentes} 
          currentStep={currentStep}
          completedSteps={serverData.componentes.map((_, index) => isStepComplete(index))}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <WizardContent />
          <FloatingCart
            selectedComponents={selectedComponents}
            currentStep={currentStep}
            totalSteps={serverData.componentes.length}
            onPrevious={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            onNext={() => setCurrentStep(prev => Math.min(serverData.componentes.length - 1, prev + 1))}
            onComplete={() => setShowFinalSummary(true)}
          />
        </div>

        {showFinalSummary && (
          <FinalSummary 
            selectedComponents={selectedComponents}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
};

// Main component that wraps everything with the provider
const Index = () => {
  return (
    <WizardProvider>
      <WizardContainer />
    </WizardProvider>
  );
}

export default Index;
