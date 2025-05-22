
// Função para formatar valores monetários no formato brasileiro
export function formatCurrency(value: number): string {
  // Verify the value is a valid number
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn(`[formatCurrency] Invalid value: ${value}, defaulting to 0`);
    value = 0;
  }
  
  // Log the original value for debugging
  console.log(`[formatCurrency] Original value: ${value}`);
  
  try {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } catch (error) {
    console.error(`[formatCurrency] Error formatting value ${value}:`, error);
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
}

// Função para formatar números com separador de milhares
export function formatNumber(value: number, decimals: number = 2): string {
  // Verify the value is a valid number
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn(`[formatNumber] Invalid value: ${value}, defaulting to 0`);
    value = 0;
  }
  
  try {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  } catch (error) {
    console.error(`[formatNumber] Error formatting value ${value}:`, error);
    return value.toFixed(decimals).replace('.', ',');
  }
}

// Função para formatar percentuais
export function formatPercent(value: number, decimals: number = 2): string {
  // Verify the value is a valid number
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn(`[formatPercent] Invalid value: ${value}, defaulting to 0`);
    value = 0;
  }
  
  try {
    return `${value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}%`;
  } catch (error) {
    console.error(`[formatPercent] Error formatting value ${value}:`, error);
    return `${value.toFixed(decimals).replace('.', ',')}%`;
  }
}
