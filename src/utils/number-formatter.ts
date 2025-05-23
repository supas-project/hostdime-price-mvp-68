
// Função para formatar valores monetários no formato brasileiro
export function formatCurrency(value: number): string {
  // Verify the value is a valid number
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn(`[formatCurrency] Invalid value: ${value}, defaulting to 0`);
    value = 0;
  }
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    console.error(`[formatCurrency] Error formatting value ${value}:`, error);
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
}

// Função para converter string formatada em BRL para número
export function parseBRLToFloat(value: string | number): number {
  // Se já for um número, retorna diretamente
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  try {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    
    // Converter para string
    const valueStr = String(value);
    
    // Remover R$ e espaços
    let cleaned = valueStr.replace(/[R$\s]/g, '');
    
    // Verificar se estamos lidando com formato brasileiro (vírgula como decimal)
    if (cleaned.includes(',')) {
      // Formato brasileiro: primeiro substituir pontos (separadores de milhar)
      cleaned = cleaned.replace(/\./g, '');
      // Depois substituir vírgula por ponto para decimal
      cleaned = cleaned.replace(',', '.');
    }
    
    // Converter para número
    const result = parseFloat(cleaned);
    
    if (isNaN(result)) {
      console.warn(`[parseBRLToFloat] Failed to parse value: ${value}, defaulting to 0`);
      return 0;
    }
    
    console.log(`[parseBRLToFloat] Successfully parsed: ${valueStr} → ${result}`);
    return result;
  } catch (error) {
    console.error(`[parseBRLToFloat] Error parsing value ${value}:`, error);
    return 0;
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
