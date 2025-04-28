
export interface StoragePricing {
  [key: string]: number;
}

export interface StorageTier {
  name: string;
  price: number;
  iops: string;
  throughput: string;
  description?: string;
}

export interface PricedDiskOption {
  id: string;
  type: "nvme" | "ssd" | "hdd";
  capacity: string;
  price: number;
  specs?: string[] | {
    readSpeed?: string;
    writeSpeed?: string;
    iops?: string;
    recommended?: string[];
  };
}

export interface DiskOption {
  id: string;
  type: string;
  capacity: string;
  specs?: string[] | {
    readSpeed?: string;
    writeSpeed?: string;
    iops?: string;
    recommended?: string[];
  };
}

export interface RaidOption {
  id: string;
  name: string;
  writeProtection: boolean;
  diskFaultTolerance: number;
  minDisks: number;
  capacityLoss: number;
  capacityMultiplier: number;
  performanceImpact: {
    read: "increase" | "none" | "decrease";
    write: "increase" | "none" | "decrease";
  };
}
