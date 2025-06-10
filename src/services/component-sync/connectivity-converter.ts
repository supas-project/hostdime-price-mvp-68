
import { ComponentOption } from "@/types/component";
import { PriceService } from "@/services/price-service";
import { logDebug } from "./utils";

/**
 * Sync connectivity items
 */
export async function syncConnectivityItems(): Promise<boolean> {
  try {
    console.log("Syncing connectivity items");
    // Implementation will be added later
    return true;
  } catch (error) {
    console.error("Error syncing connectivity items:", error);
    return false;
  }
}

/**
 * Converte dados de conectividade entre as tabelas de preço e os componentes do servidor
 */
export async function convertConnectivityPriceDataToComponents(): Promise<{
  portOptions: ComponentOption[];
  ipOptions: ComponentOption[];
}> {
  try {
    // Obter dados das categorias port_speed e ip_blocks
    const portSpeedData = await PriceService.getCategory('port_speed');
    const ipBlocksData = await PriceService.getCategory('ip_blocks');
    
    logDebug("Connectivity Converter", {
      portSpeed: portSpeedData?.items?.length || 0,
      ipBlocks: ipBlocksData?.items?.length || 0
    });
    
    // Opções de velocidade de porta - removendo duplicatas por ID
    const portOptions: ComponentOption[] = [];
    const portIdsAdded = new Set<string>();
    
    if (portSpeedData && portSpeedData.items && portSpeedData.items.length > 0) {
      // Filtrar duplicatas por ID
      portSpeedData.items.forEach(item => {
        if (!portIdsAdded.has(item.id)) {
          portIdsAdded.add(item.id);
          portOptions.push({
            ...item,
            type: 'Conectividade',
            subtype: 'porta',
            isHardware: true
          });
        }
      });
    }
    
    // Opções de blocos de IP - removendo duplicatas por ID
    const ipOptions: ComponentOption[] = [];
    const ipIdsAdded = new Set<string>();
    
    if (ipBlocksData && ipBlocksData.items && ipBlocksData.items.length > 0) {
      // Filtrar duplicatas por ID
      ipBlocksData.items.forEach(item => {
        if (!ipIdsAdded.has(item.id)) {
          ipIdsAdded.add(item.id);
          ipOptions.push({
            ...item,
            type: 'Conectividade',
            subtype: 'ip',
            isHardware: true
          });
        }
      });
    }
    
    logDebug("Connectivity Options Converted", {
      portOptions: portOptions.length,
      ipOptions: ipOptions.length
    });
    
    return { portOptions, ipOptions };
  } catch (error) {
    console.error("Erro ao converter dados de conectividade:", error);
    return { portOptions: [], ipOptions: [] };
  }
}

/**
 * Salva dados de conectividade no serviço de preços
 */
export async function saveConnectivityComponentsToPriceData(
  portOptions: ComponentOption[],
  ipOptions: ComponentOption[],
  isAdminAccess?: boolean
): Promise<boolean> {
  try {
    if (!isAdminAccess) {
      console.warn("Tentativa de salvar dados de conectividade sem acesso de administrador");
      return false;
    }
    
    logDebug("Saving connectivity components to price data", {
      ports: portOptions.length,
      ips: ipOptions.length
    });
    
    // Atualizar categoria port_speed - sem duplicatas
    if (portOptions.length > 0) {
      const category = await PriceService.getCategory('port_speed');
      if (category) {
        // Criar um mapa de IDs para detecção de duplicatas
        const uniqueItems = new Map();
        
        // Adicionar somente itens únicos ao mapa
        portOptions.forEach(option => {
          if (!uniqueItems.has(option.id)) {
            uniqueItems.set(option.id, {
              id: option.id,
              name: option.name,
              description: option.description || `${option.name} - Velocidade de porta`,
              price: option.price,
              type: 'network',
              subtype: 'porta',
              isHardware: true
            });
          }
        });
        
        // Converter o mapa para array
        const updatedItems = Array.from(uniqueItems.values());
        
        // Substituir os itens existentes
        category.items = updatedItems;
        await PriceService.updateCategory('port_speed', category);
      }
    }
    
    // Atualizar categoria ip_blocks - sem duplicatas
    if (ipOptions.length > 0) {
      const category = await PriceService.getCategory('ip_blocks');
      if (category) {
        // Criar um mapa de IDs para detecção de duplicatas
        const uniqueItems = new Map();
        
        // Adicionar somente itens únicos ao mapa
        ipOptions.forEach(option => {
          if (!uniqueItems.has(option.id)) {
            uniqueItems.set(option.id, {
              id: option.id,
              name: option.name,
              description: option.description || `${option.name} - Bloco de IPs`,
              price: option.price,
              type: 'network',
              subtype: 'ip',
              isHardware: true
            });
          }
        });
        
        // Converter o mapa para array
        const updatedItems = Array.from(uniqueItems.values());
        
        // Substituir os itens existentes
        category.items = updatedItems;
        await PriceService.updateCategory('ip_blocks', category);
      }
    }
    
    // Sincronizar também com a categoria geral de conectividade - sem duplicatas
    const connectivityCategory = await PriceService.getCategory('connectivity');
    if (connectivityCategory) {
      // Criar um mapa de IDs para detecção de duplicatas
      const uniqueItems = new Map();
      
      // Adicionar portas ao mapa (somente itens únicos)
      portOptions.forEach(option => {
        if (!uniqueItems.has(option.id)) {
          uniqueItems.set(option.id, {
            id: option.id,
            name: option.name,
            description: option.description || `${option.name} - Velocidade de porta`,
            price: option.price,
            type: 'network',
            subtype: 'porta',
            isHardware: true
          });
        }
      });
      
      // Adicionar IPs ao mapa (somente itens únicos)
      ipOptions.forEach(option => {
        if (!uniqueItems.has(option.id)) {
          uniqueItems.set(option.id, {
            id: option.id,
            name: option.name,
            description: option.description || `${option.name} - Bloco de IPs`,
            price: option.price,
            type: 'network',
            subtype: 'ip',
            isHardware: true
          });
        }
      });
      
      // Converter o mapa para array
      const allItems = Array.from(uniqueItems.values());
      
      // Substituir os itens existentes
      connectivityCategory.items = allItems;
      await PriceService.updateCategory('connectivity', connectivityCategory);
    }
    
    logDebug("Connectivity data saved successfully");
    return true;
  } catch (error) {
    console.error("Erro ao salvar dados de conectividade:", error);
    return false;
  }
}
