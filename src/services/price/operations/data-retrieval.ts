
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
    
    // Check multiple categories for disks - 'disk', 'discos_internos', and 'discos'
    let diskItems: PriceItem[] = [];
    
    if (allData.disk && Array.isArray(allData.disk.items)) {
      console.log(`[getDiskOptions] Found ${allData.disk.items.length} disk items in 'disk' category`);
      diskItems = [...diskItems, ...allData.disk.items];
    }
    
    if (allData.discos_internos && Array.isArray(allData.discos_internos.items)) {
      console.log(`[getDiskOptions] Found ${allData.discos_internos.items.length} disk items in 'discos_internos' category`);
      diskItems = [...diskItems, ...allData.discos_internos.items];
    }
    
    if (allData.discos && Array.isArray(allData.discos.items)) {
      console.log(`[getDiskOptions] Found ${allData.discos.items.length} disk items in 'discos' category`);
      diskItems = [...diskItems, ...allData.discos.items];
    }
    
    if (diskItems.length === 0) {
      console.warn("[getDiskOptions] No disk items found in any disk category");
      return [];
    }
    
    console.log(`[getDiskOptions] Found total of ${diskItems.length} disk items across categories`);
    
    // Convert price items to disk options
    const diskOptions: PricedDiskOption[] = diskItems
      .filter(item => {
        // Verificar se o item é um disco válido
        // Aceitar tipos 'nvme', 'ssd', 'hdd' ou subtypes com esses valores
        const type = item.type?.toLowerCase();
        const subtype = item.subtype?.toLowerCase();
        
        const validDiskType = 
          type === 'nvme' || type === 'ssd' || type === 'hdd' || 
          subtype === 'nvme' || subtype === 'ssd' || subtype === 'hdd' ||
          type === 'disk' || type === 'disco'; // Aceitar item genérico de disco
        
        if (!validDiskType) {
          console.log(`[getDiskOptions] Ignoring non-disk item: ${item.name}`);
        }
        return validDiskType;
      })
      .map(item => {
        // Determinar o tipo real
        let diskType: 'nvme' | 'ssd' | 'hdd' = 'ssd'; // Padrão
        
        // Verificar tipo em várias propriedades possíveis
        if (item.type === 'nvme' || item.type === 'ssd' || item.type === 'hdd') {
          diskType = item.type as 'nvme' | 'ssd' | 'hdd';
        } else if (item.subtype === 'nvme' || item.subtype === 'ssd' || item.subtype === 'hdd') {
          diskType = item.subtype as 'nvme' | 'ssd' | 'hdd';
        } else if (item.metadata?.type === 'nvme' || item.metadata?.type === 'ssd' || item.metadata?.type === 'hdd') {
          diskType = item.metadata.type as 'nvme' | 'ssd' | 'hdd';
        } else {
          // Tentar extrair do nome
          const name = item.name.toLowerCase();
          if (name.includes('nvme')) diskType = 'nvme';
          else if (name.includes('ssd')) diskType = 'ssd';
          else if (name.includes('hdd')) diskType = 'hdd';
        }
        
        // Create a consistent capacity property, prioritizing the item's own capacity
        const capacity: string = item.capacity || 
                               (item.metadata?.capacity as string) || 
                               item.subtype || 
                               '1TB'; // Default if no capacity info

        // Log mapping details for debugging
        console.log(`[getDiskOptions] Mapping disk: ${item.name}, type: ${diskType}, capacity: ${capacity}`);
        
        // Extract potential metadata information from various sources
        const metadata = item.metadata || {};
        
        // Extract specs from appropriate sources
        const specs = item.specs || [];
        const readSpeed = metadata.readSpeed || specs.find(s => s.toLowerCase().includes('leitura:'))?.split(':')[1]?.trim() || 'N/A';
        const writeSpeed = metadata.writeSpeed || specs.find(s => s.toLowerCase().includes('escrita:'))?.split(':')[1]?.trim() || 'N/A';
        const iops = metadata.iops || specs.find(s => s.toLowerCase().includes('iops:'))?.split(':')[1]?.trim() || 'N/A';
        const recommended = Array.isArray(metadata.recommended) ? metadata.recommended : [];
        
        // Build the disk option with consistent data and fallbacks
        return {
          id: item.id,
          name: item.name || `${diskType.toUpperCase()} ${capacity}`,
          type: diskType,
          capacity: capacity,
          price: item.price || 0,
          specs: {
            readSpeed,
            writeSpeed,
            iops,
            recommended
          },
          description: item.description || `${diskType.toUpperCase()} ${capacity}`,
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
