
import { serverData } from "@/data/server-components";
import { useWizard } from "@/contexts/WizardContext";
import { WizardStep } from "./WizardStep";
import { LoadingAccordion } from "./LoadingAccordion";
import { StepForm } from "./StepForm";
import { RefreshSyncButton } from "./RefreshSyncButton";

export function WizardContent() {
  const { 
    currentStep, 
    selectedComponents, 
    connectivityItems,
    setConnectivityItems,
    handleSelectOption,
    handleSelectStorageItem,
    categoriesLoaded,
  } = useWizard();

  // If categories are still loading, show a loading state
  if (!categoriesLoaded) {
    return <LoadingAccordion />;
  }

  // Current component in the wizard
  const currentComponent = serverData.componentes[currentStep];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight">
          {currentComponent.friendlyName}
        </h2>
        <RefreshSyncButton />
      </div>

      <StepForm 
        component={currentComponent}
        selectedOption={selectedComponents[currentComponent.type.toLowerCase()]}
        onSelectOption={handleSelectOption}
        connectivityItems={connectivityItems}
        onUpdateConnectivityItems={setConnectivityItems}
        onSelectStorageItem={handleSelectStorageItem}
      />
    </div>
  );
}
