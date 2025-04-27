
export type RaidType = "0" | "1" | "5" | "6" | "10" | "none";

export interface RaidInfo {
  type: RaidType;
  minDisks: number;
  description: string;
  protection: string;
  usageRecommendation: string;
  isHardware: boolean;
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
