import { PriceService } from "./price-service";
import { PriceCategory, PriceItem } from "@/types/pricing";
import { ComponentOption } from "@/types/component";
import { StorageDataItem } from "@/types/storage";
import { toast } from "sonner";

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
        name: displayName,
        items: []
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
export function convertStorageDataItem(item: StorageDataItem): PriceItem {
  // Ensure metadata exists
  const metadata = item.metadata || {};
  
  return {
    id: item.id,
    name: item.name,
    description: item.description || "",
    price: item.price || 0,
    type: "storage",
    subtype: item.type || "hdd",
    specs: [
      `Capacidade: ${item.capacity || 0} GB`,
      ...(item.specs || [])
    ],
    isHardware: true,
    metadata: {
      ...metadata,
      capacity: item.capacity || 0,
      // Use metadata properties instead of direct properties
      pricing: {
        basePrice: metadata.pricing?.basePrice || 0,
        pricePerGB: metadata.pricing?.pricePerGB || 0,
        baseCapacity: metadata.pricing?.baseCapacity || 0
      }
    }
  };
}

/**
 * Sync storage data items to price service
 */
export async function syncStorageDataToPriceService(
  storageData: StorageDataItem[]
): Promise<void> {
  try {
    // Get storage category
    const storageCategory = await PriceService.getCategory("storage");
    
    if (!storageCategory) {
      // Create storage category if it doesn't exist
      await PriceService.addCategory({
        id: "storage",
        name: CATEGORY_MAPPING.storage,
        items: []
      });
    }
    
    // Convert all storage items to price items
    const priceItems = storageData.map(convertStorageDataItem);
    
    // Update storage category with new items
    await PriceService.updateCategory({
      id: "storage",
      name: CATEGORY_MAPPING.storage,
      items: priceItems
    });
    
    console.log(`Synced ${priceItems.length} storage items to price service`);
    
  } catch (error) {
    console.error("Error syncing storage data:", error);
    toast.error("Erro ao sincronizar dados de armazenamento", {
      description: "Verifique o console para mais detalhes."
    });
  }
}
