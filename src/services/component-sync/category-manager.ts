
import { PriceService } from "../price-service";
import { PriceCategory, PriceItem } from "@/types/pricing";
import { ComponentOption, RaidMetadata } from "@/types/component";
import { toast } from "sonner";
import { CATEGORY_MAPPING } from "./utils";

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
  // Convertendo RaidMetadata para boolean quando necessário
  const raidValue = component.metadata?.raid ? 
    (typeof component.metadata.raid === 'boolean' ? 
      component.metadata.raid : 
      true) : 
    undefined;

  return {
    id: component.id,
    name: component.name,
    description: component.description || "",
    price: typeof component.price === 'number' ? component.price : 0,
    type: component.type || "",
    subtype: component.subtype || "",
    specs: component.specs || [],
    isHardware: component.isHardware || false,
    metadata: {
      ...component.metadata,
      // Garantindo que o raid seja um boolean se presente
      ...(raidValue !== undefined && { raid: raidValue })
    }
  };
}

/**
 * Convert PriceItem to ComponentOption format
 */
export function priceItemToComponent(item: PriceItem): ComponentOption {
  // Convertendo boolean para RaidMetadata quando necessário
  const raidMetadata = item.metadata?.raid ? 
    (typeof item.metadata.raid === 'boolean' ? 
      { 
        type: "0", 
        description: "RAID Configuration",
        protection: "Data Protection", 
        isHardware: true,
        usableCapacity: 0,
        totalCapacity: 0,
        performance: {
          read: "boa",
          write: "boa"
        }
      } as RaidMetadata : 
      item.metadata.raid as RaidMetadata) : 
    undefined;

  return {
    id: item.id,
    name: item.name,
    description: item.description || "",
    price: item.price || 0,
    type: item.type || "",
    subtype: item.subtype || "",
    specs: item.specs || [],
    isHardware: item.isHardware || false,
    metadata: {
      ...item.metadata,
      // Garantindo que o raid seja RaidMetadata se presente
      ...(raidMetadata !== undefined && { raid: raidMetadata })
    }
  };
}
