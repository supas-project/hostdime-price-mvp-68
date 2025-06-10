
import { PriceItem } from '@/types/pricing';
import { getAllData } from '../data-retrieval';
import { saveData } from '../data-persistence';
import { notifyListeners } from '../../listeners';
import { parseBRLToFloat } from '@/utils/number-formatter';

/**
 * Updates an existing item in a category
 */
export async function updateItem(categoryId: string, itemId: string, updates: Partial<PriceItem>): Promise<PriceItem | null> {
  try {
    // Get all data
    const allData = await getAllData();
    
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
    
    // Garantir que o preço é processado corretamente - Sem aplicação de PayBack
    if (updates.price !== undefined) {
      console.log(`[updateItem] Original price value: ${updates.price} (${typeof updates.price})`);
      
      try {
        // Se é uma string ou algo que não é um número, converter
        if (typeof updates.price !== 'number' || isNaN(updates.price)) {
          console.log(`[updateItem] Converting non-number price: ${updates.price}`);
          const parsedPrice = parseBRLToFloat(String(updates.price));
          console.log(`[updateItem] Converted price to: ${parsedPrice}`);
          updates.price = parsedPrice;
        }
        
        // Verificar se é um número válido
        if (isNaN(updates.price as number)) {
          console.error(`[updateItem] Invalid price after conversion: ${updates.price}`);
          updates.price = allData[categoryId].items[itemIndex].price;
        }
      } catch (error) {
        console.error(`[updateItem] Error processing price: ${error}`);
        // Manter o preço original
        updates.price = allData[categoryId].items[itemIndex].price;
      }
      
      console.log(`[updateItem] Final price: ${updates.price}`);
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
    await saveData(updatedData);

    notifyListeners();
    return updatedItems[itemIndex];
  } catch (err: any) {
    console.error(`[updateItem] Error updating ${itemId} in ${categoryId}:`, err);
    return null;
  }
}
