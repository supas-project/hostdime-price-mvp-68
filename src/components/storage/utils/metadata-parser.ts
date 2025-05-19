
/**
 * Parse unit info metadata from a price item
 * @param metadata The metadata object from a price item
 * @returns Parsed unit information
 */
export function parseUnitInfo(metadata: Record<string, any> = {}) {
  let additionalInfo: any = {};
  
  try {
    if (metadata.unitInfo) {
      additionalInfo = JSON.parse(metadata.unitInfo);
    }
  } catch (e) {
    console.error('Error parsing unitInfo', e);
  }
  
  return {
    minCapacity: additionalInfo.minCapacity || 100,
    maxCapacity: additionalInfo.maxCapacity || 1000,
    capacityUnit: additionalInfo.capacityUnit || 'GB',
    capacityStep: additionalInfo.capacityStep || 100,
    benefits: additionalInfo.benefits || metadata.features || []
  };
}

/**
 * Extract specs from a price item
 * @param item The price item
 * @returns Array of specs
 */
export function extractSpecs(item: any): string[] {
  return item.specs || [];
}
