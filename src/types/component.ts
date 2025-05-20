
export interface RaidMetadata {
  type: string;
  description: string;
  protection: string;
  isHardware: boolean;
  usableCapacity: number;
  totalCapacity: number;
  performance: {
    read: string;
    write: string;
  };
}

export interface ComponentOption {
  id: string;
  name: string;
  description: string;
  price: number;
  specs?: string[];
  type: string;
  subtype?: string;
  isHardware?: boolean;
  details?: string[];
  isHeader?: boolean; // Propriedade para cabeçalhos de seção
  metadata?: {
    discount?: number;
    features?: string[];
    badge?: string;
    location?: string;
    perCore?: boolean;
    cores?: number;
    raid?: RaidMetadata;
    quantity?: number;
    unitPrice?: number;
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

// Interface para melhorar a tipagem dos dados de conectividade
export interface ConnectivityItems {
  ports: ComponentOption[];
  ips: ComponentOption[];
}
