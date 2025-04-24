
export interface StorageSpecs {
  readSpeed: string;
  writeSpeed: string;
  iops: string;
}

export interface DiskOption {
  id: string;
  type: "nvme" | "ssd" | "hdd";
  capacity: string;
  specs: StorageSpecs;
  recommended: string[];
}

export interface PricedDiskOption extends DiskOption {
  price: number;
}

export interface StoragePricing {
  [key: string]: number;
}
