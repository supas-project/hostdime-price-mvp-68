
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
    
    // Convert price data items to PricedDiskOption format
    const diskOptions: PricedDiskOption[] = priceData.disk.items.map(item => {
      // Extract disk information from item metadata or use defaults
      const metadata = item.metadata || {};
      
      // Create a customMetadata object by casting metadata to any to access custom properties
      const customMetadata = metadata as any;
      const type = customMetadata.type || "hdd";
      const capacity = customMetadata.capacity || item.name || "Unknown";
      
      return {
        id: item.id || `disk-${type}-${capacity}`,
        name: item.name || `${type.toUpperCase()} ${capacity}`,
        type: type as "nvme" | "ssd" | "hdd",
        capacity: capacity,
        price: item.price || 0, // Use price instead of pricePerMonth to match the interface
        specs: {
          readSpeed: customMetadata.readSpeed || "N/A",
          writeSpeed: customMetadata.writeSpeed || "N/A",
          iops: customMetadata.iops || "N/A",
          recommended: customMetadata.recommended || []
        },
        description: item.description || "",
        iops: customMetadata.iops || "N/A",
        throughput: customMetadata.throughput || "N/A",
      };
    });
    
    console.log(`[PriceService] Retrieved ${diskOptions.length} disk options`);
    return diskOptions;
  } catch (error) {
    console.error("[PriceService] Error getting disk options:", error);
    return [];
  }
}
