
import { PriceService } from '../price-service';
import { toast } from 'sonner';

// Initialize server categories without recreating deleted ones
export async function initializeServerCategories(deletedCategories = {}): Promise<boolean> {
  try {
    console.log("[ComponentSync] Initializing server categories");
    
    // Get all existing data first
    const allData = await PriceService.getAllData();
    
    // Define which categories should exist by default
    const defaultCategories = [
      {
        id: 'processador',
        name: 'Processadores',
        items: []
      },
      {
        id: 'memória',
        name: 'Memória RAM',
        items: []
      },
      {
        id: 'storage',
        name: 'Storage',
        items: []
      },
      {
        id: 'datacenter',
        name: 'Data Center',
        items: []
      },
      {
        id: 'sistemaoperacional',
        name: 'Sistema Operacional',
        items: []
      },
      {
        id: 'port_speed',
        name: 'Velocidade de Porta',
        items: []
      },
      {
        id: 'conectividade',
        name: 'Conectividade',
        items: []
      },
      {
        id: 'contrato',
        name: 'Contratos',
        items: []
      },
      {
        id: 'serviçospersonalizados',
        name: 'Serviços Personalizados',
        items: []
      }
    ];
    
    // Track categories that were added
    let addedCount = 0;
    
    // Add missing categories that aren't marked as deleted
    for (const category of defaultCategories) {
      // Skip if category exists or was deliberately deleted
      if (allData[category.id] || deletedCategories[category.id]) {
        continue;
      }
      
      // Add the missing category
      await PriceService.addCategory(category);
      addedCount++;
      
      console.log(`[ComponentSync] Added missing category: ${category.id}`);
    }
    
    // Check if we need to initialize storage
    if (!allData.external_storage && !deletedCategories['external_storage']) {
      await initExternalStorageData();
    }
    
    // Check if we need to initialize connectivity options
    await checkConnectivityCategories(allData, deletedCategories);
    
    if (addedCount > 0) {
      toast.success(`${addedCount} categorias foram adicionadas ao sistema.`, {
        description: "Categorias inicializadas com sucesso"
      });
    }
    
    console.log("[ComponentSync] Server categories initialized successfully");
    return true;
  } catch (error) {
    console.error("[ComponentSync] Error initializing server categories:", error);
    return false;
  }
}

// Initialize external storage data if not already present
export async function initExternalStorageData(): Promise<boolean> {
  try {
    console.log("[ComponentSync] Initializing external storage data");
    
    // Get existing data
    const allData = await PriceService.getAllData();
    
    // Check if external_storage category already exists
    if (allData.external_storage) {
      console.log("[ComponentSync] External storage category already exists");
      return true;
    }
    
    // Check if this category was deliberately deleted before
    const deletedCategories = JSON.parse(localStorage.getItem('deletedCategories') || '{}');
    if (deletedCategories['external_storage']) {
      console.log("[ComponentSync] External storage category was deleted by user, not recreating");
      return false;
    }

    // Create the external storage category if it doesn't exist
    await PriceService.addCategory({
      id: 'external_storage',
      name: 'Storage Externo',
      items: [
        {
          id: 'bronze-storage',
          name: 'Bronze Storage',
          description: 'Storage econômico com desempenho básico',
          price: 0.15,
          type: 'bronze',
          specs: [
            'IOPS: 1000',
            'Throughput: 30MB/s',
            'Latência: Média'
          ]
        },
        {
          id: 'silver-storage',
          name: 'Silver Storage',
          description: 'Storage equilibrado com bom custo-benefício',
          price: 0.25,
          type: 'silver',
          specs: [
            'IOPS: 3000',
            'Throughput: 100MB/s',
            'Latência: Baixa'
          ]
        },
        {
          id: 'gold-storage',
          name: 'Gold Storage',
          description: 'Storage premium com alto desempenho',
          price: 0.45,
          type: 'gold',
          specs: [
            'IOPS: 6000',
            'Throughput: 250MB/s',
            'Latência: Muito baixa'
          ]
        },
        {
          id: 'platinum-storage',
          name: 'Platinum Storage',
          description: 'Storage de altíssimo desempenho para cargas críticas',
          price: 0.75,
          type: 'platinum',
          specs: [
            'IOPS: 10000+',
            'Throughput: 500MB/s+',
            'Latência: Mínima'
          ]
        }
      ]
    });
    
    console.log("[ComponentSync] External storage category created successfully");
    return true;
  } catch (error) {
    console.error("[ComponentSync] Error initializing external storage data:", error);
    return false;
  }
}

// Sync disk data with price service, respecting deleted items
export async function syncDiskDataWithPriceService(deletedItems = {}): Promise<boolean> {
  try {
    // Get existing data
    const allData = await PriceService.getAllData();
    
    // Check if disk category has been deleted
    const deletedCategories = JSON.parse(localStorage.getItem('deletedCategories') || '{}');
    if (deletedCategories['disk']) {
      console.log("[ComponentSync] Disk category was deliberately deleted, not recreating");
      return false;
    }
    
    // Create or update disk category
    if (!allData.disk) {
      await PriceService.addCategory({
        id: 'disk',
        name: 'Discos',
        items: []
      });
    }
    
    // Get default disk options
    const defaultDisks = [
      // NVMe disks
      {
        id: 'nvme-500gb',
        type: 'nvme',
        name: 'NVMe 500GB',
        description: 'Disco NVMe de alta performance com 500GB',
        capacity: '500GB',
        price: 59.99,
        specs: ['Tipo: nvme', 'Capacidade: 500GB']
      },
      {
        id: 'nvme-1tb',
        type: 'nvme',
        name: 'NVMe 1TB',
        description: 'Disco NVMe de alta performance com 1TB',
        capacity: '1TB',
        price: 99.99,
        specs: ['Tipo: nvme', 'Capacidade: 1TB']
      },
      {
        id: 'nvme-2tb',
        type: 'nvme',
        name: 'NVMe 2TB',
        description: 'Disco NVMe de alta performance com 2TB',
        capacity: '2TB',
        price: 189.99,
        specs: ['Tipo: nvme', 'Capacidade: 2TB']
      },
      
      // SSD disks
      {
        id: 'ssd-500gb',
        type: 'ssd',
        name: 'SSD 500GB',
        description: 'Disco SSD com 500GB',
        capacity: '500GB',
        price: 39.99,
        specs: ['Tipo: ssd', 'Capacidade: 500GB']
      },
      {
        id: 'ssd-1tb',
        type: 'ssd',
        name: 'SSD 1TB',
        description: 'Disco SSD com 1TB',
        capacity: '1TB',
        price: 69.99,
        specs: ['Tipo: ssd', 'Capacidade: 1TB']
      },
      {
        id: 'ssd-2tb',
        type: 'ssd',
        name: 'SSD 2TB',
        description: 'Disco SSD com 2TB',
        capacity: '2TB',
        price: 129.99,
        specs: ['Tipo: ssd', 'Capacidade: 2TB']
      },
      
      // HDD disks
      {
        id: 'hdd-1tb',
        type: 'hdd',
        name: 'HDD 1TB',
        description: 'Disco HDD com 1TB',
        capacity: '1TB',
        price: 29.99,
        specs: ['Tipo: hdd', 'Capacidade: 1TB']
      },
      {
        id: 'hdd-2tb',
        type: 'hdd',
        name: 'HDD 2TB',
        description: 'Disco HDD com 2TB',
        capacity: '2TB',
        price: 49.99,
        specs: ['Tipo: hdd', 'Capacidade: 2TB']
      },
      {
        id: 'hdd-4tb',
        type: 'hdd',
        name: 'HDD 4TB',
        description: 'Disco HDD com 4TB',
        capacity: '4TB',
        price: 89.99,
        specs: ['Tipo: hdd', 'Capacidade: 4TB']
      }
    ];
    
    // Process each default disk
    let modifiedData = { ...allData };
    let updatedDiskItems = [];
    
    for (const disk of defaultDisks) {
      // Skip if this disk was explicitly deleted
      if (deletedItems[disk.id] || (deletedItems.disk && deletedItems.disk.includes(disk.id))) {
        console.log(`[ComponentSync] Skipping deleted disk: ${disk.id}`);
        continue;
      }
      
      updatedDiskItems.push(disk);
    }
    
    // Update the disk category
    if (modifiedData.disk) {
      modifiedData.disk.items = updatedDiskItems;
      
      // Save updated data
      await PriceService.saveData(modifiedData);
      console.log("[ComponentSync] Disk data synchronized successfully");
    }
    
    return true;
  } catch (error) {
    console.error("[ComponentSync] Error syncing disk data:", error);
    return false;
  }
}

async function checkConnectivityCategories(allData: any, deletedCategories: any = {}): Promise<boolean> {
  try {
    console.log("[ComponentSync] Checking connectivity categories");
    
    // Skip if category is marked for deletion
    if (deletedCategories['ip_blocks']) {
      return false;
    }
    
    // Check for IP blocks category
    if (!allData.ip_blocks) {
      await PriceService.addCategory({
        id: 'ip_blocks',
        name: 'Blocos de IP',
        items: [
          {
            id: 'ip-block-1',
            name: 'Bloco /30 (1 IP utilizável)',
            description: 'Bloco de 1 endereço IP utilizável',
            price: 10.00,
            type: 'ipv4',
            specs: ['1 IP utilizável']
          },
          {
            id: 'ip-block-4',
            name: 'Bloco /29 (5 IPs utilizáveis)',
            description: 'Bloco de 5 endereços IP utilizáveis',
            price: 25.00,
            type: 'ipv4',
            specs: ['5 IPs utilizáveis']
          },
          {
            id: 'ip-block-8',
            name: 'Bloco /28 (13 IPs utilizáveis)',
            description: 'Bloco de 13 endereços IP utilizáveis',
            price: 45.00,
            type: 'ipv4',
            specs: ['13 IPs utilizáveis']
          }
        ]
      });
    }
    
    return true;
  } catch (error) {
    console.error("[ComponentSync] Error checking connectivity categories:", error);
    return false;
  }
}

// Cleanup duplicate categories to prevent data redundancy
export async function cleanupDuplicateCategories(): Promise<boolean> {
  try {
    // Load data
    const allData = await PriceService.getAllData();
    
    // Define core categories we want to ensure are unique
    const coreCategories = [
      'processador', 'memória', 'storage', 'datacenter', 
      'sistemaoperacional', 'port_speed', 'conectividade', 'contrato', 
      'serviçospersonalizados', 'disk', 'external_storage', 'ip_blocks'
    ];
    
    // Check if there are any duplicate categories
    const foundDuplicates = [];
    
    for (const catId of coreCategories) {
      // Skip if doesn't exist or was deliberately deleted
      if (!allData[catId]) continue;
      
      // Check for duplicates with trailing numbers
      for (let i = 1; i <= 10; i++) {
        const duplicateId = `${catId}${i}`;
        if (allData[duplicateId]) {
          foundDuplicates.push(duplicateId);
        }
      }
    }
    
    // Delete any duplicates found
    if (foundDuplicates.length > 0) {
      console.log(`[ComponentSync] Found ${foundDuplicates.length} duplicate categories to cleanup:`, foundDuplicates);
      
      let modified = false;
      for (const dupId of foundDuplicates) {
        await PriceService.deleteCategory(dupId);
        modified = true;
      }
      
      if (modified) {
        toast.success(`${foundDuplicates.length} categorias duplicadas foram removidas`, {
          description: "Limpeza de dados concluída com sucesso"
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error("[ComponentSync] Error cleaning up duplicate categories:", error);
    return false;
  }
}
