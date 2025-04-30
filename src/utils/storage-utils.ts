
/**
 * Utilitários para formatação e conversão de unidades de armazenamento
 */

/**
 * Normaliza uma string de capacidade para o formato padronizado com unidade
 * @param capacity String de capacidade (ex: "1TB", "500GB", "1")
 * @returns Capacidade normalizada com unidade
 */
export function normalizeStorageCapacity(capacity: string): string {
  if (!capacity) return "N/A";
  
  // Se já tiver unidade (GB ou TB), retorna formatado
  if (capacity.match(/\d+\s*[GT]B/i)) {
    // Remove espaços extras entre número e unidade
    return capacity.replace(/(\d+)\s*([GT]B)/i, "$1$2");
  }

  // Se for apenas número, assume GB por padrão
  if (capacity.match(/^\d+$/)) {
    return `${capacity}GB`;
  }

  // Verifica se é número com TB ou GB escrito por extenso
  const extensoMatch = capacity.match(/(\d+(?:\.\d+)?)\s*(terabytes?|gigabytes?|tb|gb)/i);
  if (extensoMatch) {
    const valor = extensoMatch[1];
    const unidade = extensoMatch[2].toLowerCase();
    if (unidade.startsWith('t')) {
      return `${valor}TB`;
    } else {
      return `${valor}GB`;
    }
  }

  return capacity; // Retorna como está se não conseguir normalizar
}

/**
 * Formata a exibição de capacidade para mostrar de forma consistente
 * Corrige exibição entre GB e TB para melhor legibilidade
 * @param capacity Capacidade em qualquer formato
 * @returns Capacidade formatada com unidade adequada (TB para valores grandes)
 */
export function formatStorageCapacity(capacity: string | number): string {
  if (typeof capacity === 'number') {
    // Se for número maior que 1000, converte para TB com uma casa decimal
    if (capacity >= 1000) {
      const tbValue = capacity / 1000;
      return `${tbValue.toFixed(1).replace(/\.0$/, '')}TB`;
    }
    return `${Math.round(capacity)}GB`;
  }
  
  // Trata string de capacidade
  const normalized = normalizeStorageCapacity(capacity);
  
  // Converte TB fracionários para GB se for menor que 1TB
  const tbMatch = normalized.match(/^([0-9.]+)TB$/i);
  if (tbMatch) {
    const tbValue = parseFloat(tbMatch[1]);
    if (tbValue < 1) {
      return `${Math.round(tbValue * 1000)}GB`;
    }
  }
  
  return normalized;
}

/**
 * Extrai a capacidade de um texto ou especificação
 * @param text Texto para extrair a capacidade
 * @returns Capacidade extraída com unidade
 */
export function extractStorageCapacity(text: string | string[] | undefined): string {
  if (!text) return "N/A";
  
  // Se for um array de especificações, procura pelo item com "Capacidade:"
  if (Array.isArray(text)) {
    const capacitySpec = text.find(spec => 
      spec.toLowerCase().includes('capacidade:')
    );
    
    if (capacitySpec) {
      const capacity = capacitySpec.split(':')[1]?.trim();
      return normalizeStorageCapacity(capacity || "");
    }
    
    // Se não encontrou especificação de capacidade, procura por padrões de capacidade em todos os itens
    for (const spec of text) {
      const match = spec.match(/(\d+)\s*([GT]B)/i);
      if (match) {
        return `${match[1]}${match[2].toUpperCase()}`;
      }
    }
  } else {
    // Se for uma string, procura por padrões de capacidade
    const match = text.match(/(\d+)\s*([GT]B)/i);
    if (match) {
      return `${match[1]}${match[2].toUpperCase()}`;
    }
  }
  
  return "N/A";
}

/**
 * Determina se um valor representa uma capacidade TB
 */
export function isTBCapacity(capacity: string): boolean {
  return /TB/i.test(capacity);
}

/**
 * Converte capacidade para GB
 * Função crítica usada nos cálculos de RAID para normalizar valores
 */
export function convertToGB(capacity: string): number {
  // Se já for um número, retorna ele mesmo
  if (typeof capacity === 'number') {
    return capacity;
  }
  
  // Normaliza a string de capacidade primeiro
  const normalizedCapacity = normalizeStorageCapacity(capacity);
  
  // Procura por valor em TB
  const tbMatch = normalizedCapacity.match(/(\d+(?:\.\d+)?)\s*TB/i);
  if (tbMatch) {
    return parseFloat(tbMatch[1]) * 1000; // Converte TB para GB
  }
  
  // Procura por valor em GB
  const gbMatch = normalizedCapacity.match(/(\d+(?:\.\d+)?)\s*GB/i);
  if (gbMatch) {
    return parseFloat(gbMatch[1]);
  }
  
  // Se for apenas um número, assume GB
  const numMatch = normalizedCapacity.match(/^(\d+(?:\.\d+)?)$/);
  if (numMatch) {
    return parseFloat(numMatch[1]);
  }
  
  return 0; // Valor padrão se não conseguir converter
}
