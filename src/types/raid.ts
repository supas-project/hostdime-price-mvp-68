
export type RaidType = "0" | "1" | "5" | "6" | "10" | "none";

export interface RaidInfo {
  type: RaidType;
  minDisks: number;
  description: string;
  protection: string;
  usageRecommendation: string;
  isHardware: boolean;
  advantages: string[];
  disadvantages: string[];
  performanceLevel: {
    read: "baixa" | "moderada" | "boa" | "excelente";
    write: "baixa" | "moderada" | "boa" | "excelente";
  };
  dataProtectionLevel: "nenhuma" | "básica" | "boa" | "excelente";
  capacityEfficiency: number; // Percentage of total capacity that is usable
}

export interface RaidCalculation {
  usableCapacity: number;
  totalCapacity: number;
  protection: string;
  performance: {
    read: string;
    write: string;
  };
  raidInfo?: RaidInfo;
}
