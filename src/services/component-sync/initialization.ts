import { notifyListeners } from '@/services/price/listeners';
import { syncExternalStorageData, syncStorageData } from './storage-converter';
import { cleanupCategories } from './category-manager';
import { syncConnectivityItems } from './connectivity-converter';
import { syncProcessorData as syncProcessors } from './processor-converter';
import { syncMemoryData as syncMemories } from './memory-converter';

/**
 * Syncs disk data with the price service
 */
export async function syncDiskDataWithPriceService(): Promise<boolean> {
  try {
    await syncStorageData();
    return true;
  } catch (error) {
    console.error("Error syncing disk data with price service:", error);
    return false;
  }
}

/**
 * Initializes external storage data
 */
export async function initExternalStorageData(): Promise<boolean> {
  try {
    await syncExternalStorageData();
    return true;
  } catch (error) {
    console.error("Error initializing external storage data:", error);
    return false;
  }
}

/**
 * Cleans up duplicate categories
 */
export async function cleanupDuplicateCategories(): Promise<boolean> {
  try {
    await cleanupCategories();
    return true;
  } catch (error) {
    console.error("Error cleaning up duplicate categories:", error);
    return false;
  }
}

/**
 * Syncs connectivity data
 */
export async function syncConnectivityData(): Promise<boolean> {
  try {
    await syncConnectivityItems();
    return true;
  } catch (error) {
    console.error("Error syncing connectivity data:", error);
    return false;
  }
}

/**
 * Syncs processor data - exporting the function from processor-converter
 */
export async function syncProcessorData(): Promise<boolean> {
  try {
    await syncProcessors();
    return true;
  } catch (error) {
    console.error("Error syncing processor data:", error);
    return false;
  }
}

/**
 * Syncs memory data - exporting the function from memory-converter
 */
export async function syncMemoryData(): Promise<boolean> {
  try {
    await syncMemories();
    return true;
  } catch (error) {
    console.error("Error syncing memory data:", error);
    return false;
  }
}

/**
 * Initializes server categories
 */
export async function initializeServerCategories(): Promise<boolean> {
  try {
    // Sync storage data
    await syncStorageData();
    await syncExternalStorageData();
    
    // Sync connectivity data
    await syncConnectivityItems();
    
    // Sync processor data
    await syncProcessorData();
    
    // Sync memory data
    await syncMemoryData();
    
    // Notify listeners about the data changes
    notifyListeners();
    
    console.log("Server categories initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing server categories:", error);
    return false;
  }
}
