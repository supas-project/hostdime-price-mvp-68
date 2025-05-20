
import { ComponentOption } from "@/types/component";
import { PriceService } from "@/services/price-service";
import { logDebug } from "./utils";

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
    const connectivityData = await PriceService.getCategory('connectivity');
    
    logDebug("Connectivity Converter", {
      portSpeed: portSpeedData?.items?.length || 0,
      ipBlocks: ipBlocksData?.items?.length || 0,
      connectivity: connectivityData?.items?.length || 0
    });
    
    // Opções de velocidade de porta
    const portOptions: ComponentOption[] = [];
    if (portSpeedData && portSpeedData.items && portSpeedData.items.length > 0) {
      portOptions.push(...portSpeedData.items.map(item => ({
        ...item,
        type: 'Conectividade',
        subtype: 'porta',
        isHardware: true
      })));
    } else if (connectivityData && connectivityData.items) {
      // Fallback: extrair opções de porta do connectivity geral se port_speed estiver vazio
      const connPortOptions = connectivityData.items.filter(item => item.subtype === 'porta');
      if (connPortOptions.length > 0) {
        portOptions.push(...connPortOptions);
      }
    }
    
    // Opções de blocos de IP
    const ipOptions: ComponentOption[] = [];
    if (ipBlocksData && ipBlocksData.items && ipBlocksData.items.length > 0) {
      ipOptions.push(...ipBlocksData.items.map(item => ({
        ...item,
        type: 'Conectividade',
        subtype: 'ip',
        isHardware: true
      })));
    } else if (connectivityData && connectivityData.items) {
      // Fallback: extrair opções de IP do connectivity geral se ip_blocks estiver vazio
      const connIpOptions = connectivityData.items.filter(item => item.subtype === 'ip');
      if (connIpOptions.length > 0) {
        ipOptions.push(...connIpOptions);
      }
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
    
    // Atualizar categoria port_speed
    if (portOptions.length > 0) {
      const category = await PriceService.getCategory('port_speed');
      if (category) {
        // Atualizar itens existentes
        const updatedItems = portOptions.map(option => ({
          id: option.id,
          name: option.name,
          description: option.description || `${option.name} - Velocidade de porta`,
          price: option.price,
          type: 'network',
          subtype: 'porta',
          isHardware: true
        }));
        
        // Substituir os itens existentes
        category.items = updatedItems;
        await PriceService.updateCategory('port_speed', category);
      }
    }
    
    // Atualizar categoria ip_blocks
    if (ipOptions.length > 0) {
      const category = await PriceService.getCategory('ip_blocks');
      if (category) {
        // Atualizar itens existentes
        const updatedItems = ipOptions.map(option => ({
          id: option.id,
          name: option.name,
          description: option.description || `${option.name} - Bloco de IPs`,
          price: option.price,
          type: 'network',
          subtype: 'ip',
          isHardware: true
        }));
        
        // Substituir os itens existentes
        category.items = updatedItems;
        await PriceService.updateCategory('ip_blocks', category);
      }
    }
    
    // Sincronizar também com a categoria geral de conectividade
    const connectivityCategory = await PriceService.getCategory('connectivity');
    if (connectivityCategory) {
      // Combinar as opções de porta e IP
      const allItems = [
        ...portOptions.map(option => ({
          id: option.id,
          name: option.name,
          description: option.description || `${option.name} - Velocidade de porta`,
          price: option.price,
          type: 'network',
          subtype: 'porta',
          isHardware: true
        })),
        ...ipOptions.map(option => ({
          id: option.id,
          name: option.name,
          description: option.description || `${option.name} - Bloco de IPs`,
          price: option.price,
          type: 'network',
          subtype: 'ip',
          isHardware: true
        }))
      ];
      
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
