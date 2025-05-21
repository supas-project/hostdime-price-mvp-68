
import { PriceItem } from '@/types/pricing';
import { cpuComponents } from '@/data/cpu-components';
import { ComponentOption } from '@/types/component';
import { notifyListeners } from '@/services/price/listeners';
import { PriceService } from '@/services/price-service';

/**
 * Converts processor items from the price service to component options
 */
export async function convertProcessorItems(): Promise<ComponentOption[]> {
  try {
    // Get all processor items from the price service
    const items = await PriceService.getCategoryItems('processor');
    
    if (!items || items.length === 0) {
      console.log("[ProcessorConverter] No processor items found in price service");
      return cpuComponents.options;
    }
    
    console.log(`[ProcessorConverter] Converting ${items.length} processor items to component options`);
    
    // Map items to component options
    const options: ComponentOption[] = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      type: "Processador",
      specs: item.specs || [],
      isHardware: item.isHardware || true
    }));
    
    console.log(`[ProcessorConverter] Converted ${options.length} processor options`);
    return options;
  } catch (error) {
    console.error("[ProcessorConverter] Error converting processor items:", error);
    return cpuComponents.options;
  }
}

/**
 * Syncs processor data with the price service
 */
export async function syncProcessorData(): Promise<boolean> {
  try {
    // Get updated data from price service
    const items = await PriceService.getCategoryItems('processor');
    
    // Update CPU components with the latest data
    cpuComponents.options = await convertProcessorItems();
    
    console.log(`[ProcessorConverter] Synced ${cpuComponents.options.length} processor options`);
    
    // Notify listeners about the data changes
    notifyListeners();
    
    return true;
  } catch (error) {
    console.error("[ProcessorConverter] Error syncing processor data:", error);
    return false;
  }
}

/**
 * Converts a processor component option to a price item
 */
export function convertProcessorToItem(option: ComponentOption): PriceItem {
  return {
    id: option.id,
    name: option.name,
    description: option.description,
    price: option.price,
    type: 'cpu',
    specs: option.specs || [],
    isHardware: true
  };
}
