
import { v4 as uuidv4 } from 'uuid';
import { PriceItem } from '@/types/pricing';

/**
 * Cria um novo item com UUID gerado automaticamente
 * @param item Item parcial a ser completado
 * @returns Item completo com ID
 */
export function createItem(item: Partial<PriceItem>): PriceItem {
  // Garantir que o item tenha um ID
  const id = item.id || uuidv4();
  
  // Criar o item com valores padrão para campos opcionais
  return {
    id,
    name: item.name || '',
    description: item.description || '',
    price: item.price || 0,
    type: item.type || 'generic',
    specs: item.specs || [],
    tags: item.tags || [],
    metadata: {
      ...item.metadata,
      features: item.metadata?.features || [],
    },
  } as PriceItem;
}

/**
 * Atualiza um item existente com novas propriedades
 * @param originalItem Item original
 * @param updatedProperties Propriedades a serem atualizadas
 * @returns Item atualizado
 */
export function updateItem(originalItem: PriceItem, updatedProperties: Partial<PriceItem>): PriceItem {
  return {
    ...originalItem,
    ...updatedProperties,
    // Garantir que metadata seja mesclada corretamente
    metadata: {
      ...originalItem.metadata,
      ...updatedProperties.metadata,
      // Mesclar arrays dentro de metadata se existirem
      features: updatedProperties.metadata?.features || originalItem.metadata?.features || [],
    },
    // Mesclar arrays se existirem
    specs: updatedProperties.specs || originalItem.specs || [],
    tags: updatedProperties.tags || originalItem.tags || [],
  };
}

