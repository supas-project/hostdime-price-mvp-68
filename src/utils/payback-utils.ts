
import { ComponentOption } from "@/types/component";

// PayBack values mapped to contract durations
export const PAYBACK_VALUES = {
  "0": 4,   // Indeterminado (sem contrato)
  "12": 6,  // 12 meses
  "24": 10, // 24 meses
  "36": 14, // 36 meses
  "48": 20, // 48 meses
  "60": 26  // 60 meses
};

export type ContractDuration = keyof typeof PAYBACK_VALUES;

/**
 * Gets the PayBack value based on contract duration for hardware components
 * @param component - The component to check for hardware status
 * @param contractDuration - Contract duration in months (0 for indeterminate)
 * @returns The PayBack value or null if component is not hardware
 */
export function getPayBackValue(component: ComponentOption | null, contractDuration: string | number): number | null {
  // Return null if no component or not hardware
  if (!component || component.isHardware !== true) {
    return null;
  }

  // Convert to string to ensure proper lookup
  const duration = String(contractDuration) as ContractDuration;
  
  // Return payback value or default to 4 (indeterminate) if duration not found
  return PAYBACK_VALUES[duration] || PAYBACK_VALUES["0"];
}

/**
 * Formats the PayBack value for display
 * @param paybackValue - The numeric PayBack value
 * @returns Formatted PayBack string (e.g., "10x")
 */
export function formatPayBack(paybackValue: number | null): string {
  if (paybackValue === null) return "";
  return `${paybackValue}x`;
}

/**
 * Checks if a component is eligible for PayBack calculation
 * @param component - The component to check
 * @returns Boolean indicating if component is eligible for PayBack
 */
export function isPayBackEligible(component: ComponentOption | null): boolean {
  return !!component && component.isHardware === true;
}
