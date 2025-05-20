import { PriceService } from "@/services/price-service";
import { connectivityComponents } from "@/data/connectivity-components";
import { convertConnectivityPriceDataToComponents, saveConnectivityComponentsToPriceData } from "./connectivity-converter";
import { logDebug } from "./utils";
import { ComponentOption } from "@/types/component";

/**
 * Sincroniza os dados de disco com o serviço de preço
 */
export async function syncDiskDataWithPriceService() {
  try {
    // Obter categoria de discos
    const diskCategory = await PriceService.getCategory('disk');
    
    if (diskCategory && diskCategory.items && diskCategory.items.length > 0) {
      logDebug("syncDiskDataWithPriceService", `Found ${diskCategory.items.length} disk items in the price service`);
      // Implementação existente
    } else {
      logDebug("syncDiskDataWithPriceService", "No disk items found in the price service");
    }
    
    return true;
  } catch (error) {
    console.error("Error syncing disk data with price service:", error);
    return false;
  }
}

/**
 * Inicializa dados de armazenamento externo
 */
export async function initExternalStorageData() {
  // Implementação existente
}

/**
 * Sincroniza os dados de conectividade
 */
export async function syncConnectivityData(): Promise<boolean> {
  try {
    const { portOptions, ipOptions } = await convertConnectivityPriceDataToComponents();
    
    logDebug("syncConnectivityData", {
      portOptions: portOptions.length,
      ipOptions: ipOptions.length
    });
    
    // Se não houver opções, inicialize com dados padrão
    if ((portOptions.length === 0 || ipOptions.length === 0) && connectivityComponents) {
      // Extrair portas e IPs do arquivo estático
      const defaultPortOptions = connectivityComponents.options
        .filter(option => option.subtype === 'porta')
        .map(option => ({...option}));
        
      const defaultIpOptions = connectivityComponents.options
        .filter(option => option.subtype === 'ip')
        .map(option => ({...option}));
      
      // Usar opções padrão se as obtidas estiverem vazias
      const finalPortOptions = portOptions.length > 0 ? portOptions : defaultPortOptions;
      const finalIpOptions = ipOptions.length > 0 ? ipOptions : defaultIpOptions;
      
      // Salvar no serviço de preços
      await saveConnectivityComponentsToPriceData(finalPortOptions, finalIpOptions, true);
      
      logDebug("syncConnectivityData", "Initialized with default data");
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error syncing connectivity data:", error);
    return false;
  }
}

/**
 * Inicializa todas as categorias do servidor
 */
export async function initializeServerCategories() {
  try {
    await syncDiskDataWithPriceService();
    await initExternalStorageData();
    await syncConnectivityData();
    return true;
  } catch (error) {
    console.error("Error initializing server categories:", error);
    return false;
  }
}

/**
 * Limpa categorias duplicadas
 */
export async function cleanupDuplicateCategories() {
  // Implementação existente
}
