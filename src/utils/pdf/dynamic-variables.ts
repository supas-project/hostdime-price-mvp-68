
import { ComponentOption } from "@/types/component";

export interface QuoteVariables {
  responsavelComercial: string;
  clientName: string;
  dataValidade: string;
  observacoes: string;
  dataEmissao: string;
  numeroContato: string;
  emailContato: string;
}

export function getQuoteVariables(variables?: Partial<QuoteVariables>): QuoteVariables {
  return {
    responsavelComercial: variables?.responsavelComercial || "Equipe Comercial",
    clientName: variables?.clientName || "Cliente",
    dataValidade: variables?.dataValidade || "30 dias",
    observacoes: variables?.observacoes || "",
    dataEmissao: variables?.dataEmissao || new Date().toLocaleDateString('pt-BR'),
    numeroContato: variables?.numeroContato || "(11) 4766-4840",
    emailContato: variables?.emailContato || "vendas@hostdime.com.br"
  };
}

export function calculateTotalValue(
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  margin: number
) {
  // Calcular subtotal dos componentes
  let subtotal = 0;
  
  // Componentes principais
  for (const key in selectedComponents) {
    if (selectedComponents[key]) {
      subtotal += selectedComponents[key].price || 0;
    }
  }
  
  // Armazenamento interno
  storageItems.internal.forEach(item => {
    subtotal += item.price || 0;
  });
  
  // Armazenamento externo
  storageItems.external.forEach(item => {
    subtotal += item.price || 0;
  });
  
  // Serviços personalizados
  customServices.forEach(service => {
    subtotal += service.price || 0;
  });
  
  // Itens de conectividade
  for (const key in connectivityItems) {
    if (connectivityItems[key]) {
      subtotal += (connectivityItems[key].option.price || 0) * connectivityItems[key].quantity;
    }
  }
  
  // Aplicar margem
  const total = subtotal * (1 + (margin / 100));
  
  return { subtotal, total };
}

// Formatar valores monetários
export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}
