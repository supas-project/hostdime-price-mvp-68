
import { supabase } from '@/lib/supabase';
import { PriceCategory, PriceData, PriceItem } from '@/types/pricing';
import { v4 as uuidv4 } from 'uuid';

export class PriceService {
  private static readonly PRICE_DATA_TABLE = 'price_data';
  private static listeners: ((data: PriceData) => void)[] = [];

  static async getAllData(): Promise<PriceData> {
    try {
      // Fetch the data from price_data table
      const { data: priceData, error } = await supabase
        .from(PriceService.PRICE_DATA_TABLE)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching price data:", error);
        throw new Error(error.message);
      }

      if (!priceData || priceData.length === 0) {
        console.warn("No data found in price data table, returning default data");
        return {};
      }

      // Return the data from the JSON column
      const jsonData = priceData[0].data;

      if (!jsonData) {
        console.warn("No JSON data found in price data record");
        return {};
      }

      // Type assertion to ensure we get a PriceData object
      return jsonData as PriceData;
    } catch (err: any) {
      console.error("Error in getAllData:", err);
      throw new Error(err.message || "Failed to retrieve price data.");
    }
  }

  static async getCategory(categoryId: string): Promise<PriceCategory | null> {
    try {
      // Get all data and find the category
      const allData = await this.getAllData();
      return allData[categoryId] || null;
    } catch (err: any) {
      console.error(`Error in getCategory for ${categoryId}:`, err);
      return null;
    }
  }

  static async addCategory(category: Omit<PriceCategory, "items">): Promise<PriceCategory> {
    try {
      const newCategoryId = category.id || uuidv4();
      const newCategory: PriceCategory = { 
        id: newCategoryId, 
        name: category.name,
        items: [] 
      };

      // Get all existing data
      const allData = await this.getAllData();
      
      // Add the new category
      const updatedData = {
        ...allData,
        [newCategoryId]: newCategory
      };

      // Save the updated data
      await this.saveData(updatedData);
      
      this.notifyListeners();
      return newCategory;
    } catch (err: any) {
      console.error("Error in addCategory:", err);
      throw new Error(err.message || "Failed to add category.");
    }
  }

  static async updateCategory(categoryId: string, updates: Partial<PriceCategory>): Promise<PriceCategory | null> {
    try {
      // Get all existing data
      const allData = await this.getAllData();
      
      // Find the category to update
      if (!allData[categoryId]) {
        console.error(`Category ${categoryId} not found`);
        return null;
      }
      
      // Update the category
      const updatedCategory: PriceCategory = {
        ...allData[categoryId],
        ...updates
      };
      
      const updatedData = {
        ...allData,
        [categoryId]: updatedCategory
      };
      
      // Save the updated data
      await this.saveData(updatedData);
      
      this.notifyListeners();
      return updatedCategory;
    } catch (err: any) {
      console.error(`Error in updateCategory for ${categoryId}:`, err);
      return null;
    }
  }

  static async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      // Get all existing data
      const allData = await this.getAllData();
      
      // Remove the category
      if (!allData[categoryId]) {
        console.error(`Category ${categoryId} not found`);
        return false;
      }
      
      const { [categoryId]: removed, ...updatedData } = allData;
      
      // Save the updated data
      await this.saveData(updatedData);
      
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

      // Get all data
      const allData = await this.getAllData();
      
      // Find the category
      if (!allData[categoryId]) {
        console.error(`Category ${categoryId} not found`);
        return null;
      }
      
      // Add the new item to the category's items
      const updatedCategory = {
        ...allData[categoryId],
        items: [...allData[categoryId].items, itemToAdd]
      };
      
      // Update the data
      const updatedData = {
        ...allData,
        [categoryId]: updatedCategory
      };
      
      // Save the updated data
      await this.saveData(updatedData);

      this.notifyListeners();
      return itemToAdd as PriceItem;
    } catch (err: any) {
      console.error(`Error in addItem to ${categoryId}:`, err);
      return null;
    }
  }

  static async updateItem(categoryId: string, itemId: string, updates: Partial<PriceItem>): Promise<PriceItem | null> {
    try {
      // Get all data
      const allData = await this.getAllData();
      
      // Find the category
      if (!allData[categoryId]) {
        console.error(`Category ${categoryId} not found`);
        return null;
      }
      
      // Find the item index
      const itemIndex = allData[categoryId].items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        console.error(`Item ${itemId} not found in category ${categoryId}`);
        return null;
      }
      
      // Update the item
      const updatedItems = [...allData[categoryId].items];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };
      
      // Update the category
      const updatedCategory = {
        ...allData[categoryId],
        items: updatedItems
      };
      
      // Update the data
      const updatedData = {
        ...allData,
        [categoryId]: updatedCategory
      };
      
      // Save the updated data
      await this.saveData(updatedData);

      this.notifyListeners();
      return updatedItems[itemIndex];
    } catch (err: any) {
      console.error(`Error in updateItem for ${itemId} in ${categoryId}:`, err);
      return null;
    }
  }

  static async deleteItem(categoryId: string, itemId: string): Promise<boolean> {
    try {
      // Get all data
      const allData = await this.getAllData();
      
      // Find the category
      if (!allData[categoryId]) {
        console.error(`Category ${categoryId} not found`);
        return false;
      }
      
      // Filter out the item
      const updatedItems = allData[categoryId].items.filter(item => item.id !== itemId);
      
      // Update the category
      const updatedCategory = {
        ...allData[categoryId],
        items: updatedItems
      };
      
      // Update the data
      const updatedData = {
        ...allData,
        [categoryId]: updatedCategory
      };
      
      // Save the updated data
      await this.saveData(updatedData);

      this.notifyListeners();
      return true;
    } catch (err: any) {
      console.error(`Error in deleteItem for ${itemId} from ${categoryId}:`, err);
      return false;
    }
  }

  private static async saveData(data: PriceData): Promise<void> {
    try {
      // Insert a new record with the updated data
      const { error } = await supabase
        .from(PriceService.PRICE_DATA_TABLE)
        .insert({
          data: data,
          updated_at: new Date().toISOString() // Convert Date to ISO string
        });

      if (error) {
        console.error("Error saving price data:", error);
        throw new Error(error.message);
      }
    } catch (err: any) {
      console.error("Error in saveData:", err);
      throw new Error(err.message || "Failed to save price data.");
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
      // Re-import initial data
      const { syncDiskDataWithPriceService, initExternalStorageData } = await import('./component-sync-service');
      
      // Create empty default data
      const defaultData: PriceData = {};
      
      // Save the default data first
      await this.saveData(defaultData);
      
      // Initialize storage data
      await initExternalStorageData();
      await syncDiskDataWithPriceService();
      
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
      // For now, just return false
      return false;
    } catch (error) {
      console.error("Error checking for data conflicts:", error);
      return false;
    }
  }

  static async forceRefreshFromLatestSource(): Promise<PriceData | null> {
    try {
      // Re-fetch all data from the source
      const newData = await this.getAllData();
      
      // Notify listeners
      this.notifyListeners();
      
      return newData;
    } catch (error) {
      console.error("Error refreshing data from source:", error);
      return null;
    }
  }
  
  // Methods for file imports
  static importFromJSON(content: string): PriceData {
    try {
      const data = JSON.parse(content) as PriceData;
      // Save the imported data
      this.saveData(data);
      return data;
    } catch (error) {
      console.error("Error importing JSON:", error);
      throw new Error("Invalid JSON format");
    }
  }
  
  static importFromCSV(content: string): PriceData {
    // For simplicity, we'll just throw an error for now
    // In a real implementation, this would parse CSV into the correct format
    throw new Error("CSV import not implemented yet");
  }
}
