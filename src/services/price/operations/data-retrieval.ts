
import { supabase } from '@/lib/supabase';
import { PriceData } from '@/types/pricing';
import { PRICE_DATA_TABLE } from '../constants';

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
    
    // Garantir que todas as categorias tenham um array de itens
    const processedData = {...jsonData};
    
    // Verificar se há categoria 'disk' com itens e 'storage'/'external_storage' sem itens
    // Nesse caso, podemos tentar copiar os itens relevantes
    if (processedData.disk?.items?.length > 0 && 
        (!processedData.storage?.items || processedData.storage?.items?.length === 0) &&
        (!processedData.external_storage?.items || processedData.external_storage?.items?.length === 0)) {
      console.log("[PriceService] Detected disk items but no storage items, creating missing storage items");
      
      // Primeiro, garantir que todas as categorias existam
      if (!processedData.storage) {
        processedData.storage = {
          id: 'storage',
          name: 'Armazenamento',
          items: []
        };
      }
      
      if (!processedData.external_storage) {
        processedData.external_storage = {
          id: 'external_storage',
          name: 'Storage Externo',
          items: []
        };
      }
      
      // Converter itens do disk para storage
      const diskItems = processedData.disk.items || [];
      
      // Itens para storage (armazenamento interno)
      const internalItems = diskItems
        .filter(item => item.type === 'internal' || !item.type)
        .map(item => ({
          ...item,
          id: `storage-${item.id}`,
          type: 'storage',
          subtype: item.subtype || 'block',
          description: item.description || `${item.name} - Armazenamento interno`
        }));
        
      // Itens para external_storage
      const externalItems = diskItems
        .filter(item => item.type === 'external' || item.subtype === 'external')
        .map(item => ({
          ...item,
          id: `external-${item.id}`,
          type: 'storage',
          subtype: 'block',
          description: item.description || `${item.name} - Armazenamento externo`
        }));
        
      // Se não houver itens específicos para external, copiar alguns do internal como exemplo
      if (externalItems.length === 0 && internalItems.length > 0) {
        const exampleExternalItems = internalItems.slice(0, 2).map(item => ({
          ...item,
          id: `external-${item.id}`,
          name: `${item.name} (Externo)`,
          description: `${item.name} - Armazenamento externo`,
          type: 'storage',
          subtype: 'external'
        }));
        
        processedData.external_storage.items = exampleExternalItems;
        console.log(`[PriceService] Created ${exampleExternalItems.length} example external storage items`);
      } else if (externalItems.length > 0) {
        processedData.external_storage.items = externalItems;
        console.log(`[PriceService] Added ${externalItems.length} external storage items`);
      }
      
      if (internalItems.length > 0) {
        processedData.storage.items = internalItems;
        console.log(`[PriceService] Added ${internalItems.length} internal storage items`);
      }
    }
    
    // Verificar e corrigir todas as categorias
    for (const categoryId of Object.keys(processedData)) {
      if (!processedData[categoryId]) {
        console.warn(`[PriceService] Category ${categoryId} is undefined, skipping`);
        continue;
      }
      
      if (!processedData[categoryId].items) {
        console.warn(`[PriceService] Category ${categoryId} has no items property, adding empty array`);
        processedData[categoryId].items = [];
      } else if (!Array.isArray(processedData[categoryId].items)) {
        console.warn(`[PriceService] Items for category ${categoryId} is not an array, fixing`);
        processedData[categoryId].items = Array.isArray(processedData[categoryId].items) ? 
          processedData[categoryId].items : [];
      }
      
      console.log(`[PriceService] Category ${categoryId} has ${processedData[categoryId].items.length} items`);
      
      // Log detalhes para categorias de storage
      if (categoryId === 'storage' || categoryId === 'external_storage') {
        console.log(`[PriceService] ${categoryId} items:`, 
          processedData[categoryId].items.map(item => 
            `${item.id}: ${item.name} (${item.type}/${item.subtype || 'unknown'})`
          ).join(', '));
      }
    }
    
    // Verifica se ambas categorias storage e external_storage existem e estão vazias
    // Isso pode indicar um problema de sincronização
    if ((processedData.storage?.items?.length === 0 && processedData.external_storage?.items?.length === 0) &&
        (processedData.disk?.items?.length > 0)) {
      console.warn("[PriceService] Both storage categories are empty but disk items exist, this might be a sync issue");
    }
    
    // Type assertion with proper cast - first to unknown, then to PriceData
    return processedData as unknown as PriceData;
  } catch (err: any) {
    console.error("[PriceService] Error in getAllData:", err);
    throw new Error(err.message || "Failed to retrieve price data.");
  }
}
