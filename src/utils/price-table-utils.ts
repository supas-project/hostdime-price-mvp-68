
import { PriceItem } from "@/types/pricing";
import { v4 as uuidv4 } from "uuid";

/**
 * Cria um novo item com UUID e dados padrão
 * @param item Dados parciais do item
 * @returns Item completo com ID
 */
export function createItem(item: Partial<PriceItem>): PriceItem {
  return {
    id: uuidv4(),
    name: item.name || "",
    description: item.description || "",
    price: item.price || 0,
    type: item.type || "default",
    specs: item.specs || [],
    subtype: item.subtype,
    tags: item.tags || [],
    metadata: {
      ...item.metadata,
      features: item.metadata?.features || [],
    }
  };
}

/**
 * Atualiza um item existente com novos dados
 * @param originalItem Item original
 * @param updatedData Dados atualizados
 * @returns Item atualizado
 */
export function updateItem(
  originalItem: PriceItem,
  updatedData: Partial<PriceItem>
): PriceItem {
  return {
    ...originalItem,
    name: updatedData.name !== undefined ? updatedData.name : originalItem.name,
    description: updatedData.description !== undefined ? updatedData.description : originalItem.description,
    price: updatedData.price !== undefined ? updatedData.price : originalItem.price,
    type: updatedData.type !== undefined ? updatedData.type : originalItem.type,
    specs: updatedData.specs || originalItem.specs || [],
    subtype: updatedData.subtype !== undefined ? updatedData.subtype : originalItem.subtype,
    tags: updatedData.tags || originalItem.tags || [],
    metadata: {
      ...originalItem.metadata,
      ...updatedData.metadata,
      features: updatedData.metadata?.features || originalItem.metadata?.features || [],
    }
  };
}
