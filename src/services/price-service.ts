
import { PriceCategory, PriceData, PriceItem, ImportOptions } from '@/types/pricing';
import { supabase } from '@/lib/supabase';

// Import all the functionality from the modular files
import { 
  getCategory, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from './price/operations/category-operations';

import {
  addItem,
  updateItem,
  deleteItem
} from './price/operations/item-operations';

import {
  getAllData,
  persistData as saveData, // Use the renamed export
  resetData,
  checkForDataConflicts,
  forceRefreshFromLatestSource,
  importFromJSON,
  importFromCSV
} from './price/operations';

import {
  addDataChangeListener,
  removeDataChangeListener,
  notifyListeners
} from './price/listeners';

/**
 * Service for managing price data
 */
export class PriceService {
  static readonly PRICE_DATA_TABLE = 'price_data';
  static readonly supabase = supabase; // Expose supabase client for auth checks

  // Data retrieval
  static getAllData = getAllData;
  static getCategory = getCategory;
  
  // Category operations
  static addCategory = addCategory;
  static updateCategory = updateCategory;
  static deleteCategory = deleteCategory;
  
  // Item operations
  static addItem = addItem;
  static updateItem = updateItem;
  static deleteItem = deleteItem;
  
  // Data change listeners
  static addDataChangeListener = addDataChangeListener;
  static removeDataChangeListener = removeDataChangeListener;
  
  // Data operations
  static resetData = resetData;
  static checkForDataConflicts = checkForDataConflicts;
  static forceRefreshFromLatestSource = forceRefreshFromLatestSource;
  
  // Import/export operations
  static importFromJSON = importFromJSON;
  static importFromCSV = importFromCSV;
  
  // Private method - exposed here for backwards compatibility
  static saveData = saveData;

  // Get last modified time of price data
  static async getLastModifiedTime(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('price_data_updates')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error || !data) {
        console.error('[PriceService] Error getting last modified time:', error);
        return null;
      }
      
      return data.updated_at;
    } catch (error) {
      console.error('[PriceService] Error in getLastModifiedTime:', error);
      return null;
    }
  }

  // Reset data to defaults
  static async resetToDefaults(): Promise<boolean> {
    try {
      const newData = await resetData();
      return !!newData;
    } catch (error) {
      console.error('[PriceService] Error in resetToDefaults:', error);
      return false;
    }
  }
}
