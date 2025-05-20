import { PriceService } from "@/services/price-service";
import { convertConnectivityPriceDataToComponents, saveConnectivityComponentsToPriceData } from "./connectivity-converter";
import { convertStoragePriceDataToComponents, saveStorageComponentsToPriceData } from "./storage-converter";
import { connectivityComponents } from "@/data/connectivity-components";
import { logDebug } from "./utils";

/**
 * Sincroniza dados de conectividade entre o PriceService e os componentes
 */
export async function syncConnectivityData(isAdminAccess = false): Promise<boolean> {
  try {
    // Converter dados do PriceService para componentes
    const { portOptions, ipOptions } = await convertConnectivityPriceDataToComponents();
    
    // Se não houver opções, carregar dados padrão
    if (portOptions.length === 0 && ipOptions.length === 0) {
      logDebug("No connectivity data found, initializing from default components");
      
      // Separar opções por tipo
      const defaultPortOptions = connectivityComponents.options.filter(opt => opt.subtype === 'porta');
      const defaultIpOptions = connectivityComponents.options.filter(opt => opt.subtype === 'ip');
      
      // Salvar dados padrão no PriceService se for administrador
      if (isAdminAccess) {
        await saveConnectivityComponentsToPriceData(defaultPortOptions, defaultIpOptions, isAdminAccess);
      }
      
      return true;
    }
    
    logDebug("Connectivity data synchronized", {
      ports: portOptions.length,
      ips: ipOptions.length
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao sincronizar dados de conectividade:", error);
    return false;
  }
}

/**
 * Sincroniza os dados dos discos com o PriceService
 */
export async function syncDiskDataWithPriceService(isAdminAccess = false): Promise<boolean> {
  try {
    // Converter dados do PriceService para componentes
    const { internalDisks, externalStorages } = await convertStoragePriceDataToComponents();

    // Se não houver discos, carregar dados padrão
    if (internalDisks.length === 0 && externalStorages.length === 0) {
      logDebug("No disk data found, initializing from default components");
      return true;
    }

    logDebug("Disk data synchronized", {
      internalDisks: internalDisks.length,
      externalStorages: externalStorages.length
    });

    // Salvar dados no PriceService se for administrador
    if (isAdminAccess) {
      await saveStorageComponentsToPriceData(internalDisks, externalStorages, isAdminAccess);
    }

    return true;
  } catch (error) {
    console.error("Erro ao sincronizar dados do disco:", error);
    return false;
  }
}

/**
 * Inicializa os dados do storage externo no PriceService
 */
export async function initExternalStorageData(isAdminAccess = false): Promise<boolean> {
  try {
    // Converter dados do PriceService para componentes
    const { internalDisks, externalStorages } = await convertStoragePriceDataToComponents();

    // Se não houver storage externo, criar dados padrão
    if (externalStorages.length === 0) {
      logDebug("No external storage data found, initializing from default components");

      // Dados de exemplo para storage externo
      const exampleExternalStorages = [
        {
          id: "external-storage-standard",
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
          id: "external-storage-performance",
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
          id: "external-storage-premium",
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

      // Salvar dados padrão no PriceService se for administrador
      if (isAdminAccess) {
        await saveStorageComponentsToPriceData(internalDisks, exampleExternalStorages, isAdminAccess);
      }
    }

    return true;
  } catch (error) {
    console.error("Erro ao inicializar dados do storage externo:", error);
    return false;
  }
}

/**
 * Inicializa as categorias do servidor no PriceService
 */
export async function initializeServerCategories(isAdminAccess = false): Promise<boolean> {
  try {
    // Verificar se as categorias já existem
    const storageCategory = await PriceService.getCategory('storage');
    const externalStorageCategory = await PriceService.getCategory('external_storage');
    const diskCategory = await PriceService.getCategory('disk');

    // Se alguma categoria não existir, criar dados padrão
    if (!storageCategory || !externalStorageCategory || !diskCategory) {
      logDebug("Missing server categories, initializing from default components");

      // Sincronizar dados do disco
      await syncDiskDataWithPriceService(isAdminAccess);

      // Inicializar dados do storage externo
      await initExternalStorageData(isAdminAccess);
    }

    return true;
  } catch (error) {
    console.error("Erro ao inicializar categorias do servidor:", error);
    return false;
  }
}

/**
 * Limpa categorias duplicadas no PriceService
 */
export async function cleanupDuplicateCategories(): Promise<boolean> {
  try {
    // Obter todos os dados do PriceService
    const allData = await PriceService.getAllData();

    // Verificar se há categorias duplicadas
    const hasStorage = allData.storage !== undefined;
    const hasExternalStorage = allData.external_storage !== undefined;
    const hasDisk = allData.disk !== undefined;

    // Se houver categorias duplicadas, remover as antigas
    if (hasStorage && hasExternalStorage && hasDisk) {
      logDebug("Duplicate categories found, cleaning up");

      // Remover categorias antigas
      await PriceService.deleteCategory('storage');
      await PriceService.deleteCategory('external_storage');
    }
  } catch (error) {
    console.error("Erro ao limpar categorias duplicadas:", error);
  }

  // Adicionando sincronização de conectividade ao processo de limpeza
  try {
    await syncConnectivityData(true);
  } catch (error) {
    console.error("Erro ao sincronizar dados de conectividade durante limpeza:", error);
  }
  
  return true;
}
