
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
  
  // Criar mapas para garantir que não há duplicatas de discos
  const uniqueInternalDisks = new Map<string, ComponentOption>();
  const uniqueExternalStorage = new Map<string, ComponentOption>();
  
  // Adicionar discos únicos ao mapa
  storageItems.internal.forEach(disk => {
    if (disk && disk.price > 0) {
      uniqueInternalDisks.set(disk.id, disk);
    }
  });
  
  storageItems.external.forEach(storage => {
    if (storage && storage.price > 0) {
      uniqueExternalStorage.set(storage.id, storage);
    }
  });
  
  // Calcular preços com base nos mapas únicos
  const internalStoragePrice = Array.from(uniqueInternalDisks.values())
    .reduce((sum, disk) => sum + disk.price, 0);
  
  const externalStoragePrice = Array.from(uniqueExternalStorage.values())
    .reduce((sum, storage) => sum + storage.price, 0);
  
  // Calcular preço dos componentes padrão
  const standardComponentsPrice = standardComponents.reduce(
    (sum, component) => sum + (component.price || 0),
    0
  );

  // Calcular preço de conectividade
  const connectivityPrice = Object.values(connectivityItems)
    .filter(item => item && item.option)
    .reduce((sum, item) => sum + (item.option.price * item.quantity), 0);

  // Calcular preço total
  const totalPrice = standardComponentsPrice + internalStoragePrice + externalStoragePrice + connectivityPrice;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  // Verifica se há qualquer componente ou item selecionado
  const hasItems = Boolean(
    Object.keys(selectedComponents).length || 
    uniqueInternalDisks.size || 
    uniqueExternalStorage.size ||
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
          internal: Array.from(uniqueInternalDisks.values()),
          external: Array.from(uniqueExternalStorage.values())
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
