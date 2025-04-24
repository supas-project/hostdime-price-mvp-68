
export interface DataCenterLocation {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface CPUOption {
  id: string;
  model: string;
  description: string;
  cores: number;
  ghz: number;
  price: number;
}

export interface ChassisOption {
  id: string;
  model: string;
  description: string;
  memoryType: string;
  memorySlots: number;
  diskSlots: number;
  cpuCompatibility: string[];
  price: number;
}

export interface MemoryOption {
  id: string;
  type: string;
  size: number;
  description: string;
  price: number;
  compatibleChassis: string[];
}

export interface DiskOption {
  id: string;
  type: string;
  size: number;
  brand: string;
  description: string;
  price: number;
}

export interface RAIDOption {
  id: string;
  type: string;
  minDisks: number;
  description: string;
}

export interface IOPsBlockOption {
  id: string;
  type: string;
  description: string;
  pricePerBlock: number;
}

export interface ContractOption {
  id: string;
  months: number;
  payback: number;
  description: string;
}

export interface ServerConfiguration {
  location: DataCenterLocation | null;
  cpu: CPUOption | null;
  chassis: ChassisOption | null;
  memory: {
    option: MemoryOption | null;
    quantity: number;
  };
  disks: Array<{
    option: DiskOption;
    quantity: number;
  }>;
  raid: {
    enabled: boolean;
    option: RAIDOption | null;
  };
  iopsBlocks: Array<{
    option: IOPsBlockOption;
    quantity: number;
  }>;
  bandwidth: number;
  ddosProtection: boolean;
  contract: ContractOption | null;
}

export interface PricingDetails {
  baseTotal: number;
  margin: number;
  finalTotal: number;
}

export type ServerConfigStep = 
  | 'location' 
  | 'cpu' 
  | 'chassis' 
  | 'memory' 
  | 'disks' 
  | 'raid' 
  | 'iops' 
  | 'bandwidth' 
  | 'ddos' 
  | 'contract';

export const ALL_STEPS: ServerConfigStep[] = [
  'location',
  'cpu',
  'chassis',
  'memory',
  'disks',
  'raid',
  'iops',
  'bandwidth',
  'ddos',
  'contract'
];
