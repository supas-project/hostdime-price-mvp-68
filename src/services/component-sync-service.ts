
import { storageData } from "@/data/storage-pricing";
import { PriceService } from "./price-service";
import { PriceCategory } from "@/types/pricing";

/**
 * Service for synchronizing component data
 */
const ComponentSyncService = {
  /**
   * Synchronizes CPU data
   */
  syncCpuData: async (): Promise<void> => {
    try {
      const cpuCategory = await PriceService.getCategory("cpu");
      
      if (Array.isArray(cpuCategory.items) && cpuCategory.items.length > 0) {
        console.log("CPU data already synced");
        return;
      }
      
      // Add default CPU options
      await PriceService.updateCategory("cpu", {
        name: "Processadores",
        items: [
          {
            id: "xeon-e-2386g",
            name: "Intel Xeon E-2386G",
            description: "Processador de alto desempenho para servidores (12 MB Cache, até 5.10 GHz)",
            price: 520,
            specs: [
              "Cores: 6",
              "Threads: 12",
              "Cache: 12 MB Intel® Smart Cache",
              "Base Frequency: 3.50 GHz",
              "Max Turbo Frequency: 5.10 GHz"
            ],
            type: "Processador",
            subtype: "Intel Xeon"
          },
          {
            id: "xeon-gold-6338",
            name: "Intel Xeon Gold 6338",
            description: "Processador de alta capacidade para servidores (48 MB Cache, até 3.20 GHz)",
            price: 1200,
            specs: [
              "Cores: 32",
              "Threads: 64",
              "Cache: 48 MB Intel® Smart Cache",
              "Base Frequency: 2.00 GHz",
              "Max Turbo Frequency: 3.20 GHz"
            ],
            type: "Processador",
            subtype: "Intel Xeon"
          }
        ]
      });
      
      console.log("CPU data synced successfully");
    } catch (error) {
      console.error("Error syncing CPU data:", error);
      throw error;
    }
  },

  /**
   * Synchronizes Memory data
   */
  syncMemoryData: async (): Promise<void> => {
    try {
      const memoryCategory = await PriceService.getCategory("memory");
      
      if (Array.isArray(memoryCategory.items) && memoryCategory.items.length > 0) {
        console.log("Memory data already synced");
        return;
      }
      
      // Add default Memory options
      await PriceService.updateCategory("memory", {
        name: "Memória",
        items: [
          {
            id: "ddr4-16gb",
            name: "16 GB DDR4",
            description: "16 GB de memória RAM DDR4 3200 MHz",
            price: 100,
            specs: [
              "Tipo: DDR4",
              "Capacidade: 16 GB",
              "Frequência: 3200 MHz",
              "ECC: Sim"
            ],
            type: "Memória",
            subtype: "DDR4"
          },
          {
            id: "ddr4-32gb",
            name: "32 GB DDR4",
            description: "32 GB de memória RAM DDR4 3200 MHz",
            price: 200,
            specs: [
              "Tipo: DDR4",
              "Capacidade: 32 GB",
              "Frequência: 3200 MHz",
              "ECC: Sim"
            ],
            type: "Memória",
            subtype: "DDR4"
          },
          {
            id: "ddr4-64gb",
            name: "64 GB DDR4",
            description: "64 GB de memória RAM DDR4 3200 MHz",
            price: 380,
            specs: [
              "Tipo: DDR4",
              "Capacidade: 64 GB",
              "Frequência: 3200 MHz",
              "ECC: Sim"
            ],
            type: "Memória",
            subtype: "DDR4"
          }
        ]
      });
      
      console.log("Memory data synced successfully");
    } catch (error) {
      console.error("Error syncing Memory data:", error);
      throw error;
    }
  },

  /**
   * Synchronizes Disk data
   */
  syncDiskData: async (): Promise<void> => {
    try {
      const diskCategory = await PriceService.getCategory("disk");
      
      if (Array.isArray(diskCategory.items) && diskCategory.items.length > 0) {
        console.log("Disk data already synced");
        return;
      }
      
      // Add default Disk options
      await PriceService.updateCategory("disk", {
        name: "Discos",
        items: [
          {
            id: "ssd-480gb",
            name: "SSD 480 GB",
            description: "SSD de 480 GB para armazenamento rápido",
            price: 120,
            specs: [
              "Tipo: SSD",
              "Capacidade: 480 GB",
              "Interface: SATA",
              "Velocidade de leitura: 550 MB/s",
              "Velocidade de escrita: 520 MB/s"
            ],
            type: "Disco",
            subtype: "SSD"
          },
          {
            id: "ssd-960gb",
            name: "SSD 960 GB",
            description: "SSD de 960 GB para armazenamento rápido",
            price: 220,
            specs: [
              "Tipo: SSD",
              "Capacidade: 960 GB",
              "Interface: SATA",
              "Velocidade de leitura: 550 MB/s",
              "Velocidade de escrita: 520 MB/s"
            ],
            type: "Disco",
            subtype: "SSD"
          },
          {
            id: "nvme-1tb",
            name: "NVMe 1 TB",
            description: "SSD NVMe de 1 TB para desempenho máximo",
            price: 320,
            specs: [
              "Tipo: NVMe",
              "Capacidade: 1 TB",
              "Interface: PCIe 4.0",
              "Velocidade de leitura: 7000 MB/s",
              "Velocidade de escrita: 5300 MB/s"
            ],
            type: "Disco",
            subtype: "NVMe"
          }
        ]
      });
      
      console.log("Disk data synced successfully");
    } catch (error) {
      console.error("Error syncing Disk data:", error);
      throw error;
    }
  },

  /**
   * Synchronizes OS data
   */
  syncOSData: async (): Promise<void> => {
    try {
      const osCategory = await PriceService.getCategory("os");
      
      if (Array.isArray(osCategory.items) && osCategory.items.length > 0) {
        console.log("OS data already synced");
        return;
      }
      
      // Add default OS options
      await PriceService.updateCategory("os", {
        name: "Sistemas Operacionais",
        items: [
          {
            id: "windows-server-2022",
            name: "Windows Server 2022",
            description: "Sistema operacional Windows Server 2022 Standard",
            price: 160,
            specs: [
              "Versão: 2022",
              "Edição: Standard",
              "Licença: Por CPU",
              "Inclui: 2 VMs"
            ],
            type: "SistemaOperacional",
            subtype: "Windows"
          },
          {
            id: "centos-7",
            name: "CentOS 7",
            description: "Sistema operacional CentOS 7",
            price: 0,
            specs: [
              "Versão: 7",
              "Edição: Community Enterprise OS",
              "Licença: Open Source",
              "Suporte: Comunidade"
            ],
            type: "SistemaOperacional",
            subtype: "Linux"
          },
          {
            id: "ubuntu-20-04",
            name: "Ubuntu Server 20.04 LTS",
            description: "Sistema operacional Ubuntu Server 20.04 Long Term Support",
            price: 0,
            specs: [
              "Versão: 20.04 LTS",
              "Edição: Server",
              "Licença: Open Source",
              "Suporte: 5 anos"
            ],
            type: "SistemaOperacional",
            subtype: "Linux"
          }
        ]
      });
      
      console.log("OS data synced successfully");
    } catch (error) {
      console.error("Error syncing OS data:", error);
      throw error;
    }
  },

  /**
   * Synchronizes Storage data
   */
  syncStorageData: async (): Promise<void> => {
    try {
      const storageCategory = await PriceService.getCategory("storage");
      
      if (Array.isArray(storageCategory.items) && storageCategory.items.length > 0) {
        console.log("Storage data already synced");
        return;
      }
      
      // Transform the metadata structure to match PriceItem
      const storageItems = storageData.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        type: item.type,
        subtype: item.subtype,
        isHardware: true,
        specs: item.specs || [],
        tags: item.tags || [],
        metadata: {
          // Use the compatible metadata structure
          discount: 0,
          features: item.metadata.benefits,
          quantity: 1,
          unitPrice: item.price
        }
      }));

      // Add default Storage options
      await PriceService.updateCategory("storage", {
        name: "Storage",
        items: storageItems
      });
      
      console.log("Storage data synced successfully");
    } catch (error) {
      console.error("Error syncing Storage data:", error);
      throw error;
    }
  },
};

export default ComponentSyncService;
