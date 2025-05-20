
import { PriceService } from '@/services/price-service';
import { PriceItem } from '@/types/pricing';
import { PricedDiskOption } from '@/types/storage';

/**
 * Gets disk options from the price data
 * @returns {Promise<PricedDiskOption[]>} Array of disk options
 */
export async function getDiskOptions(): Promise<PricedDiskOption[]> {
  try {
    console.log("[getDiskOptions] Retrieving disk options from price data...");
    
    // Get all price data
    const allData = await PriceService.getAllData();
    
    // Check if disk category exists
    if (!allData.disk || !Array.isArray(allData.disk.items)) {
      console.log("[getDiskOptions] No disk category or items found");
      return [];
    }
    
    console.log(`[getDiskOptions] Found ${allData.disk.items.length} disk items`);
    
    // Convert price items to disk options
    const diskOptions: PricedDiskOption[] = allData.disk.items
      .filter(item => {
        // Ensure the item has a type property that's a disk type
        const validDiskType = item.type === 'nvme' || item.type === 'ssd' || item.type === 'hdd';
        if (!validDiskType) {
          console.log(`[getDiskOptions] Ignoring non-disk item: ${item.name} (type: ${item.type})`);
        }
        return validDiskType;
      })
      .map(item => {
        // Create a consistent capacity property, prioritizing the item's own capacity
        const capacity: string = item.capacity || 
                               (item.metadata?.capacity as string) || 
                               (item.subtype || '');

        // Log mapping details for debugging
        console.log(`[getDiskOptions] Mapping disk: ${item.name}, type: ${item.type}, capacity: ${capacity}`);
        
        // Ensure we have valid metadata fields or reasonable defaults
        const metadata = item.metadata || {};

        // Extract values with fallbacks
        const readSpeed = metadata.readSpeed || 'N/A';
        const writeSpeed = metadata.writeSpeed || 'N/A';
        const iops = metadata.iops || 'N/A';
        const recommended = Array.isArray(metadata.recommended) ? metadata.recommended : [];
        
        // Build the disk option with consistent data
        return {
          id: item.id,
          name: item.name,
          type: item.type as 'nvme' | 'ssd' | 'hdd',
          capacity: capacity,
          price: item.price,
          specs: {
            readSpeed,
            writeSpeed,
            iops,
            recommended
          },
          description: item.description || `${item.type.toUpperCase()} ${capacity}`,
          iops: iops,
          throughput: metadata.throughput || 'N/A',
          raid: Boolean(metadata.raid)
        };
      });
    
    console.log(`[getDiskOptions] Returning ${diskOptions.length} disk options`);
    return diskOptions;
  } catch (error) {
    console.error("[getDiskOptions] Error retrieving disk options:", error);
    return [];
  }
}

/**
 * Get all price data
 * Re-export from PriceService for consistency
 */
export async function getAllData() {
  return await PriceService.getAllData();
}

/**
 * Force refresh from latest source
 * Re-export from PriceService for consistency
 */
export async function forceRefreshFromLatestSource() {
  return await PriceService.forceRefreshFromLatestSource();
}
