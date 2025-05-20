import { RaidMetadata } from "@/types/component";

export interface PriceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  specs?: string[];
  type: string;
  subtype?: string;
  isHardware?: boolean; // Keep for backwards compatibility
  tags?: string[]; // New property for tag management
  // Adding capacity for disk items
  capacity?: string;
  metadata?: {
    discount?: number;
    features?: string[];
    quantity?: number;
    unitPrice?: number;
    unitInfo?: string;
    // Add disk-specific metadata fields
    type?: string;
    subtype?: string;
    capacity?: string;
    readSpeed?: string;
    writeSpeed?: string;
    iops?: string;
    throughput?: string;
    recommended?: string[];
    raid?: boolean | RaidMetadata; // Alterado para aceitar tanto boolean quanto RaidMetadata
  };
}

export interface PriceCategory {
  id: string;
  name: string;
  items: PriceItem[];
}

export interface PriceData {
  [key: string]: PriceCategory;
}

export interface ImportOptions {
  merge: boolean;
  overwrite: boolean;
}

export interface PriceItemFormData {
  name: string;
  description: string;
  price: number;
  type: string;
  subtype?: string;
  specs?: string[];
  tags?: string[]; // Added tags to form data
}

// Adding typescript type for deleted items and categories tracking
export interface DeletedCategory {
  id: string;
  name: string;
  timestamp: string;
}

export interface DeletedItems {
  [categoryId: string]: string[];
}

export interface DeletedCategories {
  [categoryId: string]: DeletedCategory;
}
