import {
  addCategory as addCategoryOperation,
  addItem as addItemOperation,
  deleteCategory as deleteCategoryOperation,
  deleteItem as deleteItemOperation,
  getAllData as getAllDataOperation,
  getCategory as getCategoryOperation,
  getItem as getItemOperation,
  importData as importDataOperation,
  saveData as saveDataOperation,
  updateCategory as updateCategoryOperation,
  updateItem as updateItemOperation,
  checkForDataConflicts as checkForDataConflictsOperation,
  forceRefreshFromLatestSource as forceRefreshFromLatestSourceOperation,
} from './services/price/operations';
import { notifyListeners } from './services/price/listeners';
import { PriceData } from '@/types/pricing';
import { getDiskOptions } from './services/price/operations/data-retrieval';
import { PricedDiskOption } from '@/types/storage';

/**
 * Service for managing price data
 */
export const PriceService = {
  /**
   * Gets all price data
   */
  getAllData: async (): Promise<PriceData> => {
    return await getAllDataOperation();
  },

  /**
   * Saves price data
   * @param data The price data to save
   */
  saveData: async (data: PriceData): Promise<void> => {
    return await saveDataOperation(data);
  },

  /**
   * Imports price data
   * @param data The price data to import
   * @param options The import options
   */
  importData: async (data: PriceData, options: { merge: boolean; overwrite: boolean }): Promise<void> => {
    return await importDataOperation(data, options);
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
    return await deleteCategoryOperation(categoryId);
  },

  /**
   * Adds a new item to a category
   * @param categoryId The ID of the category to add the item to
   * @param item The item to add
   */
  addItem: async (categoryId: string, item: { id: string; name: string; description: string; price: number }): Promise<{ id: string; name: string; description: string; price: number } | null> => {
    return await addItemOperation(categoryId, item);
  },

  /**
   * Updates an existing item in a category
   * @param categoryId The ID of the category the item belongs to
   * @param itemId The ID of the item to update
   * @param updates The updates to apply
   */
  updateItem: async (categoryId: string, itemId: string, updates: Partial<{ id: string; name: string; description: string; price: number }>): Promise<{ id: string; name: string; description: string; price: number } | null> => {
    return await updateItemOperation(categoryId, itemId, updates);
  },

  /**
   * Deletes an item from a category
   * @param categoryId The ID of the category the item belongs to
   * @param itemId The ID of the item to delete
   */
  deleteItem: async (categoryId: string, itemId: string): Promise<void> => {
    return await deleteItemOperation(categoryId, itemId);
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
  getItem: async (categoryId: string, itemId: string): Promise<{ id: string; name: string; description: string; price: number } | null> => {
    return await getItemOperation(categoryId, itemId);
  },

  /**
   * Registers a listener for price data changes
   * @param listener The listener to register
   */
  registerListener: (listener: (data: PriceData) => void): void => {
    notifyListeners.addListener(listener);
  },

  /**
   * Unregisters a listener for price data changes
   * @param listener The listener to unregister
   */
  unregisterListener: (listener: (data: PriceData) => void): void => {
    notifyListeners.removeListener(listener);
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
  forceRefreshFromLatestSource: async (): Promise<void> => {
    return await forceRefreshFromLatestSourceOperation();
  },
  
  /**
   * Gets disk options from the price data
   */
  getDiskOptions: async (): Promise<PricedDiskOption[]> => {
    return await getDiskOptions();
  },
};
