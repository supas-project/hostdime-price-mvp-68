
export interface PricingRule {
  id: string;
  name: string;
  type: 'PAYBACK' | 'DISCOUNT' | 'SCALING' | 'BUNDLE';
  conditions: PricingCondition[];
  factor: number;
  active: boolean;
  priority: number;
}

export interface PricingCondition {
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
  value: any;
}

export interface PaybackRule {
  contract_duration: number; // em meses
  payback_factor: number;
  description: string;
}

export interface MemoryScalingRule {
  min_gb: number;
  max_gb: number;
  increment_gb: number;
  price_per_gb: number;
}

export interface PriceCalculationRequest {
  configuration: any;
  contract_duration: number;
  data_center_id: string;
  apply_payback: boolean;
}

export interface PriceCalculationResponse {
  breakdown: PriceBreakdown;
  applied_rules: string[];
  warnings: string[];
  recommendations: string[];
}

export interface ContractRule {
  duration_months: number;
  payback_factor: number;
  discount_percentage: number;
  min_commitment?: number;
}
