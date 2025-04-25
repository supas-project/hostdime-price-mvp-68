
export type RaidType = "0" | "1" | "5" | "none";

export interface RaidInfo {
  type: RaidType;
  minDisks: number;
  description: string;
  protection: "Nenhuma" | "Espelhamento" | "Paridade";
  usageRecommendation: string;
}

export interface RaidCalculation {
  usableCapacity: number;
  totalCapacity: number;
  protection: string;
  performance: {
    read: string;
    write: string;
  };
}
