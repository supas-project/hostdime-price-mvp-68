
export interface StorageConfig {
  type: string;
  capacity: number;
  price: number;
}

export interface StoragePricing {
  [key: string]: number;
}

export interface DiskOption {
  id: string;
  type: string;
  capacity: string;
  specs: {
    readSpeed: string;
    writeSpeed: string;
    iops: string;
    recommended: string[];
  };
}

export interface PricedDiskOption extends DiskOption {
  type: "nvme" | "ssd" | "hdd";
  price: number;
}

// Adding the StorageTier interface that was missing
export interface StorageTier {
  name: string;
  price: number;
  iops: string;
  throughput: string;
  description: string;
}
