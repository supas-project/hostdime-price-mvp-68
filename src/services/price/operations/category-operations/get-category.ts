
import { PriceCategory } from '@/types/pricing';
import { getAllData } from '../data-retrieval';

/**
 * Gets a specific category by ID
 */
export async function getCategory(categoryId: string): Promise<PriceCategory | null> {
  try {
    console.log(`[PriceService] Getting category: ${categoryId}`);
    
    // Verificar se o ID da categoria está vazio ou é inválido
    if (!categoryId || typeof categoryId !== 'string') {
      console.error(`[PriceService] Invalid category ID: ${categoryId}`);
      return null;
    }
    
    const allData = await getAllData();
    
    if (!allData) {
      console.error(`[PriceService] Failed to get data from Supabase when fetching category ${categoryId}`);
      return null;
    }
    
    // Log para debug de todas as categorias disponíveis
    console.log(`[PriceService] Available categories: ${Object.keys(allData).join(', ')}`);
    
    // Normalizar o ID da categoria para comparação case-insensitive
    const normalizedCategoryId = categoryId.toLowerCase();
    
    // Primeiro, tentamos encontrar diretamente pela chave do objeto
    if (allData[categoryId]) {
      console.log(`[PriceService] Found category ${categoryId} by exact ID match`);
      
      // Garantir que items seja sempre um array
      if (!allData[categoryId].items) {
        console.warn(`[PriceService] Items for category ${categoryId} is missing, adding empty array`);
        allData[categoryId].items = [];
      } else if (!Array.isArray(allData[categoryId].items)) {
        console.warn(`[PriceService] Items for category ${categoryId} is not an array, fixing`);
        allData[categoryId].items = [];
      }
      
      // Verificar número de itens
      console.log(`[PriceService] Category ${categoryId} has ${allData[categoryId].items.length} items`);
      
      // Tentar completar dados de categorias específicas se estiverem vazias
      if (allData[categoryId].items.length === 0) {
        const relatedCategories = getRelatedCategories(categoryId);
        
        for (const relatedCategory of relatedCategories) {
          if (allData[relatedCategory]?.items?.length > 0) {
            console.log(`[PriceService] ${categoryId} is empty, trying to copy items from ${relatedCategory} category`);
            
            // Converter itens da categoria relacionada
            const adaptedItems = allData[relatedCategory].items.map(item => {
              return {
                ...item,
                id: `${categoryId}-${item.id.replace(`${relatedCategory}-`, '')}`,
                type: getDefaultTypeForCategory(categoryId),
                subtype: getDefaultSubtypeForCategory(categoryId),
                description: item.description || `${item.name} - ${getCategoryDisplayName(categoryId)}`
              };
            });
            
            if (adaptedItems.length > 0) {
              console.log(`[PriceService] Added ${adaptedItems.length} items from ${relatedCategory} to ${categoryId}`);
              allData[categoryId].items = adaptedItems;
              break;
            }
          }
        }
      }
      
      return {
        ...allData[categoryId],
        items: allData[categoryId].items || []
      };
    }
    
    // Busca alternativa: percorrer todas as categorias procurando por correspondências
    for (const [key, category] of Object.entries(allData)) {
      if (!category) continue;
      
      if (
        key.toLowerCase() === normalizedCategoryId || 
        (category.id && category.id.toLowerCase() === normalizedCategoryId) || 
        (category.name && category.name.toLowerCase() === normalizedCategoryId)
      ) {
        console.log(`[PriceService] Found category by alternative match: ${key}`);
        
        // Garantir que items seja sempre um array
        if (!category.items) {
          console.warn(`[PriceService] Items for category ${key} is missing, adding empty array`);
          category.items = [];
        } else if (!Array.isArray(category.items)) {
          console.warn(`[PriceService] Items for category ${key} is not an array, fixing`);
          category.items = [];
        }
        
        // Verificar número de itens
        console.log(`[PriceService] Category ${key} has ${category.items?.length || 0} items`);
        
        return {
          ...category,
          items: category.items || []
        };
      }
    }
    
    // Tentativas especiais para aliases de categorias comuns
    const categoryAliases: Record<string, string> = {
      'storage': 'external_storage',
      'external_storage': 'storage',
      'memory': 'memória',
      'memória': 'memory',
      'processor': 'processador',
      'processador': 'processor',
      'os': 'sistemaoperacional'
    };
    
    if (categoryAliases[normalizedCategoryId] && allData[categoryAliases[normalizedCategoryId]]) {
      const aliasCategory = categoryAliases[normalizedCategoryId];
      console.log(`[PriceService] Falling back to ${aliasCategory} for ${categoryId} request`);
      
      // Verificar número de itens
      console.log(`[PriceService] ${aliasCategory} has ${allData[aliasCategory].items?.length || 0} items`);
      
      // Garantir que items seja sempre um array
      if (!allData[aliasCategory].items) {
        console.warn(`[PriceService] Items for ${aliasCategory} is missing, adding empty array`);
        allData[aliasCategory].items = [];
      } else if (!Array.isArray(allData[aliasCategory].items)) {
        console.warn(`[PriceService] Items for ${aliasCategory} is not an array, fixing`);
        allData[aliasCategory].items = [];
      }
      
      // Converter itens para o formato da categoria solicitada
      const adaptedItems = allData[aliasCategory].items.map(item => {
        return {
          ...item,
          id: `${categoryId}-${item.id.replace(`${aliasCategory}-`, '')}`,
          type: getDefaultTypeForCategory(categoryId),
          subtype: getDefaultSubtypeForCategory(categoryId),
          description: item.description || `${item.name} - ${getCategoryDisplayName(categoryId)}`
        };
      });
      
      return {
        id: categoryId,
        name: getCategoryDisplayName(categoryId),
        items: adaptedItems
      };
    }
    
    // Para categorias não encontradas, criar uma categoria básica
    console.log(`[PriceService] Creating base category for ${categoryId}`);
    
    const newCategory: PriceCategory = {
      id: categoryId,
      name: getCategoryDisplayName(categoryId),
      items: []
    };
    
    // Tentar copiar itens de categorias relacionadas
    const relatedCategories = getRelatedCategories(categoryId);
    
    for (const relatedCategory of relatedCategories) {
      if (allData[relatedCategory]?.items?.length > 0) {
        console.log(`[PriceService] Trying to adapt items from ${relatedCategory} to ${categoryId}`);
        
        // Adaptar itens da categoria relacionada
        const adaptedItems = allData[relatedCategory].items.map(item => {
          return {
            ...item,
            id: `${categoryId}-${item.id.replace(`${relatedCategory}-`, '')}`,
            type: getDefaultTypeForCategory(categoryId),
            subtype: getDefaultSubtypeForCategory(categoryId),
            description: item.description || `${item.name} - ${getCategoryDisplayName(categoryId)}`
          };
        });
        
        if (adaptedItems.length > 0) {
          console.log(`[PriceService] Added ${adaptedItems.length} items from ${relatedCategory} to new ${categoryId} category`);
          newCategory.items = adaptedItems;
          
          // Atualizar allData para futuras referências
          allData[categoryId] = newCategory;
          break;
        }
      }
    }
    
    return newCategory;
  } catch (err: any) {
    console.error(`[PriceService] Error in getCategory for ${categoryId}:`, err);
    return null;
  }
}

/**
 * Helper function to get related categories for a given category
 */
function getRelatedCategories(categoryId: string): string[] {
  const categoryMap: Record<string, string[]> = {
    'storage': ['disk', 'external_storage'],
    'external_storage': ['disk', 'storage'],
    'disk': ['storage', 'external_storage'],
    'memory': ['memória'],
    'memória': ['memory'],
    'processor': ['processador'],
    'processador': ['processor'],
    'sistemaoperacional': ['os', 'operatingsystem'],
    'os': ['sistemaoperacional'],
    'operatingsystem': ['sistemaoperacional'],
    'connectivity': ['conectividade'],
    'conectividade': ['connectivity'],
  };

  return categoryMap[categoryId] || [];
}

/**
 * Helper function to get default type for a category
 */
function getDefaultTypeForCategory(categoryId: string): string {
  const typeMap: Record<string, string> = {
    'storage': 'storage',
    'external_storage': 'storage',
    'disk': 'disk',
    'memory': 'memory',
    'processor': 'cpu',
    'processador': 'cpu',
    'sistemaoperacional': 'os',
    'connectivity': 'network',
    'conectividade': 'network',
    'port_speed': 'network',
  };
  
  return typeMap[categoryId] || categoryId;
}

/**
 * Helper function to get default subtype for a category
 */
function getDefaultSubtypeForCategory(categoryId: string): string {
  const subtypeMap: Record<string, string> = {
    'storage': 'block',
    'external_storage': 'external',
    'disk': 'internal'
  };
  
  return subtypeMap[categoryId] || '';
}

/**
 * Helper function to get display name for a category
 */
function getCategoryDisplayName(categoryId: string): string {
  const displayNames: Record<string, string> = {
    'storage': 'Armazenamento',
    'external_storage': 'Storage Externo',
    'disk': 'Discos',
    'memory': 'Memória',
    'memória': 'Memória',
    'processor': 'Processador',
    'processador': 'Processador',
    'sistemaoperacional': 'Sistema Operacional',
    'os': 'Sistema Operacional',
    'connectivity': 'Conectividade',
    'conectividade': 'Conectividade',
    'port_speed': 'Velocidade de Porta',
    'datacenter': 'Data Center',
    'contract': 'Contrato',
    'contrato': 'Contrato',
    'ip_blocks': 'Blocos de IP',
    'serviçospersonalizados': 'Serviços Personalizados'
  };
  
  return displayNames[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
}
