
import { RaidType, RaidCalculation } from "@/types/raid";
import { PricedDiskOption } from "@/types/storage";

export const RAID_INFO = {
  "0": {
    type: "0",
    minDisks: 2,
    description: "Aumenta performance e capacidade, sem redundância",
    protection: "Nenhuma",
    usageRecommendation: "Melhor performance, sem proteção contra falhas"
  },
  "1": {
    type: "1",
    minDisks: 2,
    description: "Espelhamento completo dos dados",
    protection: "Espelhamento",
    usageRecommendation: "Proteção contra falhas com boa performance de leitura"
  },
  "5": {
    type: "5",
    minDisks: 3,
    description: "Distribuição dos dados com paridade",
    protection: "Paridade",
    usageRecommendation: "Bom equilíbrio entre capacidade, performance e proteção"
  }
} as const;

export function calculateRaidCapacity(disks: PricedDiskOption[], quantity: number, raidType: RaidType): RaidCalculation {
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
    default:
      usableCapacity = totalCapacity;
      readPerformance = "Normal";
      writePerformance = "Normal";
  }

  return {
    usableCapacity,
    totalCapacity,
    protection: RAID_INFO[raidType].protection,
    performance: {
      read: readPerformance,
      write: writePerformance
    }
  };
}
