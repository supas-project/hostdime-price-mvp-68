
import { toast } from "sonner";
import { PriceService } from "./price-service";
import { serverData } from "@/data/server-components";
import { diskData } from "@/data/disk-data";
import { osComponents } from "@/data/os-components";
import { storageComponents } from "@/data/storage-components";

/**
 * Service to sync component data with price table
 */
const ComponentSyncService = {
  /**
   * Syncs CPU data from static component data to price table
   */
  syncCpuData: async (): Promise<boolean> => {
    try {
      console.log("Syncing CPU data...");
      const cpuComponent = serverData.componentes.find(c => c.type === "Processador");
      
      if (!cpuComponent || !cpuComponent.options) {
        console.error("CPU component data not found");
        return false;
      }
      
      // Get or create CPU category
      const cpuCategory = await PriceService.getCategory('cpu');
      
      // Convert component options to price items
      const cpuItems = cpuComponent.options.map(option => ({
        id: option.id,
        name: option.name,
        description: option.description || "",
        price: option.price,
        type: "cpu",
        subtype: "Intel", // Default CPU subtype
        isHardware: true,
        specs: option.specs || [],
        tags: ["Hardware"],
        metadata: option.metadata || {}
      }));
      
      // Update category items
      const updatedCategory = {
        ...cpuCategory,
        name: "Processadores",
        items: cpuItems
      };
      
      // Update the category
      await PriceService.updateCategory('cpu', updatedCategory);
      console.log("CPU data synced successfully");
      return true;
    } catch (error) {
      console.error("Error syncing CPU data:", error);
      toast.error("Failed to sync CPU data");
      return false;
    }
  },
  
  /**
   * Syncs memory data from static component data to price table
   */
  syncMemoryData: async (): Promise<boolean> => {
    try {
      console.log("Syncing memory data...");
      const memoryComponent = serverData.componentes.find(c => c.type === "Memória");
      
      if (!memoryComponent || !memoryComponent.options) {
        console.error("Memory component data not found");
        return false;
      }
      
      // Get or create memory category
      const memoryCategory = await PriceService.getCategory('memory');
      
      // Convert component options to price items
      const memoryItems = memoryComponent.options.map(option => ({
        id: option.id,
        name: option.name,
        description: option.description || "",
        price: option.price,
        type: "memory",
        subtype: option.subtype || "DDR4", // Default memory type
        isHardware: true,
        specs: option.specs || [],
        tags: ["Hardware"],
        metadata: option.metadata || {}
      }));
      
      // Update category items
      const updatedCategory = {
        ...memoryCategory,
        name: "Memória",
        items: memoryItems
      };
      
      // Update the category
      await PriceService.updateCategory('memory', updatedCategory);
      console.log("Memory data synced successfully");
      return true;
    } catch (error) {
      console.error("Error syncing memory data:", error);
      toast.error("Failed to sync memory data");
      return false;
    }
  },
  
  /**
   * Syncs disk data from static data to price table
   */
  syncDiskData: async (): Promise<boolean> => {
    try {
      console.log("Syncing disk data...");
      
      // Get or create disk category
      const diskCategory = await PriceService.getCategory('disk');
      
      // Convert disk data to price items
      const diskItems = diskData.map(disk => {
        // Determine readable name
        const diskName = `${disk.type.toUpperCase()} ${disk.capacity}`;
        
        // Calculate read/write speeds based on disk type
        let readSpeed = "500 MB/s";
        let writeSpeed = "400 MB/s";
        let iops = "10,000";
        
        if (disk.type === "ssd") {
          readSpeed = "550 MB/s";
          writeSpeed = "520 MB/s";
          iops = "100,000";
        } else if (disk.type === "nvme") {
          readSpeed = "3500 MB/s";
          writeSpeed = "3000 MB/s";
          iops = "500,000";
        }
        
        const specs = [
          `Velocidade de leitura: ${readSpeed}`,
          `Velocidade de escrita: ${writeSpeed}`,
          `IOPS: ${iops}`,
          disk.type === "nvme" ? "Recomendado para alta performance" : "",
          disk.type === "ssd" ? "Recomendado para uso geral" : "",
          disk.type === "hdd" ? "Recomendado para armazenamento em massa" : ""
        ].filter(Boolean);
        
        return {
          id: `disk-${disk.type}-${disk.capacity}`,
          name: diskName,
          description: `Disco ${disk.type.toUpperCase()} com ${disk.capacity} de capacidade`,
          price: disk.price,
          type: "disk",
          subtype: disk.type,
          isHardware: true,
          specs,
          tags: ["Hardware"],
          metadata: {}
        };
      });
      
      // Update category items
      const updatedCategory = {
        ...diskCategory,
        name: "Discos",
        items: diskItems
      };
      
      // Update the category
      await PriceService.updateCategory('disk', updatedCategory);
      console.log("Disk data synced successfully");
      return true;
    } catch (error) {
      console.error("Error syncing disk data:", error);
      toast.error("Failed to sync disk data");
      return false;
    }
  },
  
  /**
   * Syncs OS data from static data to price table
   */
  syncOSData: async (): Promise<boolean> => {
    try {
      console.log("Syncing OS data...");
      
      // Get or create OS category
      const osCategory = await PriceService.getCategory('os');
      
      // Convert OS options to price items
      const osItems = osComponents.options.map(os => {
        return {
          id: os.id,
          name: os.name,
          description: os.description || "",
          price: os.price,
          type: "os",
          subtype: os.subtype || "",
          isHardware: false,
          specs: [],
          tags: ["Software"],
          metadata: {}
        };
      });
      
      // Update category items
      const updatedCategory = {
        ...osCategory,
        name: "Sistemas Operacionais",
        items: osItems
      };
      
      // Update the category
      await PriceService.updateCategory('os', updatedCategory);
      console.log("OS data synced successfully");
      return true;
    } catch (error) {
      console.error("Error syncing OS data:", error);
      toast.error("Failed to sync OS data");
      return false;
    }
  },
  
  /**
   * Syncs storage data from static data to price table
   */
  syncStorageData: async (): Promise<boolean> => {
    try {
      console.log("Syncing storage data...");
      
      // Get or create storage category
      const storageCategory = await PriceService.getCategory('storage');
      
      // Create storage price items
      const storageItems = [
        {
          id: "storage-block",
          name: "Block Storage",
          description: "Block-level storage optimized for databases and applications",
          price: 0.15, // per GB
          type: "storage",
          subtype: "block",
          isHardware: true,
          specs: [
            "IOPS: 3,000 por TB",
            "Throughput: 150 MB/s",
            "Latência: 2-5ms"
          ],
          tags: ["Hardware"],
          metadata: {
            minCapacity: 100,
            maxCapacity: 16000,
            capacityUnit: "GB",
            capacityStep: 100,
            benefits: ["Ideal para bancos de dados", "Alta performance", "Baixa latência"]
          }
        },
        {
          id: "storage-object",
          name: "Object Storage",
          description: "Cost-effective storage for data archives and backups",
          price: 0.05, // per GB
          type: "storage",
          subtype: "object",
          isHardware: true,
          specs: [
            "Throughput: 50 MB/s",
            "Acesso via RESTful API",
            "Redundância geográfica"
          ],
          tags: ["Hardware"],
          metadata: {
            minCapacity: 500,
            maxCapacity: 100000,
            capacityUnit: "GB",
            capacityStep: 500,
            benefits: ["Custo-efetivo", "Escalável", "Durável"]
          }
        }
      ];
      
      // Update category items
      const updatedCategory = {
        ...storageCategory,
        name: "Storage",
        items: storageItems
      };
      
      // Update the category
      await PriceService.updateCategory('storage', updatedCategory);
      console.log("Storage data synced successfully");
      return true;
    } catch (error) {
      console.error("Error syncing storage data:", error);
      toast.error("Failed to sync storage data");
      return false;
    }
  },
  
  /**
   * Syncs all component data to price table
   */
  syncAllData: async (): Promise<boolean> => {
    try {
      await Promise.all([
        ComponentSyncService.syncCpuData(),
        ComponentSyncService.syncMemoryData(),
        ComponentSyncService.syncDiskData(),
        ComponentSyncService.syncOSData(),
        ComponentSyncService.syncStorageData()
      ]);
      
      toast.success("All component data synced successfully");
      return true;
    } catch (error) {
      console.error("Error syncing all data:", error);
      toast.error("Failed to sync some component data");
      return false;
    }
  }
};

export default ComponentSyncService;
