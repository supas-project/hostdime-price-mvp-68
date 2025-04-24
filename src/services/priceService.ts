
import { 
  CPUOption, 
  ChassisOption, 
  MemoryOption, 
  DiskOption,
  RAIDOption,
  IOPsBlockOption,
  ContractOption
} from "@/types/server-config";

// Placeholder para futuro carregamento de dados da tabela de preços
export async function fetchComponents() {
  // Simulando uma chamada API
  return {
    cpus: mockCPUs,
    chassis: mockChassis,
    memories: mockMemories,
    disks: mockDisks,
    raids: mockRAIDs,
    iopsBlocks: mockIOPsBlocks,
    contracts: mockContracts
  };
}

// Mock data
export const mockCPUs: CPUOption[] = [
  {
    id: "cpu-1",
    model: "Intel Xeon E-2224",
    description: "CPU básica para aplicações leves",
    cores: 4,
    ghz: 3.4,
    price: 280
  },
  {
    id: "cpu-2",
    model: "Intel Xeon E-2288G",
    description: "CPU intermediária com bom custo-benefício",
    cores: 8,
    ghz: 3.7,
    price: 580
  },
  {
    id: "cpu-3",
    model: "Intel Xeon Silver 4210",
    description: "CPU avançada para cargas pesadas",
    cores: 10,
    ghz: 2.2,
    price: 980
  },
  {
    id: "cpu-4",
    model: "Intel Xeon Gold 6230",
    description: "CPU premium para aplicações críticas",
    cores: 20,
    ghz: 2.1,
    price: 1920
  }
];

export const mockChassis: ChassisOption[] = [
  {
    id: "chassis-1",
    model: "Dell PowerEdge R240",
    description: "Servidor básico 1U",
    memoryType: "DDR4",
    memorySlots: 2,
    diskSlots: 4,
    cpuCompatibility: ["cpu-1", "cpu-2"],
    price: 1200
  },
  {
    id: "chassis-2",
    model: "Dell PowerEdge R340",
    description: "Servidor intermediário 1U",
    memoryType: "DDR4",
    memorySlots: 4,
    diskSlots: 8,
    cpuCompatibility: ["cpu-1", "cpu-2", "cpu-3"],
    price: 1800
  },
  {
    id: "chassis-3",
    model: "Dell PowerEdge R440",
    description: "Servidor avançado 1U",
    memoryType: "DDR4",
    memorySlots: 16,
    diskSlots: 10,
    cpuCompatibility: ["cpu-2", "cpu-3", "cpu-4"],
    price: 2400
  },
  {
    id: "chassis-4",
    model: "Dell PowerEdge R540",
    description: "Servidor premium 2U",
    memoryType: "DDR4",
    memorySlots: 16,
    diskSlots: 24,
    cpuCompatibility: ["cpu-3", "cpu-4"],
    price: 3600
  }
];

export const mockMemories: MemoryOption[] = [
  {
    id: "mem-1",
    type: "DDR4",
    size: 8,
    description: "8GB DDR4 2666MHz",
    price: 120,
    compatibleChassis: ["chassis-1", "chassis-2", "chassis-3", "chassis-4"]
  },
  {
    id: "mem-2",
    type: "DDR4",
    size: 16,
    description: "16GB DDR4 2933MHz",
    price: 240,
    compatibleChassis: ["chassis-1", "chassis-2", "chassis-3", "chassis-4"]
  },
  {
    id: "mem-3",
    type: "DDR4",
    size: 32,
    description: "32GB DDR4 3200MHz",
    price: 480,
    compatibleChassis: ["chassis-2", "chassis-3", "chassis-4"]
  },
  {
    id: "mem-4",
    type: "DDR4",
    size: 64,
    description: "64GB DDR4 3200MHz",
    price: 960,
    compatibleChassis: ["chassis-3", "chassis-4"]
  }
];

export const mockDisks: DiskOption[] = [
  {
    id: "disk-1",
    type: "SSD",
    size: 240,
    brand: "Intel",
    description: "SSD SATA 240GB",
    price: 150
  },
  {
    id: "disk-2",
    type: "SSD",
    size: 480,
    brand: "Samsung",
    description: "SSD SATA 480GB",
    price: 280
  },
  {
    id: "disk-3",
    type: "SSD",
    size: 960,
    brand: "Western Digital",
    description: "SSD SATA 960GB",
    price: 520
  },
  {
    id: "disk-4",
    type: "NVMe",
    size: 512,
    brand: "Samsung",
    description: "SSD NVMe 512GB",
    price: 380
  },
  {
    id: "disk-5",
    type: "NVMe",
    size: 1024,
    brand: "Intel",
    description: "SSD NVMe 1TB",
    price: 720
  },
  {
    id: "disk-6",
    type: "HDD",
    size: 1000,
    brand: "Seagate",
    description: "HDD SATA 1TB 7200RPM",
    price: 120
  },
  {
    id: "disk-7",
    type: "HDD",
    size: 2000,
    brand: "Western Digital",
    description: "HDD SATA 2TB 7200RPM",
    price: 210
  }
];

export const mockRAIDs: RAIDOption[] = [
  {
    id: "raid-0",
    type: "0",
    minDisks: 2,
    description: "Striping - Maior performance, sem redundância"
  },
  {
    id: "raid-1",
    type: "1",
    minDisks: 2,
    description: "Espelhamento - Redundância, performance de leitura aprimorada"
  },
  {
    id: "raid-5",
    type: "5",
    minDisks: 3,
    description: "Distribuição com paridade - Boa performance e redundância"
  },
  {
    id: "raid-10",
    type: "10",
    minDisks: 4,
    description: "Combinação de RAID 0+1 - Alta performance e alta redundância"
  }
];

export const mockIOPsBlocks: IOPsBlockOption[] = [
  {
    id: "iops-ssd",
    type: "SSD BLOCO",
    description: "Blocos de IOPs para discos SSD",
    pricePerBlock: 150
  },
  {
    id: "iops-hdd",
    type: "HDD BLOCO",
    description: "Blocos de IOPs para discos HDD",
    pricePerBlock: 90
  },
  {
    id: "iops-object",
    type: "OBJECT",
    description: "Armazenamento de objetos",
    pricePerBlock: 180
  }
];

export const mockContracts: ContractOption[] = [
  {
    id: "contract-0",
    months: 0,
    payback: 0,
    description: "Contrato por tempo indeterminado"
  },
  {
    id: "contract-12",
    months: 12,
    payback: 9,
    description: "Contrato de 12 meses (payback em 9 meses)"
  },
  {
    id: "contract-24",
    months: 24,
    payback: 7,
    description: "Contrato de 24 meses (payback em 7 meses)"
  },
  {
    id: "contract-36",
    months: 36,
    payback: 5,
    description: "Contrato de 36 meses (payback em 5 meses)"
  },
  {
    id: "contract-48",
    months: 48,
    payback: 4,
    description: "Contrato de 48 meses (payback em 4 meses)"
  },
  {
    id: "contract-60",
    months: 60,
    payback: 3,
    description: "Contrato de 60 meses (payback em 3 meses)"
  }
];
