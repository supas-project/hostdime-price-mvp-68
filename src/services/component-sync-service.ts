
import { PriceService } from "./price-service";
import { PriceCategory, PriceItem } from "@/types/pricing";
import { ComponentOption } from "@/types/component";
import { DiskOption, PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";
import { diskData } from "@/data/disk-data";

// Constants for category mapping
const CATEGORY_MAPPING = {
  cpu: "Processador",
  memory: "Memória RAM",
  storage: "Armazenamento",
  os: "Sistema Operacional",
  datacenter: "Datacenter",
  contract: "Duração do Contrato",
  connectivity: "Opções de Conectividade",
  services: "Serviços Adicionais",
  disks: "Discos",
  external_storage: "Storage Externo"
};

// Reverse mapping for lookups
const REVERSE_CATEGORY_MAPPING: Record<string, string> = {};
Object.entries(CATEGORY_MAPPING).forEach(([key, value]) => {
  REVERSE_CATEGORY_MAPPING[value.toLowerCase()] = key;
});

/**
 * Initialize required server categories if they don't exist
 */
export async function initializeServerCategories(): Promise<void> {
  try {
    console.log("Initializing server categories...");
    
    // Get current categories
    const priceData = await PriceService.getAllData();
    const existingCategories = Object.keys(priceData || {});
    
    // Check which required categories are missing
    const requiredCategories = [
      "cpu", "memory", "storage", "os", 
      "datacenter", "contract", "connectivity", "services"
    ];
    
    const missingCategories = requiredCategories.filter(
      cat => !existingCategories.includes(cat)
    );
    
    if (missingCategories.length === 0) {
      console.log("All required categories are present.");
      return;
    }
    
    // Create missing categories
    for (const categoryId of missingCategories) {
      const displayName = CATEGORY_MAPPING[categoryId] || categoryId;
      
      await PriceService.addCategory({
        id: categoryId,
        name: displayName
      });
      
      console.log(`Created missing category: ${displayName} (${categoryId})`);
    }
    
    toast.success(`Categorias inicializadas com sucesso`, {
      description: `${missingCategories.length} categorias foram adicionadas ao sistema.`
    });
    
  } catch (error) {
    console.error("Error initializing server categories:", error);
    toast.error("Erro ao inicializar categorias", {
      description: "Verifique o console para mais detalhes."
    });
  }
}

/**
 * Convert ComponentOption to PriceItem format
 */
export function componentToPriceItem(component: ComponentOption): PriceItem {
  return {
    id: component.id,
    name: component.name,
    description: component.description || "",
    price: typeof component.price === 'number' ? component.price : 0,
    type: component.type || "",
    subtype: component.subtype || "",
    specs: component.specs || [],
    isHardware: component.isHardware || false,
    metadata: component.metadata || {}
  };
}

/**
 * Convert PriceItem to ComponentOption format
 */
export function priceItemToComponent(item: PriceItem): ComponentOption {
  return {
    id: item.id,
    name: item.name,
    description: item.description || "",
    price: item.price || 0,
    type: item.type || "",
    subtype: item.subtype || "",
    specs: item.specs || [],
    isHardware: item.isHardware || false,
    metadata: item.metadata || {}
  };
}

/**
 * Convert storage data item to price item
 */
export function convertStorageDataItem(item: PricedDiskOption): PriceItem {
  // Ensure metadata exists
  const metadata = item.metadata || {};
  
  return {
    id: item.id,
    name: item.type.toUpperCase() + " " + item.capacity,
    description: item.description || "",
    price: item.price || 0,
    type: "storage",
    subtype: item.type || "hdd",
    specs: [
      `Capacidade: ${item.capacity || "0 GB"}`,
      ...(item.specs?.readSpeed ? [`Leitura: ${item.specs.readSpeed}`] : []),
      ...(item.specs?.writeSpeed ? [`Escrita: ${item.specs.writeSpeed}`] : []),
      ...(item.specs?.iops ? [`IOPS: ${item.specs.iops}`] : [])
    ],
    isHardware: true,
    metadata: {
      ...metadata,
      capacity: item.capacity || "0 GB",
      // Use metadata properties for pricing info
      pricing: {
        basePrice: metadata.pricing?.basePrice || 0,
        pricePerGB: metadata.pricing?.pricePerGB || 0,
        baseCapacity: metadata.pricing?.baseCapacity || 0
      }
    }
  };
}

/**
 * Sync disk data items to price service
 */
export async function syncDiskDataWithPriceService(): Promise<void> {
  try {
    // Get storage category
    const storageCategory = await PriceService.getCategory("storage");
    
    if (!storageCategory) {
      // Create storage category if it doesn't exist
      await PriceService.addCategory({
        id: "storage",
        name: CATEGORY_MAPPING.storage
      });
    }
    
    // Convert all storage items to price items
    const priceItems = diskData.map(convertStorageDataItem);
    
    // Update storage category with new items
    await PriceService.updateCategory({
      id: "storage",
      name: CATEGORY_MAPPING.storage,
      items: priceItems
    });
    
    console.log(`Synced ${priceItems.length} disk items to price service`);
    
  } catch (error) {
    console.error("Error syncing disk data:", error);
    toast.error("Erro ao sincronizar dados de armazenamento", {
      description: "Verifique o console para mais detalhes."
    });
  }
}

/**
 * Initialize external storage data in the price service
 */
export async function initExternalStorageData(): Promise<void> {
  try {
    console.log("Initializing external storage data...");
    
    // Check if external_storage category exists
    const externalStorageCategory = await PriceService.getCategory("external_storage");
    
    if (!externalStorageCategory) {
      // Create external_storage category
      await PriceService.addCategory({
        id: "external_storage",
        name: CATEGORY_MAPPING.external_storage
      });
      
      // Create some default external storage items
      const defaultItems: PriceItem[] = [
        {
          id: "ext-storage-basic",
          name: "Storage NFS Básico",
          description: "Storage externo NFS com desempenho padrão",
          price: 0.15, // Price per GB
          type: "external_storage",
          subtype: "nfs",
          specs: ["Desempenho padrão", "Ideal para backup"],
          isHardware: true,
          metadata: {
            pricePerGB: 0.15,
            baseCapacity: 100,
            minCapacity: 100,
            maxCapacity: 10000
          }
        },
        {
          id: "ext-storage-premium",
          name: "Storage NFS Premium",
          description: "Storage externo NFS com alto desempenho",
          price: 0.25, // Price per GB
          type: "external_storage",
          subtype: "nfs_premium",
          specs: ["Alto desempenho", "SLA de 99.9%", "Ideal para aplicações críticas"],
          isHardware: true,
          metadata: {
            pricePerGB: 0.25,
            baseCapacity: 100,
            minCapacity: 100,
            maxCapacity: 10000
          }
        }
      ];
      
      // Update the category with the default items
      await PriceService.updateCategory({
        id: "external_storage",
        name: CATEGORY_MAPPING.external_storage,
        items: defaultItems
      });
      
      console.log(`Created external storage category with ${defaultItems.length} default items`);
    } else {
      console.log("External storage category already exists, skipping initialization");
    }
    
  } catch (error) {
    console.error("Error initializing external storage data:", error);
    toast.error("Erro ao inicializar dados de storage externo", {
      description: "Verifique o console para mais detalhes."
    });
  }
}
