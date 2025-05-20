
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
    
    // Lista de todas as categorias esperadas no sistema
    const expectedCategories = [
      'storage', 'external_storage', 'disk', 'memory', 'processor', 
      'contract', 'connectivity', 'port_speed', 'datacenter', 
      'sistemaoperacional', 'ip_blocks', 'serviçospersonalizados'
    ];
    
    // Verificar e criar categorias faltantes
    for (const categoryId of expectedCategories) {
      if (!processedData[categoryId]) {
        console.log(`[PriceService] Creating missing category: ${categoryId}`);
        processedData[categoryId] = {
          id: categoryId,
          name: getCategoryFriendlyName(categoryId),
          items: []
        };
      }
      
      // Garantir que cada categoria tenha um array de itens válido
      if (!processedData[categoryId].items) {
        console.warn(`[PriceService] Category ${categoryId} has no items property, adding empty array`);
        processedData[categoryId].items = [];
      } else if (!Array.isArray(processedData[categoryId].items)) {
        console.warn(`[PriceService] Items for category ${categoryId} is not an array, fixing`);
        processedData[categoryId].items = [];
      }
    }
    
    // Processamento especial para storage e external_storage
    handleStorageCategories(processedData);
    
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
      
      // Log detalhes para categorias de interesse
      if (categoryId === 'storage' || categoryId === 'external_storage' || 
          categoryId === 'disk' || categoryId === 'processor' || 
          categoryId === 'memory') {
        if (processedData[categoryId].items.length > 0) {
          console.log(`[PriceService] ${categoryId} items:`, 
            processedData[categoryId].items.map(item => 
              `${item.id}: ${item.name} (${item.type || 'unknown'}/${item.subtype || 'unknown'})`
            ).join(', '));
        } else {
          console.warn(`[PriceService] ${categoryId} has no items, check if this is expected`);
        }
      }
    }
    
    return processedData as unknown as PriceData;
  } catch (err: any) {
    console.error("[PriceService] Error in getAllData:", err);
    throw new Error(err.message || "Failed to retrieve price data.");
  }
}

/**
 * Helper function to handle special processing for storage categories
 */
function handleStorageCategories(processedData: any) {
  // Verificar se há categoria 'disk' com itens e 'storage'/'external_storage' sem itens
  if (processedData.disk?.items?.length > 0 && 
      (processedData.storage?.items?.length === 0 || 
      processedData.external_storage?.items?.length === 0)) {
    console.log("[PriceService] Detected disk items but incomplete storage items, creating missing storage items");
    
    // Garantir que os items sejam arrays
    if (!Array.isArray(processedData.storage.items)) {
      processedData.storage.items = [];
    }
    
    if (!Array.isArray(processedData.external_storage.items)) {
      processedData.external_storage.items = [];
    }
    
    // Converter itens do disk para storage e external_storage se ainda não existirem
    const diskItems = processedData.disk.items || [];
    
    // Itens para storage (armazenamento interno)
    if (processedData.storage.items.length === 0) {
      const internalItems = diskItems
        .filter(item => item.type === 'internal' || !item.type)
        .map(item => ({
          ...item,
          id: `storage-${item.id}`,
          type: 'storage',
          subtype: item.subtype || 'block',
          description: item.description || `${item.name} - Armazenamento interno`
        }));
        
      if (internalItems.length > 0) {
        processedData.storage.items = internalItems;
        console.log(`[PriceService] Added ${internalItems.length} internal storage items`);
      }
    }
        
    // Itens para external_storage
    if (processedData.external_storage.items.length === 0) {
      const externalItems = diskItems
        .filter(item => item.type === 'external' || item.subtype === 'external')
        .map(item => ({
          ...item,
          id: `external-${item.id}`,
          type: 'storage',
          subtype: 'external',
          description: item.description || `${item.name} - Armazenamento externo`
        }));
        
      // Se não houver itens específicos para external, criar alguns exemplos
      if (externalItems.length === 0) {
        console.log("[PriceService] No external storage items found, creating example items");
        
        // Criar itens de exemplo para external_storage
        const exampleExternalItems = [
          {
            id: `external-storage-standard`,
            name: "Standard Block Storage",
            description: "Storage externo de baixo custo para dados acessados com pouca frequência",
            price: 0.05, // por GB
            type: 'storage',
            subtype: 'external',
            specs: [
              "IOPS: 1500",
              "Throughput: 60 MB/s",
              "Ideal para backups"
            ],
            isHardware: true
          },
          {
            id: `external-storage-performance`,
            name: "Performance Block Storage",
            description: "Storage externo balanceado com boa performance e custo",
            price: 0.10, // por GB
            type: 'storage',
            subtype: 'external',
            specs: [
              "IOPS: 3000",
              "Throughput: 150 MB/s",
              "Bom para aplicações gerais"
            ],
            isHardware: true
          },
          {
            id: `external-storage-premium`,
            name: "Premium Block Storage",
            description: "Storage externo de alto desempenho para cargas críticas",
            price: 0.20, // por GB
            type: 'storage',
            subtype: 'external',
            specs: [
              "IOPS: 6000",
              "Throughput: 300 MB/s",
              "Para bancos de dados e aplicações críticas"
            ],
            isHardware: true
          }
        ];
        
        processedData.external_storage.items = exampleExternalItems;
        console.log(`[PriceService] Created ${exampleExternalItems.length} example external storage items`);
      } else {
        processedData.external_storage.items = externalItems;
        console.log(`[PriceService] Added ${externalItems.length} external storage items`);
      }
    }
  }
}

/**
 * Helper function to get friendly names for categories
 */
function getCategoryFriendlyName(categoryId: string): string {
  const categoryNames: Record<string, string> = {
    'storage': 'Armazenamento',
    'external_storage': 'Storage Externo',
    'disk': 'Discos',
    'memory': 'Memória',
    'processor': 'Processadores',
    'contract': 'Contratos',
    'connectivity': 'Conectividade',
    'port_speed': 'Velocidade de Porta',
    'datacenter': 'Data Center',
    'sistemaoperacional': 'Sistema Operacional',
    'ip_blocks': 'Blocos de IP',
    'serviçospersonalizados': 'Serviços Personalizados'
  };
  
  return categoryNames[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
}
