
import { saveData } from '../data-persistence';
import { getAllData } from '../data-retrieval';
import { notifyListeners } from '../../listeners';

/**
 * Deletes a category from the price data
 */
export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    console.log(`[PriceService] Iniciando exclusão da categoria ${categoryId}`);
    
    // Get all existing data
    const allData = await getAllData();
    
    // Check if the category exists
    if (!allData[categoryId]) {
      console.error(`[PriceService] Categoria ${categoryId} não encontrada`);
      return false;
    }
    
    console.log(`[PriceService] Categoria ${categoryId} encontrada, procedendo com exclusão`);
    console.log(`[PriceService] Categorias antes da exclusão:`, Object.keys(allData).join(", "));
    
    // Create updated data without the category
    const updatedData = { ...allData };
    delete updatedData[categoryId];
    
    console.log(`[PriceService] Categoria ${categoryId} removida da estrutura de dados`);
    console.log(`[PriceService] Categorias após exclusão:`, Object.keys(updatedData).join(", "));
    
    // Save the updated data
    console.log(`[PriceService] Salvando dados atualizados...`);
    await saveData(updatedData);
    console.log(`[PriceService] Dados salvos com sucesso após exclusão da categoria ${categoryId}`);
    
    // Verify deletion by fetching fresh data
    console.log(`[PriceService] Verificando exclusão...`);
    const verificationData = await getAllData();
    
    if (verificationData[categoryId]) {
      console.error(`[PriceService] ERRO: Categoria ${categoryId} ainda existe após exclusão!`);
      return false;
    }
    
    console.log(`[PriceService] Exclusão verificada - categoria ${categoryId} removida com sucesso`);
    
    // Notify listeners with fresh data
    notifyListeners(verificationData);
    
    return true;
  } catch (err: any) {
    console.error(`[PriceService] Erro crítico ao excluir categoria ${categoryId}:`, err);
    return false;
  }
}
