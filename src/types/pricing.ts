

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

export interface PriceBreakdown {
  hardware_cost: number;
  software_cost: number;
  services_cost: number;
  payback_savings: number;
  subtotal: number;
  discounts: number;
  taxes: number;
  total: number;
}

export interface ContractRule {
  duration_months: number;
  payback_factor: number;
  discount_percentage: number;
  min_commitment?: number;
}

// Additional types needed by the UI components
export interface PriceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  subtype?: string;
  isHardware?: boolean;
  specs?: string[];
  tags?: string[];
  metadata?: {
    cores?: number;
    perCore?: boolean;
    licensesNeeded?: number;
    discount?: number;
    features?: string[];
    quantity?: number;
    unitPrice?: number;
    unitInfo?: string;
    location?: string;
    badge?: string;
  };
}

export interface PriceCategory {
  id: string;
  name: string;
  items: PriceItem[];
  order?: number;
  description?: string;
}

export interface PriceData {
  [categoryId: string]: PriceCategory;
}

export interface ImportOptions {
  overwrite?: boolean;
  validateData?: boolean;
  backupBefore?: boolean;
  dryRun?: boolean;
}

// Additional types for quote management
export interface QuoteCalculationRequest {
  configuration: any;
  contract_duration: number;
  data_center_id: string;
  apply_payback: boolean;
  customer_info?: {
    name?: string;
    email?: string;
    company?: string;
  };
}

export interface QuoteCalculationResponse {
  quote_id: string;
  breakdown: PriceBreakdown;
  applied_rules: string[];
  warnings: string[];
  recommendations: string[];
  expires_at: string;
}

