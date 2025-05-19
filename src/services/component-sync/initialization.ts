
import { PriceService } from "../price-service";
import { PriceItem } from "@/types/pricing";
import { toast } from "sonner";
import { CATEGORY_MAPPING } from "./utils";
import { convertStorageDataItem } from "./storage-converter";
import { diskData } from "@/data/disk-data";

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
    await PriceService.updateCategory("storage", {
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
            features: ["Desempenho padrão", "Ideal para backup"],
            unitInfo: JSON.stringify({
              pricePerGB: 0.15,
              baseCapacity: 100,
              minCapacity: 100,
              maxCapacity: 10000
            })
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
            features: ["Alto desempenho", "SLA de 99.9%", "Ideal para aplicações críticas"],
            unitInfo: JSON.stringify({
              pricePerGB: 0.25,
              baseCapacity: 100,
              minCapacity: 100,
              maxCapacity: 10000
            })
          }
        }
      ];
      
      // Update the category with the default items
      await PriceService.updateCategory("external_storage", {
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
