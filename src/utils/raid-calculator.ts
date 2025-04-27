
import { RaidType, RaidCalculation, RaidInfo } from "@/types/raid";
import { PricedDiskOption } from "@/types/storage";

export const RAID_INFO: Record<RaidType, RaidInfo> = {
  "none": {
    type: "none",
    minDisks: 1,
    description: "Sem configuração RAID",
    protection: "Nenhuma",
    usageRecommendation: "Configuração padrão sem redundância ou performance adicional",
    isHardware: false
  },
  "0": {
    type: "0",
    minDisks: 2,
    description: "Aumenta performance e capacidade, sem redundância",
    protection: "Nenhuma",
    usageRecommendation: "Melhor performance, sem proteção contra falhas",
    isHardware: false
  },
  "1": {
    type: "1",
    minDisks: 2,
    description: "Espelhamento completo dos dados",
    protection: "Espelhamento",
    usageRecommendation: "Proteção contra falhas com boa performance de leitura",
    isHardware: false
  },
  "5": {
    type: "5",
    minDisks: 3,
    description: "Distribuição dos dados com paridade",
    protection: "Paridade",
    usageRecommendation: "Bom equilíbrio entre capacidade, performance e proteção",
    isHardware: false
  },
  "6": {
    type: "6",
    minDisks: 4,
    description: "Distribuição com dupla paridade",
    protection: "Dupla Paridade",
    usageRecommendation: "Alta proteção contra falhas múltiplas de discos",
    isHardware: false
  },
  "10": {
    type: "10",
    minDisks: 4,
    description: "Combinação de espelhamento e distribuição",
    protection: "Espelhamento + Distribuição",
    usageRecommendation: "Excelente performance e boa proteção contra falhas",
    isHardware: false
  }
};

export function calculateRaidCapacity(disks: PricedDiskOption[], quantity: number, raidType: RaidType, isHardware: boolean = false): RaidCalculation {
  const diskCapacity = parseInt(disks[0].capacity.replace(/[^0-9]/g, ''));
  const totalCapacity = diskCapacity * quantity;
  
  let usableCapacity: number;
  let readPerformance: string;
  let writePerformance: string;
  
  switch (raidType) {
    case "0":
      usableCapacity = totalCapacity;
      readPerformance = "Excelente";
      writePerformance = "Excelente";
      break;
    case "1":
      usableCapacity = totalCapacity / 2;
      readPerformance = "Muito Boa";
      writePerformance = "Boa";
      break;
    case "5":
      usableCapacity = totalCapacity * ((quantity - 1) / quantity);
      readPerformance = "Boa";
      writePerformance = "Moderada";
      break;
    case "6":
      usableCapacity = totalCapacity * ((quantity - 2) / quantity);
      readPerformance = "Boa";
      writePerformance = "Moderada";
      break;
    case "10":
      usableCapacity = totalCapacity / 2;
      readPerformance = "Excelente";
      writePerformance = "Muito Boa";
      break;
    case "none":
    default:
      usableCapacity = totalCapacity;
      readPerformance = "Normal";
      writePerformance = "Normal";
  }

  const raidInfo = { ...RAID_INFO[raidType] };
  raidInfo.isHardware = isHardware;

  return {
    usableCapacity,
    totalCapacity,
    protection: raidInfo.protection,
    performance: {
      read: readPerformance,
      write: writePerformance
    },
    raidInfo
  };
}
