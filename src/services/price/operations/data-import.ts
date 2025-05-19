
import { PriceData } from '@/types/pricing';
import { saveData } from './data-persistence';

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
