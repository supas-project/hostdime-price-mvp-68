import { StorageDataItem } from "@/data/storage-pricing";
import { diskData } from "@/data/disk-data";
import { PriceService } from "./price-service";
import { normalizeStorageCapacity } from "@/utils/storage-utils";
import { PriceCategory } from "@/types/pricing";

// Function to sync disk data with price service
export async function syncDiskDataWithPriceService() {
  try {
    // Get or create disk category
    let diskCategory = await PriceService.getCategory('disk');
    if (!diskCategory) {
      diskCategory = await PriceService.addCategory({
        name: 'Discos',
        id: 'disk'
      });
    }
    
    // For each disk in static data, check if it exists in price service
    for (const disk of diskData) {
      const existingItem = diskCategory.items.find(
        item => item.subtype === disk.type && 
               item.name.includes(normalizeStorageCapacity(disk.capacity))
      );
      
      if (!existingItem) {
        // Add disk to price service if it doesn't exist
        await PriceService.addItem('disk', {
          name: `${disk.type.toUpperCase()} ${normalizeStorageCapacity(disk.capacity)}`,
          description: `Disco ${disk.type.toUpperCase()} com capacidade de ${normalizeStorageCapacity(disk.capacity)}`,
          price: disk.price,
          type: 'disk',
          subtype: disk.type,
          specs: [
            `Velocidade de leitura: ${disk.specs.readSpeed}`,
            `Velocidade de escrita: ${disk.specs.writeSpeed}`,
            `IOPS: ${disk.specs.iops}`,
            ...disk.specs.recommended.map(rec => `Recomendado para: ${rec}`)
          ],
          tags: ['Hardware'],
          isHardware: true,
          metadata: {
            features: disk.specs.recommended,
            unitPrice: disk.price
          }
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing disk data:', error);
    return false;
  }
}

// Function to initialize external storage data
export async function initExternalStorageData() {
  try {
    // Get or create storage category
    let storageCategory = await PriceService.getCategory('storage');
    if (!storageCategory) {
      storageCategory = await PriceService.addCategory({
        name: 'Storage Externo',
        id: 'storage'
      });
    }
    
    // If storage category is empty, populate it
    if (storageCategory.items.length === 0) {
      // Get storage data items from where they're defined in your application
      // We'll use static definitions here since the original storageData import is no longer available
      const storageItems: StorageDataItem[] = [
        {
          id: "ssd-block-storage",
          name: "SSD Block Storage",
          description: "High-performance SSD storage for applications",
          price: 0.10, // price per GB
          type: "storage",
          subtype: "block",
          specs: [
            "IOPS: 6000",
            "Throughput: 150 MB/s",
            "Low latency",
            "Ideal for databases"
          ],
          tags: ["ssd", "block", "high-performance"],
          metadata: {
            benefits: [
              "Fast and reliable performance",
              "Ideal for databases",
              "Supports snapshotting",
              "99.9% durability"
            ],
            minCapacity: 100,
            maxCapacity: 16000,
            capacityUnit: "GB",
            capacityStep: 50
          }
        },
        {
          id: "hdd-block-storage",
          name: "HDD Block Storage",
          description: "Cost-effective storage for backups and archives",
          price: 0.03, // price per GB
          type: "storage",
          subtype: "block",
          specs: [
            "IOPS: 1500",
            "Throughput: 90 MB/s",
            "High capacity",
            "Cost efficient"
          ],
          tags: ["hdd", "block", "cost-effective"],
          metadata: {
            benefits: [
              "Cost-effective storage solution",
              "Perfect for backups",
              "High capacity options",
              "99.9% durability"
            ],
            minCapacity: 500,
            maxCapacity: 32000,
            capacityUnit: "GB",
            capacityStep: 500
          }
        },
        {
          id: "nvme-block-storage",
          name: "NVMe Block Storage",
          description: "Ultra high-performance storage for critical workloads",
          price: 0.20, // price per GB
          type: "storage",
          subtype: "block",
          specs: [
            "IOPS: 20000",
            "Throughput: 500 MB/s",
            "Ultra-low latency",
            "Highest performance"
          ],
          tags: ["nvme", "block", "ultra-performance"],
          metadata: {
            benefits: [
              "Extreme performance characteristics",
              "Perfect for critical workloads",
              "Ultra-low latency",
              "99.99% durability"
            ],
            minCapacity: 100,
            maxCapacity: 8000,
            capacityUnit: "GB",
            capacityStep: 100
          }
        }
      ];
      
      // Add each storage item to price service
      for (const item of storageItems) {
        await PriceService.addItem('storage', {
          name: item.name,
          description: item.description,
          price: item.price,
          type: item.type,
          subtype: item.subtype,
          specs: item.specs,
          tags: item.tags,
          isHardware: false,
          metadata: {
            features: item.metadata.benefits,
            discount: 0,
            quantity: 1,
            unitPrice: item.price,
            // Store the additional metadata as JSON string
            unitInfo: JSON.stringify({
              minCapacity: item.metadata.minCapacity,
              maxCapacity: item.metadata.maxCapacity,
              capacityUnit: item.metadata.capacityUnit,
              capacityStep: item.metadata.capacityStep,
              benefits: item.metadata.benefits
            })
          }
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing external storage data:', error);
    return false;
  }
}
