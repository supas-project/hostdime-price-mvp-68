

import { ComponentOption } from "@/types/component";
import { StorageItems, StorageItemsMap } from "@/types/wizard";

/**
 * Extrai a capacidade de armazenamento do nome/especificações do disco
 */
export function extractStorageCapacity(disk: ComponentOption): string {
  if (disk.specs && disk.specs.some(spec => spec.includes('Capacidade:'))) {
    const spec = disk.specs.find(s => s.includes('Capacidade:'));
    if (spec) {
      return spec.split(':')[1].trim();
    }
  }
  
  // Tentar extrair do nome
  const matches = disk.name.match(/(\d+)\s*(TB|GB|MB)/i);
  if (matches) {
    return `${matches[1]}${matches[2]}`;
  }
  
  return 'N/A';
}

/**
 * Normaliza a formatação da capacidade de armazenamento
 */
export function normalizeStorageCapacity(capacity: string): string {
  if (!capacity) return 'N/A';
  
  // Limpa a string
  const clean = capacity.trim().replace(/\s+/g, '');
  
  // Verifica se já tem unidades
  if (clean.match(/\d+(TB|GB|MB|TB)/i)) {
    return clean.toUpperCase();
  }
  
  // Tenta extrair apenas o número
  const num = parseFloat(clean);
  if (isNaN(num)) return capacity;
  
  // Determina a unidade apropriada com base no tamanho
  if (num >= 1000) {
    return `${num / 1000}TB`;
  }
  
  return `${num}GB`;
}

/**
 * Converte a capacidade para GB (para cálculos)
 */
export function convertToGB(capacity: string): number {
  if (!capacity) return 0;
  
  const clean = capacity.trim().toUpperCase();
  const matches = clean.match(/(\d+(?:\.\d+)?)\s*(TB|GB|MB)/i);
  
  if (!matches) return 0;
  
  const value = parseFloat(matches[1]);
  const unit = matches[2].toUpperCase();
  
  switch (unit) {
    case 'TB':
      return value * 1000;
    case 'GB':
      return value;
    case 'MB':
      return value / 1000;
    default:
      return value;
  }
}

/**
 * Formata a capacidade de armazenamento para exibição
 */
export function formatStorageCapacity(capacityGB: number): string {
  if (capacityGB <= 0) return '0 GB';
  
  if (capacityGB >= 1000) {
    const tbValue = capacityGB / 1000;
    return `${tbValue % 1 === 0 ? tbValue : tbValue.toFixed(1)} TB`;
  }
  
  return `${capacityGB % 1 === 0 ? capacityGB : capacityGB.toFixed(1)} GB`;
}

/**
 * Converte itens de armazenamento do formato de mapa para array
 */
export function convertStorageItemsMapToArray(storageMap: StorageItemsMap | undefined): StorageItems {
  if (!storageMap) {
    return {
      internal: [],
      external: []
    };
  }
  
  const result: StorageItems = {
    internal: [],
    external: []
  };
  
  Object.values(storageMap).forEach(({option}) => {
    if (option.subtype === 'external') {
      result.external.push(option);
    } else {
      result.internal.push(option);
    }
  });
  
  return result;
}

/**
 * Converte itens de conectividade para formato de array
 */
export function convertConnectivityToArray(connectivityMap: {[key: string]: {option: ComponentOption, quantity: number}}): ComponentOption[] {
  if (!connectivityMap) {
    return [];
  }
  
  return Object.values(connectivityMap).map(item => item.option);
}

/**
 * Converte mapa de serviços personalizados para array
 */
export function convertCustomServicesToArray(servicesMap: {[key: string]: {option: ComponentOption, quantity: number}}): ComponentOption[] {
  if (!servicesMap) {
    return [];
  }
  
  return Object.values(servicesMap).map(item => item.option);
}
