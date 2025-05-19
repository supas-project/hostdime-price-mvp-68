
import { supabase } from '@/lib/supabase';
import { PriceCategory, PriceData } from '@/types/pricing';
import { v4 as uuidv4 } from 'uuid';
import { saveData, getAllData } from './data-operations';
import { notifyListeners } from './listeners';

/**
 * Gets a specific category by ID from the price data
 */
export async function getCategory(categoryId: string): Promise<PriceCategory | null> {
  try {
    // Get all data and find the category
    const allData = await getAllData();
    return allData[categoryId] || null;
  } catch (err: any) {
    console.error(`Error in getCategory for ${categoryId}:`, err);
    return null;
  }
}

/**
 * Adds a new category to the price data
 */
export async function addCategory(category: Omit<PriceCategory, "items">): Promise<PriceCategory> {
  try {
    const newCategoryId = category.id || uuidv4();
    const newCategory: PriceCategory = { 
      id: newCategoryId, 
      name: category.name,
      items: [] 
    };

    // Get all existing data
    const allData = await getAllData();
    
    // Add the new category
    const updatedData = {
      ...allData,
      [newCategoryId]: newCategory
    };

    // Save the updated data
    await saveData(updatedData);
    
    notifyListeners();
    return newCategory;
  } catch (err: any) {
    console.error("Error in addCategory:", err);
    throw new Error(err.message || "Failed to add category.");
  }
}

/**
 * Updates an existing category with new data
 */
export async function updateCategory(categoryId: string, updates: Partial<PriceCategory>): Promise<PriceCategory | null> {
  try {
    // Get all existing data
    const allData = await getAllData();
    
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
    await saveData(updatedData);
    
    notifyListeners();
    return updatedCategory;
  } catch (err: any) {
    console.error(`Error in updateCategory for ${categoryId}:`, err);
    return null;
  }
}

/**
 * Deletes a category from the price data
 */
export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    // Get all existing data
    const allData = await getAllData();
    
    // Remove the category
    if (!allData[categoryId]) {
      console.error(`Category ${categoryId} not found`);
      return false;
    }
    
    const { [categoryId]: removed, ...updatedData } = allData;
    
    // Save the updated data
    await saveData(updatedData);
    
    notifyListeners();
    return true;
  } catch (err: any) {
    console.error(`Error in deleteCategory for ${categoryId}:`, err);
    return false;
  }
}
