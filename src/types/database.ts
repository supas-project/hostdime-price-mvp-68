
export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Item {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  specs: Record<string, any>;
  tags: string[];
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ChangeLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_by?: string;
  changed_at: string;
  version_number: number;
}

export interface DataVersion {
  id: string;
  version_name: string;
  description?: string;
  categories_snapshot: Category[];
  items_snapshot: Item[];
  created_by?: string;
  created_at: string;
  is_current: boolean;
}
