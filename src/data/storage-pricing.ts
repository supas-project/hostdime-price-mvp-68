
import { StoragePricing } from "@/types/storage";

// Define custom storage types
export interface StorageDataItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  subtype: string;
  specs: string[];
  tags: string[];
  metadata: {
    benefits: string[];
    minCapacity: number;
    maxCapacity: number;
    capacityUnit: string;
    capacityStep: number;
  }
}

// Define the storageData array
export const storageData: StorageDataItem[] = [
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

// Preços de discos com controle de versão para detecção de modificações concorrentes
export const diskPricing: StoragePricing = {
  "nvme-500": 89.90,
  "nvme-1000": 169.90,
  "ssd-500": 49.90,
  "ssd-1000": 89.90,
  "hdd-1000": 29.90,
  "hdd-2000": 49.90,
};

// Timestamp da última atualização dos preços
// Isto ajuda a detectar quando os preços foram atualizados,
// o que é crucial para sincronização multiusuário
export const storagePricingLastUpdated = Date.now();

// Função para verificar se um preço foi atualizado
export function isPricingUpdated(lastCheck: number): boolean {
  return storagePricingLastUpdated > lastCheck;
}
