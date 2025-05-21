
import { ComponentOption } from "@/types/component";
import { PriceService } from "@/services/price-service";
import { logDebug } from "./utils";

/**
 * Converte dados de processadores entre as tabelas de preço e os componentes do servidor
 */
export async function convertProcessorPriceDataToComponents(): Promise<ComponentOption[]> {
  try {
    // Obter dados da categoria processor
    const processorData = await PriceService.getCategory('processor');
    
    logDebug("Processor Converter", {
      processors: processorData?.items?.length || 0
    });
    
    // Converter itens de preço em opções de componente
    const processorOptions: ComponentOption[] = [];
    if (processorData && processorData.items && processorData.items.length > 0) {
      processorOptions.push(...processorData.items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || `${item.name}`,
        price: item.price,
        type: 'Processador',
        specs: item.specs || [],
        metadata: {
          cores: item.metadata?.cores || 0,
          perCore: item.metadata?.perCore || false,
          features: item.metadata?.features || []
        }
      })));
    }
    
    logDebug("Processor Options Converted", {
      processorOptions: processorOptions.length
    });
    
    return processorOptions;
  } catch (error) {
    console.error("Erro ao converter dados de processadores:", error);
    return [];
  }
}

/**
 * Salva dados de processadores no serviço de preços
 */
export async function saveProcessorComponentsToPriceData(
  processorOptions: ComponentOption[],
  isAdminAccess?: boolean
): Promise<boolean> {
  try {
    if (!isAdminAccess) {
      console.warn("Tentativa de salvar dados de processadores sem acesso de administrador");
      return false;
    }
    
    logDebug("Saving processor components to price data", {
      processors: processorOptions.length
    });
    
    // Atualizar categoria processor
    if (processorOptions.length > 0) {
      const category = await PriceService.getCategory('processor');
      if (category) {
        // Atualizar itens existentes
        const updatedItems = processorOptions.map(option => ({
          id: option.id,
          name: option.name,
          description: option.description || option.name,
          price: option.price,
          type: 'processor',
          specs: option.specs || [],
          metadata: {
            cores: option.metadata?.cores || 0,
            perCore: option.metadata?.perCore || false,
            features: option.metadata?.features || []
          }
        }));
        
        // Substituir os itens existentes
        category.items = updatedItems;
        await PriceService.updateCategory('processor', category);
        
        logDebug("Processor data saved successfully");
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Erro ao salvar dados de processadores:", error);
    return false;
  }
}
