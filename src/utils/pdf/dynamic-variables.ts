
import { ComponentOption } from "@/types/component";

export interface QuoteVariables {
  responsavelComercial: string;
  clientName: string;
  dataValidade: string;
  observacoes: string;
  dataEmissao?: string; // New: date of quote issue
  numeroContato?: string; // New: contact number
  emailContato?: string; // New: contact email
}

// Function to get quote variables with defaults
export function getQuoteVariables(defaultValues?: Partial<QuoteVariables>): QuoteVariables {
  // Get current date in Brazilian format
  const today = new Date();
  const dateString = today.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Default values with fallbacks
  return {
    responsavelComercial: defaultValues?.responsavelComercial || "Equipe HostDime",
    clientName: defaultValues?.clientName || "Cliente",
    dataValidade: defaultValues?.dataValidade || "30 dias",
    observacoes: defaultValues?.observacoes || "",
    dataEmissao: defaultValues?.dataEmissao || dateString,
    numeroContato: defaultValues?.numeroContato || "(11) 4766-4840",
    emailContato: defaultValues?.emailContato || "vendas@hostdime.com.br",
  };
}

// Calculate total value of components with improved accuracy
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

  // Sum internal storage
  storageItems.internal.forEach((item) => {
    if (item && item.price) {
      subtotal += item.price;
    }
  });

  // Sum external storage
  storageItems.external.forEach((item) => {
    if (item && item.price) {
      subtotal += item.price;
    }
  });

  // Sum custom services
  customServices.forEach((service) => {
    if (service && service.price) {
      // Account for quantity if present
      const quantity = service.metadata?.quantity || 1;
      subtotal += service.price * quantity;
    }
  });

  // Sum connectivity items with quantity handling
  Object.values(connectivityItems).forEach((item) => {
    if (item.option && item.option.price) {
      subtotal += item.option.price * (item.quantity || 1);
    }
  });

  // Calculate profit based on margin
  const profit = subtotal * (margin / 100);
  
  // Calculate total with profit margin
  const total = subtotal + profit;

  return { subtotal, total, profit };
}

// Format currency with improved locale handling
export function formatCurrency(value: number): string {
  if (isNaN(value)) return "R$ 0,00";
  
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Build detailed server description with better formatting
export function buildServerDescription(
  selectedComponents: { [key: string]: ComponentOption }
): string {
  const parts = [];
  
  // Add CPU with better formatting
  if (selectedComponents.cpu) {
    parts.push(`Processador ${selectedComponents.cpu.name}`);
  }
  
  // Add memory with better formatting
  if (selectedComponents.memory) {
    parts.push(`${selectedComponents.memory.name}`);
  }
  
  // Add OS with better formatting
  if (selectedComponents.os) {
    parts.push(`${selectedComponents.os.name}`);
  }
  
  // Add datacenter if present
  if (selectedComponents.datacenter) {
    parts.push(`Localizado no ${selectedComponents.datacenter.name}`);
  }
  
  // If no components selected, return default description
  if (parts.length === 0) {
    return "Servidor dedicado personalizado com configuração avançada";
  }
  
  return parts.join(", ") + ".";
}
