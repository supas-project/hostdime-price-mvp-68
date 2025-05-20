import { PriceData, ImportOptions } from '@/types/pricing';
import { saveData } from './data-persistence';
import { getAllData } from './data-persistence';

/**
 * Imports price data with options for merging or overwriting
 */
export async function importData(data: PriceData, options: ImportOptions): Promise<void> {
  try {
    console.log("[PriceService] Importing price data with options:", options);
    
    if (options.merge) {
      // Get existing data and merge with imported data
      const existingData = await getAllData();
      
      // For each category in the imported data
      for (const categoryId in data) {
        if (existingData[categoryId] && !options.overwrite) {
          // Merge items from the imported category with existing items
          const existingItems = existingData[categoryId].items || [];
          const importedItems = data[categoryId].items || [];
          
          // Create a map of existing items by ID for quick lookup
          const existingItemMap = new Map();
          existingItems.forEach(item => existingItemMap.set(item.id, item));
          
          // Add or update items
          importedItems.forEach(item => {
            existingItemMap.set(item.id, item); // Overwrite if exists
          });
          
          // Convert back to array
          const mergedItems = Array.from(existingItemMap.values());
          
          // Update the category with merged items
          existingData[categoryId] = {
            ...data[categoryId],
            items: mergedItems
          };
        } else {
          // Add the category as-is from the imported data
          existingData[categoryId] = data[categoryId];
        }
      }
      
      // Save the merged data
      await saveData(existingData);
    } else {
      // Save the imported data as-is (overwrite everything)
      await saveData(data);
    }
    
    console.log("[PriceService] Data import completed successfully");
  } catch (error) {
    console.error("[PriceService] Error importing data:", error);
    throw error;
  }
}

/**
 * Imports price data from JSON
 */
export function importFromJSON(content: string): PriceData {
  try {
    console.log("[PriceService] Importing price data from JSON");
    const data = JSON.parse(content) as PriceData;
    // Save the imported data
    saveData(data);
    return data;
  } catch (error) {
    console.error("[PriceService] Error importing JSON:", error);
    throw new Error("Invalid JSON format");
  }
}

/**
 * Imports price data from CSV
 */
export function importFromCSV(content: string): PriceData {
  // For simplicity, we'll just throw an error for now
  // In a real implementation, this would parse CSV into the correct format
  throw new Error("CSV import not implemented yet");
}
