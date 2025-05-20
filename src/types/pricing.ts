
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
  metadata?: {
    discount?: number;
    features?: string[];
    quantity?: number;
    unitPrice?: number;
    unitInfo?: string; // Added for storing additional storage metadata as JSON string
  };
  // Adding capacity for disk items
  capacity?: string;
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
