
/**
 * Normaliza a capacidade de armazenamento garantindo que tenha unidade (GB ou TB)
 * @param capacity Capacidade a ser normalizada
 * @returns Capacidade formatada
 */
export function normalizeStorageCapacity(capacity: string | number): string {
  if (typeof capacity === 'number') {
    // Assumir GB por padrão
    return `${capacity}GB`;
  }
  
  if (!capacity) return '0GB';
  
  // Se já tiver unidade, retorna como está
  if (capacity.toUpperCase().includes('GB') || capacity.toUpperCase().includes('TB')) {
    return capacity;
  }
  
  // Caso contrário, adiciona GB como unidade padrão
  return `${capacity}GB`;
}

/**
 * Converte capacidade de armazenamento para GB para comparação
 * @param capacity Capacidade como string (ex: "500GB" ou "2TB")
 * @returns Capacidade em GB como número
 */
export function convertToGB(capacity: string): number {
  if (!capacity) return 0;
  
  const match = capacity.match(/(\d+(?:\.\d+)?)\s*(TB|GB)/i);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  
  if (unit === 'TB') {
    return value * 1024; // 1 TB = 1024 GB
  }
  
  return value;
}
