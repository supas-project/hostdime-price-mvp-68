
// Arquivo já existente, vamos adicionar funções para sincronização de componentes

import { PriceService } from "./price-service";
import { PriceCategory, PriceItem } from "@/types/pricing";
import { serverData } from "@/data/server-components";
import { diskData } from "@/data/disk-data";
import { storageData } from "@/data/storage-pricing";
import { toast } from "sonner";

/**
 * Inicializa as categorias básicas necessárias para o servidor funcionar
 */
export async function initializeServerCategories(): Promise<void> {
  try {
    console.log("[ComponentSyncService] Initializing server categories");
    
    // Primeiro, obter todos os dados atuais
    const currentData = await PriceService.getAllData();
    
    // Lista de categorias básicas necessárias para o configurador de servidor funcionar
    const requiredCategories = [
      { id: "datacenter", name: "Data Center" },
      { id: "contract", name: "Contrato" },
      { id: "cpu", name: "Processador" },
      { id: "memory", name: "Memória" },
      { id: "storage", name: "Armazenamento" },
      { id: "connectivity", name: "Conectividade" },
      { id: "os", name: "Sistema Operacional" },
      { id: "services", name: "Serviços Adicionais" }
    ];
    
    let dataUpdated = false;
    
    // Verificar e adicionar categorias ausentes
    for (const category of requiredCategories) {
      if (!currentData[category.id]) {
        console.log(`[ComponentSyncService] Adding missing category: ${category.id}`);
        
        // Criar a categoria se não existir
        const newCategory: PriceCategory = {
          id: category.id,
          name: category.name,
          items: []
        };
        
        // Adicionar a categoria ao objeto de dados
        currentData[category.id] = newCategory;
        dataUpdated = true;
      }
    }
    
    // Sincronizar com dados estáticos para cada categoria que não tenha itens
    // Isso garante que haja pelo menos alguns itens básicos
    dataUpdated = await populateCategoriesFromStaticData(currentData) || dataUpdated;
    
    // Se houve alguma atualização, salvar os dados
    if (dataUpdated) {
      await PriceService.saveData(currentData);
      console.log("[ComponentSyncService] Categories initialized successfully");
      toast.success("Categorias sincronizadas com sucesso");
    } else {
      console.log("[ComponentSyncService] No category updates needed");
    }
  } catch (error) {
    console.error("[ComponentSyncService] Error initializing server categories:", error);
    toast.error("Erro ao inicializar categorias", { 
      description: "Verifique os logs para mais detalhes." 
    });
  }
}

/**
 * Preenche categorias vazias com dados estáticos
 */
async function populateCategoriesFromStaticData(currentData: any): Promise<boolean> {
  let dataUpdated = false;
  
  // Para cada componente no serverData
  for (const component of serverData.componentes) {
    const normalizedType = component.type.toLowerCase().replace(/\s+/g, '');
    let categoryId: string;
    
    // Mapear o tipo do componente para o ID da categoria
    switch (normalizedType) {
      case 'datacenter':
        categoryId = 'datacenter';
        break;
      case 'contrato':
      case 'duracaodocontrato':
        categoryId = 'contract';
        break;  
      case 'processador':
        categoryId = 'cpu';
        break;
      case 'memoria':
      case 'memoriaram':
        categoryId = 'memory';
        break;
      case 'armazenamento':
        categoryId = 'storage';
        break;
      case 'conectividade':
      case 'opcoesdeconectividade':
        categoryId = 'connectivity';
        break;
      case 'sistemaoperacional':
        categoryId = 'os';
        break;
      case 'servicosadicionals':
      case 'servicospersonalizados':
        categoryId = 'services';
        break;
      default:
        console.warn(`[ComponentSyncService] Unknown component type: ${component.type}`);
        continue;
    }
    
    // Verificar se a categoria existe e está vazia
    if (currentData[categoryId] && (!currentData[categoryId].items || currentData[categoryId].items.length === 0)) {
      console.log(`[ComponentSyncService] Populating category ${categoryId} with static data`);
      
      // Converter os itens estáticos para o formato da PriceItem
      currentData[categoryId].items = component.options.map(option => ({
        id: option.id,
        name: option.name,
        description: option.description || "",
        price: option.price || 0,
        type: component.type,
        specs: option.specs || [],
        isHardware: option.isHardware || false,
        metadata: option.metadata || {}
      }));
      
      dataUpdated = true;
    }
  }
  
  return dataUpdated;
}

/**
 * Sincroniza dados de discos com o serviço de preços
 */
export async function syncDiskDataWithPriceService(): Promise<void> {
  try {
    console.log("[ComponentSyncService] Syncing disk data with price service");
    
    // Obter dados atuais
    const currentData = await PriceService.getAllData();
    
    // Verificar se a categoria disks existe, se não, criar
    if (!currentData.disks) {
      currentData.disks = {
        id: 'disks',
        name: 'Discos',
        items: []
      };
    }
    
    // Verificar se há itens na categoria
    if (!currentData.disks.items || currentData.disks.items.length === 0) {
      console.log("[ComponentSyncService] Adding disk items to price service");
      
      // Converter dados de disco para itens de preço
      currentData.disks.items = diskData.map(disk => ({
        id: `disk-${disk.type}-${disk.capacity}`,
        name: `${disk.type.toUpperCase()} ${disk.capacity}GB`,
        description: `Disco ${disk.type.toUpperCase()} de ${disk.capacity}GB`,
        price: disk.price,
        type: 'disk',
        isHardware: true,
        specs: [`Tipo: ${disk.type}`, `Capacidade: ${disk.capacity}GB`],
        metadata: { unitPrice: disk.price }
      }));
      
      // Salvar dados atualizados
      await PriceService.saveData(currentData);
      console.log("[ComponentSyncService] Disk data synced successfully");
    } else {
      console.log("[ComponentSyncService] Disk items already exist, no sync needed");
    }
  } catch (error) {
    console.error("[ComponentSyncService] Error syncing disk data:", error);
  }
}

/**
 * Inicializa dados de armazenamento externo
 */
export async function initExternalStorageData(): Promise<void> {
  try {
    console.log("[ComponentSyncService] Initializing external storage data");
    
    // Obter dados atuais
    const currentData = await PriceService.getAllData();
    
    // Verificar se a categoria storage existe, se não, criar
    if (!currentData.external_storage) {
      currentData.external_storage = {
        id: 'external_storage',
        name: 'Storage Externo',
        items: []
      };
    }
    
    // Verificar se há itens na categoria
    if (!currentData.external_storage.items || currentData.external_storage.items.length === 0) {
      console.log("[ComponentSyncService] Adding external storage items to price service");
      
      // Converter dados de storage para itens de preço
      currentData.external_storage.items = storageData.map(storage => ({
        id: storage.id,
        name: storage.name,
        description: storage.description,
        price: storage.basePrice,
        type: 'external_storage',
        isHardware: true,
        specs: storage.specs,
        metadata: { 
          pricePerGB: storage.pricePerGB,
          unitInfo: JSON.stringify({
            baseCapacity: storage.baseCapacity,
            basePrice: storage.basePrice
          })
        }
      }));
      
      // Salvar dados atualizados
      await PriceService.saveData(currentData);
      console.log("[ComponentSyncService] External storage data synced successfully");
    } else {
      console.log("[ComponentSyncService] External storage items already exist, no sync needed");
    }
  } catch (error) {
    console.error("[ComponentSyncService] Error initializing external storage data:", error);
  }
}
