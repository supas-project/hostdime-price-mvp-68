
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
    type: item.type || "unknown", // Add the required type property
    specs: item.specs || [],
    // Extract additional properties if available
    ...(item.metadata && { metadata: item.metadata }),
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
  // Placeholder implementation to fix imports
  console.log("[ComponentSyncService] Syncing disk data with price service");
  return true;
}

export async function initExternalStorageData(): Promise<boolean> {
  // Placeholder implementation to fix imports
  console.log("[ComponentSyncService] Initializing external storage data");
  return true;
}
