
import { ComponentOption } from "@/types/component";
import { 
  calculateMonthlyCost, 
  calculateContractTotalValue, 
  enrichComponentWithPayBack,
  calculateTotalMonthlyCostWithPayBack,
  isCategoryEligibleForPayBack,
  formatBRL
} from "@/utils/payback-calculator";

/**
 * Custom hook for handling PayBack calculations in price summaries
 */
export function usePayBackCalculation() {
  /**
   * Calcula o custo mensal com PayBack aplicado
   */
  const calculateMonthlyCostWithPayBack = (
    component: ComponentOption | null,
    contractDuration: string | number
  ): number => {
    if (!component) return 0;
    return calculateMonthlyCost(component, contractDuration);
  };

  /**
   * Calcula o valor total do contrato
   */
  const calculateContractTotal = (
    component: ComponentOption | null,
    contractDuration: string | number
  ): number => {
    if (!component) return 0;
    return calculateContractTotalValue(component, contractDuration);
  };

  /**
   * Enriquece um componente com dados de PayBack
   */
  const enrichWithPayBack = (
    component: ComponentOption,
    contractDuration: string | number
  ): ComponentOption => {
    return enrichComponentWithPayBack(component, contractDuration);
  };

  /**
   * Calcula o total mensal de uma lista de componentes
   */
  const getTotalMonthlyCost = (
    components: ComponentOption[],
    contractDuration: string | number
  ): number => {
    return calculateTotalMonthlyCostWithPayBack(components, contractDuration);
  };

  /**
   * Verifica se um componente é elegível para PayBack
   */
  const isEligibleForPayBack = (component: ComponentOption): boolean => {
    return isCategoryEligibleForPayBack(component.type);
  };

  /**
   * Formata valores em Real brasileiro
   */
  const formatCurrency = (value: number): string => {
    return formatBRL(value);
  };

  return {
    calculateMonthlyCostWithPayBack,
    calculateContractTotal,
    enrichWithPayBack,
    getTotalMonthlyCost,
    isEligibleForPayBack,
    formatCurrency
  };
}
