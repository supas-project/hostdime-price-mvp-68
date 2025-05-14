
// Função para formatar valores monetários no formato brasileiro
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Função para formatar números com separador de milhares
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// Função para formatar percentuais
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}%`;
}
