
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FloatingCart } from "@/components/floating-cart";
import { FinalSummary } from "@/components/final-summary";
import { ProgressIndicator } from "@/components/progress-indicator";
import { WizardProvider, useWizard } from "@/contexts/WizardContext";
import { WizardContent } from "@/components/wizard/WizardContent";
import { serverData } from "@/data/server-components";
import { cn } from "@/lib/utils";
import { convertStorageItemsMapToArray, convertConnectivityToArray, convertCustomServicesToArray } from "@/utils/storage-utils";
import { StorageItemsMap, ConnectivityItemsMap } from "@/types/wizard";

// Create a separate component to use the context
const WizardContainer = () => {
  const { 
    currentStep, 
    selectedComponents, 
    setCurrentStep,
    showFinalSummary,
    setShowFinalSummary,
    isStepComplete,
    handleRestart,
    storageItems,
    connectivityItems,
    customServices
  } = useWizard();

  // Converter para o formato esperado pelo FinalSummary
  const storageItemsMap: StorageItemsMap = {};
  storageItems.internal.forEach(item => {
    storageItemsMap[item.id] = { option: item, quantity: item.metadata?.quantity || 1 };
  });
  storageItems.external.forEach(item => {
    storageItemsMap[item.id] = { option: item, quantity: item.metadata?.quantity || 1 };
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className={cn(
        "container mx-auto py-4 sm:py-6 md:py-8 lg:py-12 px-3 md:px-4",
        "space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in"
      )}>
        <div className="text-center space-y-2 md:space-y-4 mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
            Configure seu Servidor
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-xs sm:text-sm md:text-base px-2">
            Selecione as opções ideais para seu servidor dedicado em poucos passos
          </p>
        </div>

        <ProgressIndicator 
          components={serverData.componentes} 
          currentStep={currentStep}
          completedSteps={serverData.componentes.map((_, index) => isStepComplete(index))}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          <div className="md:col-span-8 w-full overflow-x-hidden">
            <WizardContent />
          </div>
          
          <div className="md:col-span-4">
            <FloatingCart
              selectedComponents={selectedComponents}
              currentStep={currentStep}
              totalSteps={serverData.componentes.length}
              onPrevious={() => setCurrentStep(Math.max(0, currentStep - 1))}
              onNext={() => setCurrentStep(Math.min(serverData.componentes.length - 1, currentStep + 1))}
              onComplete={() => setShowFinalSummary(true)}
            />
          </div>
        </div>

        {showFinalSummary && (
          <FinalSummary 
            selectedComponents={selectedComponents}
            onRestart={handleRestart}
            storageItems={storageItemsMap}
            connectivityItems={connectivityItems}
            customServices={convertCustomServicesToArray(customServices)}
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
