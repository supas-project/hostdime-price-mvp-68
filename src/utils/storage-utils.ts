
/**
 * Normalizes storage capacity format to ensure consistency.
 * Examples: 
 * - "1" becomes "1GB" 
 * - "1GB" stays "1GB"
 * - "1TB" stays "1TB"
 * - "1000GB" becomes "1TB"
 * @param capacity The storage capacity string or number to normalize
 * @returns Normalized capacity string
 */
export function normalizeStorageCapacity(capacity: string | number): string {
  if (!capacity) return "0GB";
  
  // If it's a number, convert to string and assume GB
  if (typeof capacity === "number") {
    return capacity >= 1000 ? `${capacity / 1000}TB` : `${capacity}GB`;
  }
  
  // Handle string format
  const capacityStr = capacity.toString().trim();
  
  // If already has unit suffix, parse and normalize
  if (capacityStr.toLowerCase().endsWith("tb")) {
    return capacityStr;
  }
  
  if (capacityStr.toLowerCase().endsWith("gb")) {
    const valueGB = parseFloat(capacityStr.toLowerCase().replace("gb", ""));
    return valueGB >= 1000 ? `${valueGB / 1000}TB` : capacityStr;
  }
  
  // If no unit, assume GB
  const value = parseFloat(capacityStr);
  if (isNaN(value)) return "0GB";
  
  return value >= 1000 ? `${value / 1000}TB` : `${value}GB`;
}

/**
 * Formats a storage capacity number (in GB) to a human-readable string with appropriate units
 * @param capacityGB The capacity in gigabytes
 * @returns Formatted capacity string with units
 */
export function formatStorageCapacity(capacityGB: number): string {
  if (capacityGB >= 1000) {
    return `${(capacityGB / 1000).toFixed(1)}TB`;
  }
  return `${Math.round(capacityGB)}GB`;
}

/**
 * Converts a capacity string (with units) to GB value
 * @param capacity The capacity string (e.g., "500GB", "1TB")
 * @returns The capacity value in GB
 */
export function convertToGB(capacity: string): number {
  if (!capacity) return 0;
  
  const match = capacity.toLowerCase().match(/(\d+\.?\d*)([tgm]b)?/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'gb';
  
  switch(unit.toLowerCase()) {
    case 'tb': return value * 1000;
    case 'gb': return value;
    case 'mb': return value / 1000;
    default: return value;
  }
}

/**
 * Utility function to extract storage capacity from disk name or specs
 * Replacement for the missing function referenced in components
 */
export function extractStorageCapacity(disk: any): string {
  // First check specs for capacity information
  if (disk.specs && Array.isArray(disk.specs)) {
    const capacitySpec = disk.specs.find((spec: string) => 
      spec.toLowerCase().includes('capacidade:')
    );
    if (capacitySpec) {
      const capacity = capacitySpec.split(':')[1]?.trim();
      if (capacity) return normalizeStorageCapacity(capacity);
    }
  }
  
  // Then try to extract from name
  if (disk.name) {
    const nameMatch = disk.name.match(/(\d+)\s*([GT]B)/i);
    if (nameMatch) {
      return `${nameMatch[1]}${nameMatch[2].toUpperCase()}`;
    }
  }
  
  // Default fallback
  return "N/A";
}
