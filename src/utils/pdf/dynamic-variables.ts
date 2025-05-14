
import { ComponentOption } from "@/types/component";

export interface QuoteVariables {
  responsavelComercial: string;
  clientName: string;
  dataValidade: string;
  observacoes: string;
  dataEmissao?: string;
  numeroContato?: string;
  emailContato?: string;
}

// Enhanced function to get quote variables with HostDime defaults
export function getQuoteVariables(defaultValues?: Partial<QuoteVariables>): QuoteVariables {
  // Get current date in Brazilian format
  const today = new Date();
  const dateString = today.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Default values with HostDime branding
  return {
    responsavelComercial: defaultValues?.responsavelComercial || "Equipe Comercial HostDime",
    clientName: defaultValues?.clientName || "Cliente",
    dataValidade: defaultValues?.dataValidade || "30 dias",
    observacoes: defaultValues?.observacoes || "",
    dataEmissao: defaultValues?.dataEmissao || dateString,
    numeroContato: defaultValues?.numeroContato || "(11) 4766-4840",
    emailContato: defaultValues?.emailContato || "vendas@hostdime.com.br",
  };
}

// Enhanced function to calculate totals with improved accuracy
export function calculateTotalValue(
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  margin: number = 25
): { subtotal: number; total: number; profit: number } {
  let subtotal = 0;

  // Sum selected components
  Object.values(selectedComponents).forEach((component) => {
    if (component && component.price) {
      subtotal += component.price;
    }
  });

  // Sum storage items
  storageItems.internal.forEach((item) => {
    if (item?.price) subtotal += item.price;
  });
  
  storageItems.external.forEach((item) => {
    if (item?.price) subtotal += item.price;
  });

  // Sum custom services with quantity
  customServices.forEach((service) => {
    if (service?.price) {
      const quantity = service.metadata?.quantity || 1;
      subtotal += service.price * quantity;
    }
  });

  // Sum connectivity items with quantity
  Object.values(connectivityItems).forEach((item) => {
    if (item.option?.price) {
      subtotal += item.option.price * (item.quantity || 1);
    }
  });

  // Calculate profit based on margin with precise rounding
  const profit = Number((subtotal * (margin / 100)).toFixed(2));
  
  // Calculate total with profit margin
  const total = subtotal + profit;

  return { subtotal, total, profit };
}

// Enhanced function to build detailed server descriptions
export function buildServerDescription(
  selectedComponents: { [key: string]: ComponentOption }
): string {
  const parts = [];
  
  // Add components with better formatting
  if (selectedComponents.cpu) {
    parts.push(`Processador ${selectedComponents.cpu.name}`);
  }
  
  if (selectedComponents.memory) {
    parts.push(`${selectedComponents.memory.name}`);
  }
  
  if (selectedComponents.os) {
    parts.push(`${selectedComponents.os.name}`);
  }
  
  if (selectedComponents.datacenter) {
    parts.push(`Localizado no ${selectedComponents.datacenter.name}`);
  }
  
  // If no components selected, return default description with HostDime branding
  if (parts.length === 0) {
    return "Servidor dedicado personalizado HostDime com configuração avançada";
  }
  
  return parts.join(", ") + ".";
}
