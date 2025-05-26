
export interface ComponentOption {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  subtype?: string;
  isHardware?: boolean;
  details?: string[]; // Added missing details property
  metadata?: {
    cores?: number;
    perCore?: boolean;
    licensesNeeded?: number;
    discount?: number;
    features?: string[];
    quantity?: number;
    unitPrice?: number;
    unitInfo?: string;
    location?: string;
    badge?: string;
    raid?: {
      type: string;
      description: string;
      protection: string;
      usableCapacity?: number;
      isHardware?: boolean;
    };
  };
  specs?: string[];
}

export interface StorageItems {
  internal: ComponentOption[];
  external: ComponentOption[];
}

export interface CustomService {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  specs?: string[];
  metadata?: {
    quantity?: number;
    unitPrice?: number;
    unitInfo?: string;
  };
}

// Added missing ServerComponent interface
export interface ServerComponent {
  id: string;
  type: string;
  friendlyName: string;
  description: string;
  icon: string;
  options: ComponentOption[];
}

// Added missing ServerConfiguration interface
export interface ServerConfiguration {
  categoria: string;
  componentes: ServerComponent[];
}
