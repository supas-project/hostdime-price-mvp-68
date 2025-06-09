
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
      console.warn(`[PriceService] Categoria ${categoryId} não encontrada, considerando como já removida`);
      return true; // If category doesn't exist, consider it successful
    }
    
    console.log(`[PriceService] Categoria ${categoryId} encontrada, procedendo com exclusão`);
    console.log(`[PriceService] Categorias antes da exclusão:`, Object.keys(allData).join(", "));
    
    // Create updated data without the category - use a more robust approach
    const updatedData = {};
    for (const [key, value] of Object.entries(allData)) {
      if (key !== categoryId) {
        updatedData[key] = value;
      }
    }
    
    console.log(`[PriceService] Categoria ${categoryId} removida da estrutura de dados`);
    console.log(`[PriceService] Categorias após exclusão:`, Object.keys(updatedData).join(", "));
    
    // Verify the category was actually removed from our updated data
    if (updatedData[categoryId]) {
      console.error(`[PriceService] ERRO: Categoria ${categoryId} ainda existe na estrutura atualizada!`);
      return false;
    }
    
    // Save the updated data with retry mechanism
    console.log(`[PriceService] Salvando dados atualizados...`);
    let saveSuccess = false;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (!saveSuccess && retryCount < maxRetries) {
      try {
        await saveData(updatedData);
        saveSuccess = true;
        console.log(`[PriceService] Dados salvos com sucesso na tentativa ${retryCount + 1}`);
      } catch (saveError) {
        retryCount++;
        console.warn(`[PriceService] Tentativa ${retryCount} de salvamento falhou:`, saveError);
        
        if (retryCount >= maxRetries) {
          console.error(`[PriceService] Falha ao salvar após ${maxRetries} tentativas`);
          throw saveError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // Verify deletion with a fresh fetch from the database
    console.log(`[PriceService] Verificando exclusão com dados frescos...`);
    let verificationAttempts = 0;
    let verificationSuccess = false;
    
    while (!verificationSuccess && verificationAttempts < 3) {
      // Wait a bit before verification to ensure data propagation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const verificationData = await getAllData();
      
      if (!verificationData[categoryId]) {
        verificationSuccess = true;
        console.log(`[PriceService] Exclusão verificada com sucesso - categoria ${categoryId} removida`);
        
        // Notify listeners with fresh data
        notifyListeners(verificationData);
        return true;
      } else {
        verificationAttempts++;
        console.warn(`[PriceService] Tentativa ${verificationAttempts} de verificação: categoria ${categoryId} ainda existe`);
      }
    }
    
    if (!verificationSuccess) {
      console.error(`[PriceService] ERRO: Categoria ${categoryId} ainda existe após todas as tentativas de exclusão!`);
      return false;
    }
    
    return true;
  } catch (err: any) {
    console.error(`[PriceService] Erro crítico ao excluir categoria ${categoryId}:`, err);
    return false;
  }
}
