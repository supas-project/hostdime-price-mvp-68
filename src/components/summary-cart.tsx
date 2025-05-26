
import React from "react";
import { ComponentOption } from "@/types/component";
import { useWizard } from "@/contexts/WizardContext";
import { CartHeader } from "./summary-cart/cart-header";
import { CartContent } from "./summary-cart/cart-content";
import { CartFooter } from "./summary-cart/cart-footer";
import { CartNavigation } from "./summary-cart/cart-navigation";
import { cn } from "@/lib/utils";
import { deduplicateStorageItems } from "@/utils/html/price-calculator";

interface SummaryCartProps {
  selectedComponents: { [key: string]: ComponentOption };
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  // Novos props para auto-progressão
  autoProgressionConfig?: {
    enabled: boolean;
    fastMode: boolean;
    delay: number;
  };
  onAutoProgressionConfigChange?: (config: any) => void;
  countdownSeconds?: number | null;
  shouldProgress?: boolean;
  onCancelProgression?: () => void;
  isSimpleCategory?: boolean;
  isOptionalCategory?: boolean;
  isComplexCategoryReady?: boolean;
}

export function SummaryCart({
  selectedComponents,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  autoProgressionConfig,
  onAutoProgressionConfigChange,
  countdownSeconds,
  shouldProgress,
  onCancelProgression,
  isSimpleCategory,
  isOptionalCategory,
  isComplexCategoryReady
}: SummaryCartProps) {
  const { storageItems, connectivityItems, handleRemoveComponent, handleRestart } = useWizard();

  // CORREÇÃO: Dedupliação mais agressiva com nova lógica melhorada
  const uniqueStorageItems = {
    internal: deduplicateStorageItems(storageItems.internal),
    external: deduplicateStorageItems(storageItems.external)
  };
  
  console.log(`[SummaryCart] Cálculo de preço com itens deduplicados`);
  console.log(`[SummaryCart] Discos internos originais: ${storageItems.internal.length}, únicos: ${uniqueStorageItems.internal.length}`);
  console.log(`[SummaryCart] Storage externos originais: ${storageItems.external.length}, únicos: ${uniqueStorageItems.external.length}`);
  console.log(`[SummaryCart] Itens de conectividade:`, connectivityItems);
  
  console.log("[SummaryCart] Todos os componentes selecionados:", selectedComponents);
  console.log("[SummaryCart] Data Center:", selectedComponents["datacenter"]);
  console.log("[SummaryCart] Contrato:", selectedComponents["contrato"]);

  const standardComponents = Object.values(selectedComponents).filter(
    component => {
      if (!component || component.type === "DataCenter" || component.type === "Contrato" || component.type === "Armazenamento") {
        return false;
      }
      return true;
    }
  );
  
  const standardComponentsPrice = standardComponents.reduce(
    (sum, component) => sum + (component.price || 0),
    0
  );
  
  const internalStoragePrice = uniqueStorageItems.internal
    .filter(disk => disk && disk.price > 0)
    .reduce((sum, disk) => sum + disk.price, 0);
  
  const externalStoragePrice = uniqueStorageItems.external
    .filter(storage => storage && storage.price > 0)
    .reduce((sum, storage) => sum + storage.price, 0);

  const connectivityPrice = Object.values(connectivityItems)
    .filter(item => item && item.option)
    .reduce((sum, item) => sum + (item.option.price * item.quantity), 0);

  const totalPrice = standardComponentsPrice + internalStoragePrice + externalStoragePrice + connectivityPrice;
  console.log(`[SummaryCart] Total calculado: ${totalPrice}`);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  const hasItems = Boolean(
    Object.keys(selectedComponents).length || 
    uniqueStorageItems.internal.length || 
    uniqueStorageItems.external.length ||
    Object.keys(connectivityItems).length
  );
  
  const handleClearAll = () => {
    handleRestart();
  };
  
  const handleRemoveComponentWithFeedback = (type: string) => {
    console.log(`[SummaryCart] Removendo componente: ${type}`);
    
    if (type.includes('network-') || type.includes('ip-')) {
      console.log(`[SummaryCart] Removendo item de conectividade: ${type}`);
    }
    
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
        autoProgressionConfig={autoProgressionConfig}
        onAutoProgressionConfigChange={onAutoProgressionConfigChange}
        countdownSeconds={countdownSeconds}
        shouldProgress={shouldProgress}
        onCancelProgression={onCancelProgression}
        isSimpleCategory={isSimpleCategory}
        isOptionalCategory={isOptionalCategory}
        isComplexCategoryReady={isComplexCategoryReady}
      />
      
      <CartContent 
        selectedComponents={selectedComponents}
        storageItems={uniqueStorageItems}
        connectivityItems={connectivityItems}
        onRemoveItem={handleRemoveComponentWithFeedback}
      />
      
      <CartFooter
        totalPrice={totalPrice}
      />
    </div>
  );
}
