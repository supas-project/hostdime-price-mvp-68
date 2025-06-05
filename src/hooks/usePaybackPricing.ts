
import { useWizard } from '@/contexts/WizardContext';
import { ComponentOption } from '@/types/component';
import { getPayBackValue } from '@/utils/payback-utils';
import { useMemo } from 'react';

export function usePaybackPricing() {
  const { selectedComponents } = useWizard();
  
  // Obter duração do contrato selecionado
  const contractDuration = useMemo(() => {
    const contract = selectedComponents['contrato'];
    return contract?.subtype || "0";
  }, [selectedComponents]);

  // Função para calcular preço com payback aplicado
  const calculatePriceWithPayback = (component: ComponentOption): number => {
    if (!component) return 0;
    
    // Só aplicar payback em hardware
    if (component.isHardware) {
      const paybackValue = getPayBackValue(component, contractDuration);
      
      if (paybackValue && contractDuration !== "0") {
        return component.price / paybackValue;
      }
    }
    
    return component.price;
  };

  // Função para obter informações de payback
  const getPaybackInfo = (component: ComponentOption) => {
    if (!component?.isHardware) return null;
    
    const paybackValue = getPayBackValue(component, contractDuration);
    const originalPrice = component.price;
    const finalPrice = calculatePriceWithPayback(component);
    const savings = originalPrice - finalPrice;
    
    return {
      paybackValue,
      originalPrice,
      finalPrice,
      savings,
      hasPayback: paybackValue && contractDuration !== "0"
    };
  };

  return {
    contractDuration,
    calculatePriceWithPayback,
    getPaybackInfo,
    hasActiveContract: contractDuration !== "0"
  };
}
