
import { DiskOption, PricedDiskOption } from "@/types/storage";
import { PriceItem, PriceCategory } from "@/types/pricing";
import { ComponentOption } from "@/types/component";

/**
 * Convert storage data item to price item
 */
export function convertStorageDataItem(item: PricedDiskOption): PriceItem {
  // Create a description if it doesn't exist
  const description = item.type.toUpperCase() + " disk with " + item.capacity;
  
  return {
    id: item.id,
    name: item.type.toUpperCase() + " " + item.capacity,
    description: description,
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
      // Store capacity info in a features array
      features: [`Capacity: ${item.capacity || "0 GB"}`],
      // Use pricing info structure compatible with PriceItem metadata
      unitInfo: JSON.stringify({
        capacity: item.capacity || "0 GB",
        pricing: {
          basePrice: 0,
          pricePerGB: 0,
          baseCapacity: 0
        }
      })
    }
  };
}

/**
 * Convert price item to storage data item
 */
export function convertPriceItemToDisk(item: PriceItem): PricedDiskOption {
  // Extract capacity from specs or name
  let capacity = "0 GB";
  const capacitySpec = item.specs?.find(spec => 
    spec.toLowerCase().includes('capacidade:') || 
    spec.toLowerCase().includes('capacity:')
  );
  
  if (capacitySpec) {
    capacity = capacitySpec.split(':')[1]?.trim() || capacity;
  } else if (item.name.includes('TB') || item.name.includes('GB')) {
    // Try to extract from name
    const match = item.name.match(/(\d+(?:\.\d+)?)\s*(TB|GB)/i);
    if (match) {
      capacity = match[0];
    }
  }
  
  // Extract read/write speeds
  let readSpeed = "N/A";
  let writeSpeed = "N/A";
  let iops = "N/A";
  
  if (item.specs) {
    const readSpec = item.specs.find(spec => spec.toLowerCase().includes('leitura:'));
    const writeSpec = item.specs.find(spec => spec.toLowerCase().includes('escrita:'));
    const iopsSpec = item.specs.find(spec => spec.toLowerCase().includes('iops:'));
    
    readSpeed = readSpec ? readSpec.split(':')[1]?.trim() || readSpeed : readSpeed;
    writeSpeed = writeSpec ? writeSpec.split(':')[1]?.trim() || writeSpeed : writeSpeed;
    iops = iopsSpec ? iopsSpec.split(':')[1]?.trim() || iops : iops;
  }
  
  return {
    id: item.id,
    type: (item.subtype as "nvme" | "ssd" | "hdd") || "hdd",
    capacity: capacity,
    price: item.price || 0,
    specs: {
      readSpeed,
      writeSpeed,
      iops,
      recommended: item.metadata?.features?.map(f => f.trim()) || []
    }
  };
}

/**
 * Create a disk category if it doesn't exist
 */
export function createDiskCategory(): PriceCategory {
  return {
    id: 'disk',
    name: 'Discos Internos',
    items: []
  };
}

/**
 * Create an external storage category if it doesn't exist
 */
export function createExternalStorageCategory(): PriceCategory {
  return {
    id: 'external_storage',
    name: 'Storage Externo',
    items: []
  };
}

/**
 * Create a parent storage category if it doesn't exist
 */
export function createStorageCategory(): PriceCategory {
  return {
    id: 'storage',
    name: 'Armazenamento',
    items: []
  };
}

/**
 * Convert external storage to price item
 */
export function convertExternalStorageToItem(item: ComponentOption): PriceItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    type: "storage",
    subtype: "external",
    specs: item.specs || [],
    isHardware: true,
    metadata: {
      ...item.metadata,
      features: item.metadata?.features || []
    }
  };
}
