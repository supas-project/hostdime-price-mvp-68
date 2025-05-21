
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
  
  // Processar discos internos - criar um mapa para garantir exclusividade por ID
  const internalDisksMap = new Map<string, ComponentOption>();
  
  storageItems.internal.forEach(disk => {
    if (disk && disk.price > 0) {
      // Se o disco já existir no mapa, apenas ignoramos para evitar duplicatas
      if (!internalDisksMap.has(disk.id)) {
        internalDisksMap.set(disk.id, disk);
      }
    }
  });
  
  // Processar storage externo - mesmo tratamento para evitar duplicatas
  const externalStorageMap = new Map<string, ComponentOption>();
  
  storageItems.external.forEach(storage => {
    if (storage && storage.price > 0) {
      if (!externalStorageMap.has(storage.id)) {
        externalStorageMap.set(storage.id, storage);
      }
    }
  });
  
  // Calcular preços com base nos mapas únicos
  const internalStoragePrice = Array.from(internalDisksMap.values())
    .reduce((sum, disk) => sum + disk.price, 0);
  
  const externalStoragePrice = Array.from(externalStorageMap.values())
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
    internalDisksMap.size || 
    externalStorageMap.size ||
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
          internal: Array.from(internalDisksMap.values()),
          external: Array.from(externalStorageMap.values())
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
