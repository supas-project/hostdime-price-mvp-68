
import { PriceService } from "@/services/price-service";
import { ComponentOption } from "@/types/component";
import { PriceItem } from "@/types/pricing";
import { toast } from "sonner";
import { componentToPriceItem, priceItemToComponent } from "./category-manager";

/**
 * Sincroniza dados de memória entre a tabela de preços e os componentes do servidor
 */
export async function syncMemoryData(): Promise<boolean> {
  try {
    console.log("[MemoryConverter] Iniciando sincronização de dados de memória");
    
    // Obter dados de memória do servidor
    const memoryData = await PriceService.getCategory("memory");
    
    if (!memoryData) {
      console.warn("[MemoryConverter] Categoria 'memory' não encontrada");
      
      // Tentar obter dados da categoria em português
      const memoryDataPt = await PriceService.getCategory("memória");
      
      if (!memoryDataPt) {
        console.warn("[MemoryConverter] Categoria 'memória' também não encontrada");
        return false;
      }
      
      console.log(`[MemoryConverter] Encontrados ${memoryDataPt.items.length} itens de memória na categoria 'memória'`);
      return true;
    }
    
    console.log(`[MemoryConverter] Encontrados ${memoryData.items.length} itens de memória`);
    return true;
  } catch (error) {
    console.error("[MemoryConverter] Erro ao sincronizar dados de memória:", error);
    toast.error("Erro ao sincronizar dados de memória", { 
      description: "Verifique o console para mais detalhes." 
    });
    return false;
  }
}

/**
 * Converte itens de memória do formato PriceItem para ComponentOption
 */
export function convertMemoryItemsToComponents(memoryItems: PriceItem[]): ComponentOption[] {
  console.log(`[MemoryConverter] Convertendo ${memoryItems.length} itens para componentes`);
  
  return memoryItems.map(item => {
    return {
      id: item.id,
      name: item.name,
      description: item.description || `${item.name} - Memória RAM`,
      price: item.price || 0,
      type: "memoria",
      isHardware: true,
      specs: item.specs || ["Memória RAM de alta performance"],
    };
  });
}

/**
 * Atualiza componentes de memória com base nos dados da tabela de preços
 */
export async function updateMemoryComponents(): Promise<ComponentOption[]> {
  try {
    // Primeiro, tentar buscar da categoria em inglês
    let memoryItems = await PriceService.getCategoryItems("memory");
    
    // Se não encontrar, buscar da categoria em português
    if (!memoryItems || memoryItems.length === 0) {
      memoryItems = await PriceService.getCategoryItems("memória");
    }
    
    // Se ainda não encontrar nenhum item, retornar array vazio
    if (!memoryItems || memoryItems.length === 0) {
      console.warn("[MemoryConverter] Nenhum item de memória encontrado para atualizar componentes");
      return [];
    }
    
    console.log(`[MemoryConverter] Atualizando componentes com ${memoryItems.length} itens de memória`);
    const components = convertMemoryItemsToComponents(memoryItems);
    return components;
  } catch (error) {
    console.error("[MemoryConverter] Erro ao atualizar componentes de memória:", error);
    return [];
  }
}

/**
 * Atualiza itens de preço de memória com base nos componentes
 */
export async function updateMemoryPriceItems(components: ComponentOption[]): Promise<void> {
  try {
    console.log(`[MemoryConverter] Atualizando itens de preço com ${components.length} componentes`);
    
    // Verificar se temos dados para processar
    if (!components || components.length === 0) {
      console.warn("[MemoryConverter] Nenhum componente fornecido para atualizar itens de preço");
      return;
    }
    
    // Obter categoria memória
    let memoryCategory = await PriceService.getCategory("memory");
    
    // Se não encontrar, tentar categoria em português
    if (!memoryCategory) {
      memoryCategory = await PriceService.getCategory("memória");
    }
    
    // Se ainda não encontrar, criar categoria memória
    if (!memoryCategory) {
      await PriceService.addCategory({
        id: "memory",
        name: "Memória"
      });
      memoryCategory = await PriceService.getCategory("memory");
    }
    
    // Converter componentes para itens de preço
    for (const component of components) {
      const priceItem = {
        id: component.id,
        name: component.name,
        description: component.description,
        price: component.price,
        specs: component.specs || [],
        type: "memory" // Adicionando o campo 'type' obrigatório
      };
      
      // Verificar se o item já existe
      const existingItem = memoryCategory.items.find(item => item.id === priceItem.id);
      
      if (existingItem) {
        // Atualizar item existente
        await PriceService.updateItem("memory", priceItem.id, priceItem);
        console.log(`[MemoryConverter] Item atualizado: ${priceItem.name}`);
      } else {
        // Adicionar novo item
        await PriceService.addItem("memory", priceItem);
        console.log(`[MemoryConverter] Novo item adicionado: ${priceItem.name}`);
      }
    }
  } catch (error) {
    console.error("[MemoryConverter] Erro ao atualizar itens de preço de memória:", error);
  }
}
