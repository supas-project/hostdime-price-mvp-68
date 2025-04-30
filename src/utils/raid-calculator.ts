import { RaidType, RaidCalculation, RaidInfo } from "@/types/raid";
import { PricedDiskOption } from "@/types/storage";
import { convertToGB, formatStorageCapacity } from "@/utils/storage-utils";

export const RAID_INFO: Record<RaidType, RaidInfo> = {
  "none": {
    type: "none",
    minDisks: 1,
    description: "Sem configuração RAID - Discos independentes",
    protection: "Nenhuma proteção contra falhas",
    usageRecommendation: "Recomendado apenas quando a proteção dos dados não é crítica",
    isHardware: false,
    advantages: [
      "Usa 100% da capacidade dos discos",
      "Performance padrão dos discos",
      "Configuração mais simples"
    ],
    disadvantages: [
      "Nenhuma proteção contra falhas",
      "Perda total dos dados se o disco falhar"
    ],
    performanceLevel: {
      read: "moderada",
      write: "moderada"
    },
    dataProtectionLevel: "nenhuma",
    capacityEfficiency: 100
  },
  "0": {
    type: "0",
    minDisks: 2,
    description: "Máxima velocidade, sem proteção",
    protection: "❌ Sem proteção contra falhas",
    usageRecommendation: "Cache temporário ou dados não críticos que precisam de alta velocidade",
    isHardware: false,
    advantages: [
      "Velocidade máxima de leitura e gravação",
      "Usa 100% da capacidade dos discos"
    ],
    disadvantages: [
      "Nenhuma proteção contra falhas",
      "Risco aumentado de perda de dados",
      "Se um disco falhar, todos os dados são perdidos"
    ],
    performanceLevel: {
      read: "excelente",
      write: "excelente"
    },
    dataProtectionLevel: "nenhuma",
    capacityEfficiency: 100
  },
  "1": {
    type: "1",
    minDisks: 2,
    description: "Espelhamento completo para segurança",
    protection: "✓ Proteção contra falha de um disco",
    usageRecommendation: "Sistemas críticos que precisam de segurança",
    isHardware: false,
    advantages: [
      "Proteção contra falha de disco",
      "Boa velocidade de leitura",
      "Recuperação rápida em caso de falha"
    ],
    disadvantages: [
      "Usa apenas 50% da capacidade total",
      "Velocidade de gravação reduzida",
      "Custo mais alto por GB útil"
    ],
    performanceLevel: {
      read: "boa",
      write: "moderada"
    },
    dataProtectionLevel: "boa",
    capacityEfficiency: 50
  },
  "5": {
    type: "5",
    minDisks: 3,
    description: "Equilíbrio entre proteção e capacidade",
    protection: "✓ Proteção contra falha de um disco com paridade",
    usageRecommendation: "Servidores de arquivos e bancos de dados gerais",
    isHardware: false,
    advantages: [
      "Bom equilíbrio entre proteção e capacidade",
      "Boa velocidade de leitura",
      "Melhor custo-benefício"
    ],
    disadvantages: [
      "Performance de gravação menor",
      "Reconstrução lenta após falha",
      "Maior uso de processamento"
    ],
    performanceLevel: {
      read: "boa",
      write: "moderada"
    },
    dataProtectionLevel: "boa",
    capacityEfficiency: 67
  },
  "6": {
    type: "6",
    minDisks: 4,
    description: "Proteção extra contra falhas múltiplas",
    protection: "✓✓ Proteção contra falha de até dois discos",
    usageRecommendation: "Dados críticos que exigem máxima proteção",
    isHardware: false,
    advantages: [
      "Proteção contra falha de dois discos",
      "Alta confiabilidade",
      "Boa para discos de grande capacidade"
    ],
    disadvantages: [
      "Menor capacidade útil",
      "Performance de gravação reduzida",
      "Reconstrução muito lenta"
    ],
    performanceLevel: {
      read: "boa",
      write: "baixa"
    },
    dataProtectionLevel: "excelente",
    capacityEfficiency: 50
  },
  "10": {
    type: "10",
    minDisks: 4,
    description: "Alta performance com proteção",
    protection: "✓ Proteção contra falhas com alta performance",
    usageRecommendation: "Bancos de dados e aplicações que precisam de velocidade e segurança",
    isHardware: false,
    advantages: [
      "Excelente performance geral",
      "Boa proteção contra falhas",
      "Recuperação rápida"
    ],
    disadvantages: [
      "Usa apenas 50% da capacidade",
      "Custo mais alto",
      "Necessita 4 ou mais discos"
    ],
    performanceLevel: {
      read: "excelente",
      write: "boa"
    },
    dataProtectionLevel: "boa",
    capacityEfficiency: 50
  }
};

export function calculateRaidCapacity(disks: PricedDiskOption[], quantity: number, raidType: RaidType, isHardware: boolean = false): RaidCalculation {
  // Extrair a capacidade do disco selecionado e converter para GB consistentemente
  const diskCapacityGB = convertToGB(disks[0].capacity);
  const totalCapacityGB = diskCapacityGB * quantity;
  
  let usableCapacityGB: number;
  
  // Aplicar o cálculo de RAID baseado no tipo
  switch (raidType) {
    case "0":
      usableCapacityGB = totalCapacityGB;
      break;
    case "1":
      usableCapacityGB = totalCapacityGB / 2;
      break;
    case "5":
      usableCapacityGB = totalCapacityGB * ((quantity - 1) / quantity);
      break;
    case "6":
      usableCapacityGB = totalCapacityGB * ((quantity - 2) / quantity);
      break;
    case "10":
      usableCapacityGB = totalCapacityGB / 2;
      break;
    case "none":
    default:
      usableCapacityGB = totalCapacityGB;
  }

  const raidInfo = { ...RAID_INFO[raidType] };
  raidInfo.isHardware = isHardware;

  return {
    usableCapacity: usableCapacityGB,
    totalCapacity: totalCapacityGB,
    protection: raidInfo.protection,
    performance: {
      read: RAID_INFO[raidType].performanceLevel.read,
      write: RAID_INFO[raidType].performanceLevel.write
    },
    raidInfo
  };
}
