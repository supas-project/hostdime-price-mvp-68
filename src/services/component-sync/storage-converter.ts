
import { DiskOption, PricedDiskOption } from "@/types/storage";
import { PriceItem } from "@/types/pricing";

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
      // Store capacity info in a features array instead of as a direct property
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
