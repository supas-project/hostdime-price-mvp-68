
export interface ComponentOption {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  subtype?: string;
  isHardware?: boolean;
  details?: string[];
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
    region?: string;
    badge?: string;
    duration?: number;
    certifications?: string[];
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

export interface ServerComponent {
  id: string;
  type: string;
  friendlyName: string;
  description: string;
  icon: string;
  options: ComponentOption[];
}

export interface ServerConfiguration {
  categoria: string;
  componentes: ServerComponent[];
}
