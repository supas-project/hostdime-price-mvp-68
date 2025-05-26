
import { ComponentOption } from "@/types/component";

/**
 * Mapeamento dos fatores PayBack por duração de contrato
 */
export const PAYBACK_FACTORS = {
  "0": 4,    // Indeterminado
  "12": 6,   // 12 meses
  "24": 10,  // 24 meses
  "36": 14,  // 36 meses
  "48": 20,  // 48 meses
  "60": 26   // 60 meses
} as const;

/**
 * Obtém o fator PayBack para uma duração específica
 */
export function getPayBackValue(
  component: ComponentOption,
  contractDuration: string | number
): number | null {
  const duration = String(contractDuration);
  
  if (!PAYBACK_FACTORS.hasOwnProperty(duration)) {
    console.warn(`[PayBack] Duração de contrato não suportada: ${duration}`);
    return null;
  }
  
  return PAYBACK_FACTORS[duration as keyof typeof PAYBACK_FACTORS];
}

/**
 * Formata o valor PayBack para exibição
 */
export function formatPayBack(value: number): string {
  return `${value}x`;
}
