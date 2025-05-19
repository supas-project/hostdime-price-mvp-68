import { supabase } from '@/lib/supabase';
import { PriceCategory, PriceData, PriceItem } from '@/types/pricing';
import { v4 as uuidv4 } from 'uuid';

export class PriceService {
  private static readonly PRICE_TABLE = 'price_table';
  private static listeners: ((data: PriceData) => void)[] = [];

  static async getAllData(): Promise<PriceData> {
    try {
      const { data: jsonData, error } = await supabase
        .from(PriceService.PRICE_TABLE)
        .select('*');

      if (error) {
        console.error("Error fetching all data:", error);
        throw new Error(error.message);
      }

      if (!jsonData || jsonData.length === 0) {
        console.warn("No data found in price table, returning default data");
        return {};
      }

      // Find the contract category and ensure it's processed first
      const contractCategory = jsonData.find((category: any) => category.id === 'contract');
      const otherCategories = jsonData.filter((category: any) => category.id !== 'contract');

      // Sort categories alphabetically, placing 'contract' first
      const sortedCategories = [
        ...(contractCategory ? [contractCategory] : []),
        ...otherCategories.sort((a: any, b: any) => a.name.localeCompare(b.name))
      ];

      // Process each category
      const priceData: PriceData = {};
      for (const category of sortedCategories) {
        priceData[category.id] = {
          id: category.id,
          name: category.name,
          items: category.items || [],
        };
      }

      return priceData as unknown as PriceData;
    } catch (err: any) {
      console.error("Error in getAllData:", err);
      throw new Error(err.message || "Failed to retrieve price data.");
    }
  }

  static async getCategory(categoryId: string): Promise<PriceCategory | null> {
    try {
      const { data: categoryData, error } = await supabase
        .from(PriceService.PRICE_TABLE)
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) {
        console.error(`Error fetching category ${categoryId}:`, error);
        return null;
      }

      if (!categoryData) {
        console.warn(`Category ${categoryId} not found`);
        return null;
      }

      return {
        id: categoryData.id,
        name: categoryData.name,
        items: categoryData.items || [],
      };
    } catch (err: any) {
      console.error(`Error in getCategory for ${categoryId}:`, err);
      return null;
    }
  }

  static async addCategory(category: Omit<PriceCategory, 'items'>): Promise<PriceCategory> {
    try {
      const newCategoryId = uuidv4();
      const categoryToAdd = { ...category, id: newCategoryId, items: [] };

      const { data, error } = await supabase
        .from(PriceService.PRICE_TABLE)
        .insert([categoryToAdd])
        .select()
        .single();

      if (error) {
        console.error("Error adding category:", error);
        throw new Error(error.message);
      }

      this.notifyListeners();
      return data as PriceCategory;
    } catch (err: any) {
      console.error("Error in addCategory:", err);
      throw new Error(err.message || "Failed to add category.");
    }
  }

  static async updateCategory(categoryId: string, updates: Partial<PriceCategory>): Promise<PriceCategory | null> {
    try {
      const { data, error } = await supabase
        .from(PriceService.PRICE_TABLE)
        .update(updates)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating category ${categoryId}:`, error);
        throw new Error(error.message);
      }

      this.notifyListeners();
      return data as PriceCategory;
    } catch (err: any) {
      console.error(`Error in updateCategory for ${categoryId}:`, err);
      return null;
    }
  }

  static async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(PriceService.PRICE_TABLE)
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error(`Error deleting category ${categoryId}:`, error);
        return false;
      }

      this.notifyListeners();
      return true;
    } catch (err: any) {
      console.error(`Error in deleteCategory for ${categoryId}:`, err);
      return false;
    }
  }

  static async addItem(categoryId: string, item: Omit<PriceItem, 'id'>): Promise<PriceItem | null> {
    try {
      const newItemId = uuidv4();
      const itemToAdd = { ...item, id: newItemId };

      // Get the category to update its items
      const category = await this.getCategory(categoryId);
      if (!category) {
        console.error(`Category ${categoryId} not found`);
        return null;
      }

      // Add the new item to the category's items
      const updatedItems = [...category.items, itemToAdd];

      // Update the category with the new items array
      const { data, error } = await supabase
        .from(PriceService.PRICE_TABLE)
        .update({ items: updatedItems })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        console.error(`Error adding item to category ${categoryId}:`, error);
        throw new Error(error.message);
      }

      this.notifyListeners();
      return itemToAdd as PriceItem;
    } catch (err: any) {
      console.error(`Error in addItem to ${categoryId}:`, err);
      return null;
    }
  }

  static async updateItem(categoryId: string, itemId: string, updates: Partial<PriceItem>): Promise<PriceItem | null> {
    try {
      // Get the category to update its items
      const category = await this.getCategory(categoryId);
      if (!category) {
        console.error(`Category ${categoryId} not found`);
        return null;
      }

      // Map over the items and replace the item with the matching ID
      const updatedItems = category.items.map(item => {
        if (item.id === itemId) {
          return { ...item, ...updates };
        }
        return item;
      });

      // Update the category with the new items array
      const { data, error } = await supabase
        .from(PriceService.PRICE_TABLE)
        .update({ items: updatedItems })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating item ${itemId} in category ${categoryId}:`, error);
        throw new Error(error.message);
      }

      this.notifyListeners();
      return { ...updates, id: itemId } as PriceItem;
    } catch (err: any) {
      console.error(`Error in updateItem for ${itemId} in ${categoryId}:`, err);
      return null;
    }
  }

  static async deleteItem(categoryId: string, itemId: string): Promise<boolean> {
    try {
      // Get the category to update its items
      const category = await this.getCategory(categoryId);
      if (!category) {
        console.error(`Category ${categoryId} not found`);
        return false;
      }

      // Filter out the item with the matching ID
      const updatedItems = category.items.filter(item => item.id !== itemId);

      // Update the category with the new items array
      const { data, error } = await supabase
        .from(PriceService.PRICE_TABLE)
        .update({ items: updatedItems })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        console.error(`Error deleting item ${itemId} from category ${categoryId}:`, error);
        return false;
      }

      this.notifyListeners();
      return true;
    } catch (err: any) {
      console.error(`Error in deleteItem for ${itemId} from ${categoryId}:`, err);
      return false;
    }
  }

  static addDataChangeListener(listener: (data: PriceData) => void) {
    PriceService.listeners.push(listener);
  }

  static removeDataChangeListener(listener: (data: PriceData) => void) {
    PriceService.listeners = PriceService.listeners.filter(l => l !== listener);
  }

  private static notifyListeners() {
    this.getAllData().then(data => {
      PriceService.listeners.forEach(listener => listener(data));
    }).catch(error => {
      console.error("Error notifying listeners:", error);
    });
  }

  static async resetData(): Promise<PriceData | null> {
    try {
      // Delete all existing records
      const { error: deleteError } = await supabase
        .from(PriceService.PRICE_TABLE)
        .delete()
        .neq('id', null);  // Delete all records

      if (deleteError) {
        console.error("Error deleting existing data:", deleteError);
        throw new Error(deleteError.message);
      }

      // Re-import initial data (assuming you have a function for this)
      const { initExternalStorageData, syncDiskDataWithPriceService } = await import('./component-sync-service');
      await syncDiskDataWithPriceService();
      await initExternalStorageData();

      // Fetch and return the new data
      const newData = await this.getAllData();
      this.notifyListeners();
      return newData;
    } catch (error: any) {
      console.error("Error resetting data:", error);
      throw new Error(error.message || "Failed to reset data.");
    }
  }

  static async checkForDataConflicts(): Promise<boolean> {
    try {
      // Implement a more robust conflict detection mechanism
      // This could involve comparing timestamps or versions of the data

      // For now, just return false
      return false;
    } catch (error) {
      console.error("Error checking for data conflicts:", error);
      return false;
    }
  }

  static async forceRefreshFromLatestSource(): Promise<PriceData | null> {
    try {
      // Re-fetch all data from the source (e.g., Supabase)
      const newData = await this.getAllData();

      // Notify listeners about the refreshed data
      this.notifyListeners();

      return newData;
    } catch (error) {
      console.error("Error refreshing data from source:", error);
      return null;
    }
  }
}
