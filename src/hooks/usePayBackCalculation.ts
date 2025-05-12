
import { ComponentOption } from "@/types/component";
import { getPayBackValue } from "@/utils/payback-utils";

/**
 * Custom hook for handling PayBack calculations in price summaries
 */
export function usePayBackCalculation() {
  /**
   * Calculates the final price with PayBack applied
   * 
   * @param component The hardware component
   * @param contractDuration The contract duration in months
   * @returns The calculated price with PayBack applied
   */
  const calculatePriceWithPayBack = (
    component: ComponentOption | null,
    contractDuration: string | number
  ): number => {
    if (!component) return 0;
    
    // Only apply PayBack to hardware components
    if (component.isHardware) {
      const payback = getPayBackValue(component, contractDuration);
      
      if (payback && component.price > 0) {
        // If component has a price and valid payback, divide by payback
        return component.price / payback;
      }
    }
    
    // Return original price if no PayBack applies
    return component.price;
  };

  /**
   * Get the monthly price with PayBack applied
   * 
   * @param components List of components
   * @param contractDuration Contract duration
   * @returns Total monthly price with PayBack applied to hardware components
   */
  const getMonthlyPriceWithPayBack = (
    components: ComponentOption[],
    contractDuration: string | number
  ): number => {
    return components.reduce((total, component) => {
      const priceWithPayBack = calculatePriceWithPayBack(component, contractDuration);
      return total + priceWithPayBack;
    }, 0);
  };

  return {
    calculatePriceWithPayBack,
    getMonthlyPriceWithPayBack
  };
}
