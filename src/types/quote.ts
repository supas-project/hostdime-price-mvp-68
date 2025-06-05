
import { ComponentOption } from './component';

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  APPROVED = 'APPROVED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export interface Quote {
  id: string;
  user_id: string;
  customer_email?: string;
  customer_name?: string;
  status: QuoteStatus;
  configuration: ServerConfiguration;
  total_price: number;
  subtotal: number;
  discounts: number;
  taxes: number;
  contract_duration: number;
  data_center_id: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  sent_at?: string;
  approved_at?: string;
  notes?: string;
  margin_percentage?: number;
}

export interface ServerConfiguration {
  data_center: ComponentOption;
  contract: ComponentOption;
  cpu?: ComponentOption;
  memory?: ComponentOption;
  storage_internal: ComponentOption[];
  storage_external: ComponentOption[];
  connectivity: { [key: string]: { option: ComponentOption, quantity: number } };
  operating_system?: ComponentOption;
  custom_services: ComponentOption[];
  raid_config?: RAIDConfiguration;
}

export interface RAIDConfiguration {
  type: string; // RAID 0, 1, 5, 6, 10
  drives: number;
  usable_capacity: number;
  redundancy_level: string;
  performance_impact: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  item_id: string;
  item_type: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  payback_applied: boolean;
  payback_factor?: number;
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

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  company_logo?: string;
  header_text?: string;
  footer_text?: string;
  terms_conditions?: string;
  validity_days: number;
  show_payback: boolean;
  show_breakdown: boolean;
}
