
export interface ComponentOption {
  id: string;
  name: string;
  description: string;
  price: number;
  specs?: string[];
  type: string;
  metadata?: {
    discount?: number;
    features?: string[];
    badge?: string;
  };
}

export interface ServerComponent {
  id: string;
  type: string;
  friendlyName: string;
  description: string;
  icon: string;
  options: ComponentOption[];
}

export interface ServerConfiguration {
  categoria: string;
  componentes: ServerComponent[];
}
