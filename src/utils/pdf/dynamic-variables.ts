
import { ComponentOption } from "@/types/component";

export interface QuoteVariables {
  responsavelComercial?: string;
  clientName?: string;
  dataValidade?: string;
  observacoes?: string;
}

// Função para obter as variáveis dinâmicas da cotação
export function getQuoteVariables(defaultValues?: Partial<QuoteVariables>): QuoteVariables {
  // Valores padrão caso não sejam fornecidos
  return {
    responsavelComercial: defaultValues?.responsavelComercial || "Equipe HostDime",
    clientName: defaultValues?.clientName || "Cliente",
    dataValidade: defaultValues?.dataValidade || "30 dias",
    observacoes: defaultValues?.observacoes || "",
  };
}

// Função para calcular o valor total dos componentes selecionados
export function calculateTotalValue(
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  margin: number = 25
): { subtotal: number; total: number; profit: number } {
  let subtotal = 0;

  // Somar componentes selecionados
  Object.values(selectedComponents).forEach((component) => {
    if (component && component.price) {
      subtotal += component.price;
    }
  });

  // Somar armazenamento interno
  storageItems.internal.forEach((item) => {
    if (item && item.price) {
      subtotal += item.price;
    }
  });

  // Somar armazenamento externo
  storageItems.external.forEach((item) => {
    if (item && item.price) {
      subtotal += item.price;
    }
  });

  // Somar serviços personalizados
  customServices.forEach((service) => {
    if (service && service.price) {
      subtotal += service.price;
    }
  });

  // Somar itens de conectividade
  Object.values(connectivityItems).forEach((item) => {
    if (item.option && item.option.price) {
      subtotal += item.option.price * (item.quantity || 1);
    }
  });

  // Calcular lucro com base na margem
  const profit = subtotal * (margin / 100);
  
  // Calcular total com margem de lucro
  const total = subtotal + profit;

  return { subtotal, total, profit };
}

// Função para formatar valores monetários
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Função para construir descrição detalhada do servidor
export function buildServerDescription(
  selectedComponents: { [key: string]: ComponentOption }
): string {
  const parts = [];
  
  // Adicionar CPU
  if (selectedComponents.cpu) {
    parts.push(`Processador ${selectedComponents.cpu.name}`);
  }
  
  // Adicionar memória
  if (selectedComponents.memory) {
    parts.push(`${selectedComponents.memory.name}`);
  }
  
  // Adicionar sistema operacional
  if (selectedComponents.os) {
    parts.push(`${selectedComponents.os.name}`);
  }
  
  // Se não houver componentes selecionados, retornar descrição padrão
  if (parts.length === 0) {
    return "Servidor dedicado personalizado com configuração avançada";
  }
  
  return parts.join(", ") + ".";
}
