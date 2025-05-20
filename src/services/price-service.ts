
import { supabase } from "@/integrations/supabase/client";
import {
  addCategory as addCategoryOperation,
  updateCategory as updateCategoryOperation,
  deleteCategory as deleteCategoryOperation,
  getCategory as getCategoryOperation,
  checkForDataConflicts as checkForDataConflictsOperation,
  forceRefreshFromLatestSource as forceRefreshFromLatestSourceOperation,
  getDiskOptions as getDiskOptionsOperation
} from './price/operations';
import { addItem, updateItem, deleteItem, getItem } from './price/operations/item-operations';
import { getAllData, saveData } from './price/operations/data-persistence';
import { importData } from './price/operations/data-import';
import { addDataChangeListener, removeDataChangeListener, notifyListeners } from './price/listeners';
import { PriceData } from '@/types/pricing';
import { PricedDiskOption } from '@/types/storage';

/**
 * Service for managing price data
 */
export const PriceService = {
  /**
   * Supabase client instance for authentication operations
   */
  supabase,

  /**
   * Gets all price data
   */
  getAllData: async (): Promise<PriceData> => {
    return await getAllData();
  },

  /**
   * Saves price data
   * @param data The price data to save
   */
  saveData: async (data: PriceData): Promise<void> => {
    return await saveData(data);
  },

  /**
   * Imports price data
   * @param data The price data to import
   * @param options The import options
   */
  importData: async (data: PriceData, options: { merge: boolean; overwrite: boolean }): Promise<void> => {
    return await importData(data, options);
  },

  /**
   * Adds a new category
   * @param category The category to add
   */
  addCategory: async (category: { id: string; name: string }): Promise<{ id: string; name: string } | null> => {
    return await addCategoryOperation(category);
  },

  /**
   * Updates an existing category
   * @param categoryId The ID of the category to update
   * @param updates The updates to apply
   */
  updateCategory: async (categoryId: string, updates: Partial<{ id: string; name: string }>): Promise<{ id: string; name: string } | null> => {
    return await updateCategoryOperation(categoryId, updates);
  },

  /**
   * Deletes a category
   * @param categoryId The ID of the category to delete
   */
  deleteCategory: async (categoryId: string): Promise<void> => {
    await deleteCategoryOperation(categoryId);
  },

  /**
   * Adds a new item to a category
   * @param categoryId The ID of the category to add the item to
   * @param item The item to add
   */
  addItem: async (categoryId: string, item: any): Promise<any | null> => {
    return await addItem(categoryId, item);
  },

  /**
   * Updates an existing item in a category
   * @param categoryId The ID of the category the item belongs to
   * @param itemId The ID of the item to update
   * @param updates The updates to apply
   */
  updateItem: async (categoryId: string, itemId: string, updates: any): Promise<any | null> => {
    return await updateItem(categoryId, itemId, updates);
  },

  /**
   * Deletes an item from a category
   * @param categoryId The ID of the category the item belongs to
   * @param itemId The ID of the item to delete
   */
  deleteItem: async (categoryId: string, itemId: string): Promise<void> => {
    await deleteItem(categoryId, itemId);
  },

  /**
   * Gets a category by ID
   * @param categoryId The ID of the category to get
   */
  getCategory: async (categoryId: string): Promise<{ id: string; name: string; items: any[] } | null> => {
    return await getCategoryOperation(categoryId);
  },

  /**
   * Gets an item by ID from a category
   * @param categoryId The ID of the category the item belongs to
   * @param itemId The ID of the item to get
   */
  getItem: async (categoryId: string, itemId: string): Promise<any | null> => {
    return await getItem(categoryId, itemId);
  },

  /**
   * Registers a listener for price data changes
   * @param listener The listener to register
   */
  addDataChangeListener: (listener: () => void): void => {
    addDataChangeListener(listener);
  },

  /**
   * Unregisters a listener for price data changes
   */
  removeDataChangeListener: (): void => {
    removeDataChangeListener();
  },

  /**
   * Checks for data conflicts
   */
  checkForDataConflicts: async (): Promise<boolean> => {
    return await checkForDataConflictsOperation();
  },

  /**
   * Forces a refresh from the latest source
   */
  forceRefreshFromLatestSource: async (): Promise<PriceData | null> => {
    return await forceRefreshFromLatestSourceOperation();
  },
  
  /**
   * Gets disk options from the price data
   */
  getDiskOptions: async (): Promise<PricedDiskOption[]> => {
    return await getDiskOptionsOperation();
  },

  /**
   * Gets the timestamp of the last modification of the price data
   */
  getLastModifiedTime: async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('price_data_updates')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (error || !data || !data[0]) {
        return null;
      }
      
      return data[0].updated_at;
    } catch (err) {
      console.error('Error getting last modified time:', err);
      return null;
    }
  },

  /**
   * Reset data to defaults
   */
  resetToDefaults: async (): Promise<boolean> => {
    try {
      // Implement a basic reset functionality that clears all data
      const emptyData = {};
      await saveData(emptyData as PriceData);
      return true;
    } catch (err) {
      console.error('Error resetting data to defaults:', err);
      return false;
    }
  }
};
