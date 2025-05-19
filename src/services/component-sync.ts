
import { PriceService } from "@/services/price-service";
import { ServerComponent, ComponentOption } from "@/types/component";
import { toast } from "@/utils/toast-utils";
import { serverData } from "@/data/server-components";

// Categories mapping between price table and component types
const CATEGORY_TYPE_MAPPING = {
  "processors": "Processador",
  "memory": "Memória",
  "storage": "Armazenamento",
  "datacenter": "DataCenter",
  "contract": "Contrato",
  "connectivity": "Conectividade",
  "os": "SistemaOperacional",
  "services": "ServiçosPersonalizados"
};

// Initialize server categories with price data
export async function initializeServerCategories(): Promise<boolean> {
  try {
    console.log("[ComponentSyncService] Initializing server categories from price data");
    
    // Load all price data
    const priceData = await PriceService.getAllData();
    
    if (!priceData) {
      console.warn("[ComponentSyncService] No price data available");
      return false;
    }
    
    // Keep track of successful syncs
    let syncSuccess = true;
    
    // Loop through all price data categories
    await Promise.all(Object.entries(priceData).map(async ([categoryId, category]) => {
      try {
        // Map the category to component type
        const componentType = mapCategoryToComponentType(categoryId);
        
        if (!componentType) {
          // Skip categories that don't map to components
          console.log(`[ComponentSyncService] Skipping category ${categoryId} - no component mapping`);
          return;
        }
        
        // Find the corresponding component in serverData
        const componentIndex = serverData.componentes.findIndex(comp => comp.type === componentType);
        
        if (componentIndex === -1) {
          console.warn(`[ComponentSyncService] No component found for type ${componentType}`);
          return;
        }
        
        // Convert price items to component options
        const componentOptions = category.items.map(mapPriceItemToComponentOption);
        
        // Update the component options
        serverData.componentes[componentIndex].options = componentOptions;
        
        console.log(`[ComponentSyncService] Synchronized ${componentOptions.length} options for ${componentType}`);
      } catch (error) {
        console.error(`[ComponentSyncService] Error syncing category ${categoryId}:`, error);
        syncSuccess = false;
      }
    }));
    
    console.log("[ComponentSyncService] Server categories initialized from price data");
    return syncSuccess;
  } catch (error) {
    console.error("[ComponentSyncService] Error initializing server categories:", error);
    return false;
  }
}

// Map price table category ID to component type
function mapCategoryToComponentType(categoryId: string): string | null {
  return CATEGORY_TYPE_MAPPING[categoryId] || null;
}

// Convert PriceItem to ComponentOption
function mapPriceItemToComponentOption(item: any): ComponentOption {
  return {
    id: item.id,
    name: item.name,
    description: item.description || "",
    price: item.price,
    type: item.type || "unknown", // Required field
    specs: item.specs || [],
    // Extract additional properties if available
    ...(item.metadata && { 
      metadata: {
        ...item.metadata,
        // Handle any additional nested properties explicitly
      } 
    }),
    ...(item.subtype && { subtype: item.subtype })
  };
}

// Register listeners to update components when price data changes
export function registerComponentSyncListeners() {
  PriceService.addDataChangeListener(async () => {
    console.log("[ComponentSyncService] Price data changed, updating components");
    await initializeServerCategories();
  });
}

// Export a function to get synchronized component data
export async function getSynchronizedComponents(): Promise<ServerComponent[]> {
  // Ensure components are synchronized before returning
  await initializeServerCategories();
  return serverData.componentes;
}

// Add these functions to fix imports in other files
export async function syncDiskDataWithPriceService(): Promise<boolean> {
  // Implementation that synchronizes disk data with price service
  console.log("[ComponentSyncService] Syncing disk data with price service");
  try {
    // Get storage category data
    const storageCategory = await PriceService.getCategory('storage');
    
    if (!storageCategory || !storageCategory.items || storageCategory.items.length === 0) {
      console.warn("[ComponentSyncService] No storage items found in price data");
      return false;
    }
    
    // Find the storage component in serverData
    const storageIndex = serverData.componentes.findIndex(comp => comp.type === "Armazenamento");
    
    if (storageIndex === -1) {
      console.warn("[ComponentSyncService] Storage component not found in server data");
      return false;
    }
    
    // Convert storage items to component options
    const storageOptions = storageCategory.items
      .filter(item => item.id && item.name) // Ensure required fields exist
      .map(mapPriceItemToComponentOption);
      
    // Update storage options
    serverData.componentes[storageIndex].options = storageOptions;
    
    console.log(`[ComponentSyncService] Synchronized ${storageOptions.length} storage options`);
    return true;
  } catch (error) {
    console.error("[ComponentSyncService] Error syncing disk data:", error);
    return false;
  }
}

export async function initExternalStorageData(): Promise<boolean> {
  // Implementation to initialize external storage data
  console.log("[ComponentSyncService] Initializing external storage data");
  try {
    // Get storage category data focusing on external storage
    const storageCategory = await PriceService.getCategory('storage');
    
    if (!storageCategory || !storageCategory.items || storageCategory.items.length === 0) {
      console.warn("[ComponentSyncService] No storage items found in price data");
      return false;
    }
    
    // Filter external storage items (fix the type checking issue)
    // Instead of directly accessing item.metadata.isExternal, check if subtype is 'external'
    // Or carefully check if the metadata object has an isExternal property
    const externalItems = storageCategory.items
      .filter(item => {
        // Check if it has a subtype of 'external' 
        if (item.subtype === 'external') {
          return true;
        }
        
        // Check if metadata exists and has an isExternal property with string conversion
        // This avoids TypeScript error while still enabling the functionality
        if (item.metadata && typeof item.metadata === 'object') {
          // Type assertion to access potential custom property
          const metadata = item.metadata as Record<string, any>;
          return metadata.isExternal === true;
        }
        
        return false;
      })
      .map(mapPriceItemToComponentOption);
    
    if (externalItems.length === 0) {
      console.warn("[ComponentSyncService] No external storage items found");
      return false;
    }
    
    console.log(`[ComponentSyncService] Initialized ${externalItems.length} external storage items`);
    return true;
  } catch (error) {
    console.error("[ComponentSyncService] Error initializing external storage data:", error);
    return false;
  }
}
