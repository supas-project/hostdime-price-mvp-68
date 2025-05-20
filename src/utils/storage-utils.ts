
import { ComponentOption } from "@/types/component";
import { StorageItems, StorageItemsMap } from "@/types/wizard";

/**
 * Extracts storage capacity from disk name/specs
 */
export function extractStorageCapacity(disk: ComponentOption): string {
  if (disk.specs && disk.specs.some(spec => spec.includes('Capacidade:'))) {
    const spec = disk.specs.find(s => s.includes('Capacidade:'));
    if (spec) {
      return spec.split(':')[1].trim();
    }
  }
  
  // Try to extract from name
  const matches = disk.name.match(/(\d+)\s*(TB|GB|MB)/i);
  if (matches) {
    return `${matches[1]}${matches[2]}`;
  }
  
  return 'N/A';
}

/**
 * Normalizes storage capacity formatting
 */
export function normalizeStorageCapacity(capacity: string): string {
  if (!capacity) return 'N/A';
  
  // Clean up the string
  const clean = capacity.trim().replace(/\s+/g, '');
  
  // Check if already has units
  if (clean.match(/\d+(TB|GB|MB|TB)/i)) {
    return clean.toUpperCase();
  }
  
  // Try to extract just the number
  const num = parseFloat(clean);
  if (isNaN(num)) return capacity;
  
  // Determine appropriate unit based on size
  if (num >= 1000) {
    return `${num / 1000}TB`;
  }
  
  return `${num}GB`;
}

/**
 * Converts map-style storage items to array-style storage items
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
 * Converts connectivity items to array format
 */
export function convertConnectivityToArray(connectivityMap: {[key: string]: {option: ComponentOption, quantity: number}}): ComponentOption[] {
  if (!connectivityMap) {
    return [];
  }
  
  return Object.values(connectivityMap).map(item => item.option);
}

/**
 * Converts custom services map to array
 */
export function convertCustomServicesToArray(servicesMap: {[key: string]: {option: ComponentOption, quantity: number}}): ComponentOption[] {
  if (!servicesMap) {
    return [];
  }
  
  return Object.values(servicesMap).map(item => item.option);
}
