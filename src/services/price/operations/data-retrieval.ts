
import { supabase } from '@/lib/supabase';
import { PriceData } from '@/types/pricing';
import { PRICE_DATA_TABLE } from '../constants';
import { connectivityComponents } from '@/data/connectivity-components';

/**
 * Gets all price data from the database
 */
export async function getAllData(): Promise<PriceData> {
  try {
    console.log("[PriceService] Getting all price data from Supabase");
    
    // Verificar se o usuário está autenticado
    const { data: session, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error("[PriceService] Authentication error:", authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }
    
    if (!session.session) {
      console.warn("[PriceService] No active session found");
      return {};
    }
    
    console.log("[PriceService] User authenticated:", session.session.user.email);
    
    // Fetch the data from price_data table
    const { data: priceData, error } = await supabase
      .from(PRICE_DATA_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error("[PriceService] Error fetching price data:", error);
      throw new Error(error.message);
    }

    if (!priceData || priceData.length === 0) {
      console.warn("[PriceService] No data found in price data table");
      return {};
    }

    // Return the data from the JSON column
    const jsonData = priceData[0].data;

    if (!jsonData) {
      console.warn("[PriceService] No JSON data found in price data record");
      return {};
    }

    console.log("[PriceService] Successfully retrieved price data:", 
      Object.keys(jsonData).length > 0 ? 
      `Found ${Object.keys(jsonData).length} categories` : 
      "Empty data object");
    
    // First ensure we're dealing with an object, not an array
    if (Array.isArray(jsonData)) {
      console.error("[PriceService] Expected object data but received array");
      return {};
    }
    
    // Garantir que todas as categorias tenham um array de itens válido
    const processedData = {...jsonData};
    
    // Remove categorias vazias ou com poucos itens válidos
    const filteredData = {};
    
    for (const [categoryId, categoryData] of Object.entries(processedData)) {
      if (!categoryData || typeof categoryData !== 'object') {
        console.warn(`[PriceService] Skipping invalid category ${categoryId}`);
        continue;
      }
      
      const category = categoryData as any;
      
      // Verificar se a categoria tem itens válidos
      if (!category.items || !Array.isArray(category.items)) {
        console.warn(`[PriceService] Category ${categoryId} has no valid items array, skipping`);
        continue;
      }
      
      // Filtrar itens válidos (que tenham pelo menos nome e preço)
      const validItems = category.items.filter(item => 
        item && 
        typeof item === 'object' && 
        item.name && 
        typeof item.name === 'string' && 
        item.name.trim() !== '' &&
        (item.price !== undefined && item.price !== null)
      );
      
      // Só incluir categorias que tenham pelo menos 1 item válido
      if (validItems.length > 0) {
        filteredData[categoryId] = {
          ...category,
          items: validItems
        };
        console.log(`[PriceService] Category ${categoryId} has ${validItems.length} valid items`);
      } else {
        console.warn(`[PriceService] Category ${categoryId} has no valid items, excluding from data`);
      }
    }
    
    // Lista de categorias essenciais que devem sempre existir (mesmo vazias)
    const essentialCategories = [
      'memory', 'processor', 'contract', 'datacenter', 'sistemaoperacional'
    ];
    
    // Garantir que categorias essenciais existam
    for (const categoryId of essentialCategories) {
      if (!filteredData[categoryId]) {
        console.log(`[PriceService] Creating essential category: ${categoryId}`);
        filteredData[categoryId] = {
          id: categoryId,
          name: getCategoryFriendlyName(categoryId),
          items: []
        };
      }
    }
    
    console.log(`[PriceService] Final filtered data has ${Object.keys(filteredData).length} categories:`, 
      Object.keys(filteredData).join(', '));
    
    return filteredData as unknown as PriceData;
  } catch (err: any) {
    console.error("[PriceService] Error in getAllData:", err);
    throw new Error(err.message || "Failed to retrieve price data.");
  }
}

/**
 * Helper function to get friendly names for categories
 */
function getCategoryFriendlyName(categoryId: string): string {
  const categoryNames: Record<string, string> = {
    'memory': 'Memória',
    'processor': 'Processadores',
    'contract': 'Contratos',
    'datacenter': 'Data Center',
    'sistemaoperacional': 'Sistema Operacional'
  };
  
  return categoryNames[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
}
