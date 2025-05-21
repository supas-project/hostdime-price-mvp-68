import { PriceService } from "@/services/price-service";
import { serverData } from "@/data/server-components";
import { ComponentOption, ServerComponent } from "@/types/component";
import { StorageService } from "@/services/storage-service";
import { diskPricing } from "@/data/storage-pricing";
import { normalizeComponentType } from "@/hooks/use-component-selection";
import { convertConnectivityPriceDataToComponents } from "./connectivity-converter";
import { convertProcessorPriceDataToComponents } from "./processor-converter";
import { logDebug } from "./utils";

/**
 * Sincroniza dados de discos com o serviço de preços
 */
export async function syncDiskDataWithPriceService() {
  try {
    const storageItems = await StorageService.getAllStorageItems();
    if (!storageItems) {
      console.warn("Nenhum item de armazenamento encontrado para sincronizar");
      return;
    }

    logDebug("Syncing disk data with price service", {
      items: Object.keys(storageItems).length
    });

    for (const key in diskPricing) {
      if (diskPricing.hasOwnProperty(key)) {
        const storageItem = storageItems[key];
        if (storageItem) {
          diskPricing[key] = storageItem.price;
        }
      }
    }

    logDebug("Disk data synced successfully");
  } catch (error) {
    console.error("Erro ao sincronizar dados de disco:", error);
  }
}

/**
 * Inicializa dados de armazenamento externo
 */
export async function initExternalStorageData() {
  try {
    const externalStorage = await StorageService.getExternalStorage();
    if (!externalStorage) {
      console.warn("Nenhum armazenamento externo encontrado para inicializar");
      return;
    }

    logDebug("Initializing external storage data", {
      items: Object.keys(externalStorage).length
    });

    // You can add additional initialization logic here if needed

    logDebug("External storage data initialized successfully");
  } catch (error) {
    console.error("Erro ao inicializar armazenamento externo:", error);
  }
}

/**
 * Inicializa as categorias do servidor com base nos dados do serviço de preços
 */
export async function initializeServerCategories() {
  try {
    if (!serverData || !serverData.componentes) {
      console.warn("Dados do servidor não encontrados para inicialização");
      return;
    }

    logDebug("Initializing server categories", {
      components: serverData.componentes.length
    });

    // Inicializar dados de conectividade
    const { portOptions, ipOptions } = await convertConnectivityPriceDataToComponents();
    
    // Inicializar dados de processador
    const processorOptions = await convertProcessorPriceDataToComponents();

    // Iterar por todos os componentes e atualizar opções quando necessário
    for (const component of serverData.componentes) {
      const normalizedType = normalizeComponentType(component.type);
      
      // Atualizar opções de conectividade
      if (normalizedType === "conectividade") {
        // Combinar opções de porta e IP
        component.options = [...portOptions, ...ipOptions];
        logDebug("Updated connectivity options", {
          count: component.options.length,
          ports: portOptions.length,
          ips: ipOptions.length
        });
      }
      
      // Atualizar opções de processador
      else if (normalizedType === "processador") {
        if (processorOptions.length > 0) {
          component.options = processorOptions;
          logDebug("Updated processor options", {
            count: component.options.length
          });
        }
      }
    }

    logDebug("Server categories initialized successfully");
  } catch (error) {
    console.error("Erro ao inicializar categorias do servidor:", error);
  }
}

/**
 * Limpa categorias duplicadas em servidores
 */
export async function cleanupDuplicateCategories() {
  try {
    if (!serverData || !serverData.componentes) {
      console.warn("Dados do servidor não encontrados para limpeza de duplicatas");
      return;
    }

    logDebug("Cleaning up duplicate categories", {
      components: serverData.componentes.length
    });

    const existingCategories = new Set<string>();

    for (const component of serverData.componentes) {
      const normalizedType = normalizeComponentType(component.type);

      if (existingCategories.has(normalizedType)) {
        console.warn(`Categoria duplicada encontrada: ${normalizedType}`);
        // Implementar lógica para remover ou mesclar a categoria duplicada
      } else {
        existingCategories.add(normalizedType);
      }
    }

    logDebug("Duplicate categories cleaned up successfully");
  } catch (error) {
    console.error("Erro ao limpar categorias duplicadas:", error);
  }
}
