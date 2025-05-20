
import { supabase } from '@/lib/supabase';
import { PriceData, PriceItem } from '@/types/pricing';
import { PricedDiskOption } from '@/types/storage';
import { PRICE_DATA_TABLE } from '../constants';

/**
 * Gets all price data from the database
 */
export async function getAllData(): Promise<PriceData> {
  try {
    console.log("[PriceService] Getting all price data");
    
    // Fetch the data from price_data table
    const { data: priceData, error } = await supabase
      .from(PRICE_DATA_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error("[PriceService] Error fetching price data:", error);
      throw new Error(error.message);
    }

    if (!priceData || priceData.length === 0) {
      console.warn("[PriceService] No data found in price data table, returning default data");
      return {};
    }

    // Return the data from the JSON column
    const jsonData = priceData[0].data;

    if (!jsonData) {
      console.warn("[PriceService] No JSON data found in price data record");
      return {};
    }

    console.log("[PriceService] Successfully retrieved price data:", 
      Object.keys(jsonData).length > 0 ? 
      `Found ${Object.keys(jsonData).length} categories` : 
      "Empty data object");
    
    // First ensure we're dealing with an object, not an array
    if (Array.isArray(jsonData)) {
      console.error("[PriceService] Expected object data but received array");
      return {};
    }
    
    // Update local cache timestamp to track when data was last fetched
    localStorage.setItem('price_data_last_fetch', new Date().toISOString());
    
    // Type assertion with proper cast - first to unknown, then to PriceData
    return jsonData as unknown as PriceData;
  } catch (err: any) {
    console.error("[PriceService] Error in getAllData:", err);
    throw new Error(err.message || "Failed to retrieve price data.");
  }
}

/**
 * Gets all disk options from the price data
 */
export async function getDiskOptions(): Promise<PricedDiskOption[]> {
  try {
    console.log("[PriceService] Getting disk options from price data");
    
    // Get all price data
    const priceData = await getAllData();
    
    // Check if the disk category exists in the price data
    if (!priceData || !priceData.disk || !Array.isArray(priceData.disk.items)) {
      console.warn("[PriceService] No disk items found in price data");
      return [];
    }
    
    console.log("[PriceService] Found disk items:", priceData.disk.items.length);
    
    // Convert price data items to PricedDiskOption format
    const diskOptions: PricedDiskOption[] = priceData.disk.items.map(item => {
      // Extract disk information from item properties
      const metadata = item.metadata || {};
      
      // Get the type from either subtype, type or default to "hdd"
      const type = item.subtype || item.type || "hdd";
      
      // Get capacity from either capacity property, metadata or extract from name
      const capacity = item.capacity || 
                      (metadata && typeof metadata === 'object' && 'capacity' in metadata ? metadata.capacity as string : null) || 
                      extractCapacityFromName(item.name);
      
      // Create disk spec object with safe defaults
      const specs = {
        readSpeed: metadata && typeof metadata === 'object' && 'readSpeed' in metadata ? metadata.readSpeed as string : "N/A",
        writeSpeed: metadata && typeof metadata === 'object' && 'writeSpeed' in metadata ? metadata.writeSpeed as string : "N/A",
        iops: metadata && typeof metadata === 'object' && 'iops' in metadata ? metadata.iops as string : "N/A",
        recommended: metadata && typeof metadata === 'object' && 'recommended' in metadata && Array.isArray(metadata.recommended) 
          ? metadata.recommended as string[] 
          : []
      };
      
      // Construct the disk option
      return {
        id: item.id || `disk-${type}-${capacity}`,
        name: item.name || `${type.toUpperCase()} ${capacity}`,
        type: type as "nvme" | "ssd" | "hdd",
        capacity: capacity as string,
        price: item.price || 0,
        specs: specs,
        description: item.description || "",
      };
    });
    
    console.log(`[PriceService] Retrieved ${diskOptions.length} disk options`);
    return diskOptions;
  } catch (error) {
    console.error("[PriceService] Error getting disk options:", error);
    return [];
  }
}

// Helper function to extract capacity from disk name
function extractCapacityFromName(name: string): string {
  if (!name) return "Unknown";
  
  // Look for patterns like "500GB", "1TB", "2 TB", etc.
  const capacityMatch = name.match(/(\d+(?:\.\d+)?)\s*(?:GB|TB|G|T)/i);
  if (capacityMatch) {
    const value = capacityMatch[0];
    return value.replace(/\s+/g, ''); // Remove any spaces
  }
  
  return "Unknown";
}
