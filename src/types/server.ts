
import { ComponentOption } from "@/data/server-components";

export interface DataCenterFeatures {
  features: string[];
  badge?: 'Recomendado' | 'Internacional';
}

export interface DataCenterOption extends ComponentOption {
  metadata: DataCenterFeatures;
}
