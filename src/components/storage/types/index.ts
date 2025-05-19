
export interface StorageType {
  name: string;
  pricePerGB: number;
  iops: string;
  throughput: string;
  description: string;
  throughputAdd?: number;
  maxThroughput?: string;
}

export interface StorageHandlerConfig {
  onSelectInternalDisk?: (disk: any, quantity: number) => void;
  onSelectExternalStorage?: (type: string, capacity: number, price: number) => void;
}

// Use "export type" for re-exporting types when isolatedModules is enabled
export type { StorageType as StorageTypeDetailed } from './storage-types';
