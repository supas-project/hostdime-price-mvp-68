
import { ComponentOption } from "@/types/component";
import { getPayBackValue } from "@/utils/payback-utils";

// Categorias elegíveis para PayBack
export const PAYBACK_ELIGIBLE_CATEGORIES = [
  'Processador',
  'Memória',
  'Armazenamento Interno'
] as const;

export type PayBackEligibleCategory = typeof PAYBACK_ELIGIBLE_CATEGORIES[number];

/**
 * Verifica se uma categoria é elegível para PayBack
 */
export function isCategoryEligibleForPayBack(category: string): boolean {
  return PAYBACK_ELIGIBLE_CATEGORIES.includes(category as PayBackEligibleCategory);
}

/**
 * Calcula o custo mensal de um componente baseado no PayBack
 */
export function calculateMonthlyCost(
  component: ComponentOption,
  contractDuration: string | number
): number {
  // Verificar se a categoria é elegível para PayBack
  if (!isCategoryEligibleForPayBack(component.type)) {
    return component.price; // Retorna o preço original se não for elegível
  }

  // Obter o fator PayBack para a duração do contrato
  const paybackFactor = getPayBackValue(
    { ...component, isHardware: true }, 
    contractDuration
  );

  if (!paybackFactor || component.price <= 0) {
    return component.price;
  }

  // Aplicar a fórmula: CustoMensal = ValorBaseDoItem / FatorPayBack
  const monthlyCost = component.price / paybackFactor;
  
  console.log(`[PayBack Calculator] ${component.name}: R$ ${component.price} / ${paybackFactor} = R$ ${monthlyCost.toFixed(2)}`);
  
  return monthlyCost;
}

/**
 * Calcula o valor total do contrato (custo mensal × duração)
 */
export function calculateContractTotalValue(
  component: ComponentOption,
  contractDuration: string | number
): number {
  const monthlyCost = calculateMonthlyCost(component, contractDuration);
  const durationMonths = typeof contractDuration === 'string' ? 
    parseInt(contractDuration) : contractDuration;
  
  // Se for contrato indeterminado (0), retornar apenas o custo mensal
  if (durationMonths === 0) {
    return monthlyCost;
  }
  
  return monthlyCost * durationMonths;
}

/**
 * Enriquece um componente com informações de PayBack
 */
export function enrichComponentWithPayBack(
  component: ComponentOption,
  contractDuration: string | number
): ComponentOption {
  const isEligible = isCategoryEligibleForPayBack(component.type);
  
  if (!isEligible) {
    return {
      ...component,
      metadata: {
        ...component.metadata,
        paybackApplicable: false
      }
    };
  }

  const custoMensal = calculateMonthlyCost(component, contractDuration);
  const valorTotalContrato = calculateContractTotalValue(component, contractDuration);

  return {
    ...component,
    metadata: {
      ...component.metadata,
      custoMensal,
      valorTotalContrato,
      paybackApplicable: true
    }
  };
}

/**
 * Formata um valor monetário em Real brasileiro
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Calcula o total mensal de uma lista de componentes com PayBack aplicado
 */
export function calculateTotalMonthlyCostWithPayBack(
  components: ComponentOption[],
  contractDuration: string | number
): number {
  return components.reduce((total, component) => {
    return total + calculateMonthlyCost(component, contractDuration);
  }, 0);
}
