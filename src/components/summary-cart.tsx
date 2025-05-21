
import React from "react";
import { ComponentOption } from "@/types/component";
import { useWizard } from "@/contexts/WizardContext";
import { CartHeader } from "./summary-cart/cart-header";
import { CartContent } from "./summary-cart/cart-content";
import { CartFooter } from "./summary-cart/cart-footer";
import { CartNavigation } from "./summary-cart/cart-navigation";
import { cn } from "@/lib/utils";

interface SummaryCartProps {
  selectedComponents: { [key: string]: ComponentOption };
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function SummaryCart({
  selectedComponents,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete
}: SummaryCartProps) {
  const { storageItems, connectivityItems, handleRemoveComponent, handleRestart } = useWizard();

  // Filter standard components (excluding DataCenter and Contract)
  const standardComponents = Object.values(selectedComponents).filter(
    component => {
      if (!component || component.type === "DataCenter" || component.type === "Contrato" || component.type === "Armazenamento") {
        return false;
      }
      return true;
    }
  );
  
  // Calcula preços excluindo DataCenter e Contract
  const standardComponentsPrice = standardComponents.reduce(
    (sum, component) => sum + (component.price || 0),
    0
  );

  // Remove internal disk duplicates before price calculation
  const uniqueInternalDisks = [...new Map(storageItems.internal
    .filter(disk => disk && disk.price > 0)
    .map(item => [item.id, item])
  ).values()];
  
  const internalStoragePrice = uniqueInternalDisks.reduce((sum, disk) => sum + disk.price, 0);
  
  // Remove external storage duplicates before price calculation
  const uniqueExternalStorage = [...new Map(storageItems.external
    .filter(storage => storage && storage.price > 0)
    .map(item => [item.id, item])
  ).values()];
  
  const externalStoragePrice = uniqueExternalStorage.reduce((sum, storage) => sum + storage.price, 0);

  const connectivityPrice = Object.values(connectivityItems)
    .filter(item => item && item.option)
    .reduce((sum, item) => sum + (item.option.price * item.quantity), 0);

  const totalPrice = standardComponentsPrice + internalStoragePrice + externalStoragePrice + connectivityPrice;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  // Verifica se há qualquer componente ou item selecionado
  const hasItems = Boolean(
    Object.keys(selectedComponents).length || 
    storageItems.internal.length || 
    storageItems.external.length ||
    Object.keys(connectivityItems).length
  );
  
  const handleClearAll = () => {
    handleRestart();
  };
  
  const handleRemoveComponentWithFeedback = (type: string) => {
    handleRemoveComponent(type);
  };
  
  return (
    <div className={cn(
      "bg-card rounded-xl sm:rounded-2xl border border-border",
      "shadow-lg flex flex-col max-h-[calc(100vh-180px)]",
      "transition-all duration-300 hover:shadow-xl"
    )}>
      <CartHeader 
        onClearAll={handleClearAll}
        hasItems={hasItems}
      />
      
      <CartNavigation
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        onPrevious={onPrevious}
        onNext={onNext}
        onComplete={onComplete}
      />
      
      <CartContent 
        selectedComponents={selectedComponents}
        storageItems={{
          internal: uniqueInternalDisks,
          external: uniqueExternalStorage
        }}
        connectivityItems={connectivityItems}
        onRemoveItem={handleRemoveComponentWithFeedback}
      />
      
      <CartFooter
        totalPrice={totalPrice}
      />
    </div>
  );
}
