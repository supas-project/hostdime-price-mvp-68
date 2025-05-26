
import React from "react";
import { ComponentOption } from "@/types/component";
import { SummaryCart } from "./summary-cart";
import { useAutoProgression } from "@/hooks/use-auto-progression";
import { useWizard } from "@/contexts/WizardContext";
import { serverData } from "@/data/server-components";

interface FloatingCartProps {
  selectedComponents: { [key: string]: ComponentOption };
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function FloatingCart({
  selectedComponents,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete
}: FloatingCartProps) {
  const { 
    connectivityItems,
    storageItems,
    isStepComplete,
    setStepComplete
  } = useWizard();

  const currentComponent = serverData.componentes[currentStep];

  // Auto-progression integration
  const autoProgression = useAutoProgression({
    currentStep,
    totalSteps,
    selectedComponents,
    connectivityItems,
    storageItems,
    onNextStep: onNext,
    componentType: currentComponent?.type || "",
    isStepComplete,
    onStepComplete: setStepComplete
  });

  return (
    <SummaryCart
      selectedComponents={selectedComponents}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onPrevious={onPrevious}
      onNext={onNext}
      onComplete={onComplete}
      autoProgressionConfig={autoProgression.config}
      onAutoProgressionConfigChange={autoProgression.setConfig}
      countdownSeconds={autoProgression.countdownSeconds}
      shouldProgress={autoProgression.shouldProgress}
      onCancelProgression={autoProgression.cancelProgression}
      isSimpleCategory={autoProgression.isSimpleCategory}
      isOptionalCategory={autoProgression.isOptionalCategory}
      isComplexCategoryReady={autoProgression.isComplexCategoryReady}
    />
  );
}
