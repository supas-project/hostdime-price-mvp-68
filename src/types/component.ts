
export interface ComponentOption {
  id: string;
  name: string;
  description: string;
  price: number;
  specs?: string[];
  type: string;
  subtype?: string;
  metadata?: {
    discount?: number;
    features?: string[];
    badge?: string;
    location?: string;
  };
}

export interface DataCenterOption extends ComponentOption {
  metadata: {
    features?: string[];
    badge?: string;
    location?: string;
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

export interface StorageItems {
  internal: ComponentOption[];
  external: ComponentOption[];
}

