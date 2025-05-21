
import { ComponentOption } from "@/types/component";

// Função para calcular o valor total da cotação
export function calculateQuoteTotal(
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {}
): number {
  let total = 0;

  // Adicionar componentes padrão
  Object.values(selectedComponents)
    .filter(component => component && component.price !== undefined && !['DataCenter', 'Contrato'].includes(component.type))
    .forEach(component => {
      total += component.price || 0;
    });

  // Adicionar armazenamento interno - garantir uso do preço unitário * quantidade
  storageItems.internal.forEach(disk => {
    if (disk && disk.price) {
      const unitPrice = disk.metadata?.unitPrice || disk.price;
      const quantity = disk.metadata?.quantity || 1;
      total += unitPrice * quantity;
    }
  });

  // Adicionar armazenamento externo
  storageItems.external.forEach(disk => {
    if (disk && disk.price) {
      const unitPrice = disk.metadata?.unitPrice || disk.price;
      const quantity = disk.metadata?.quantity || 1;
      total += unitPrice * quantity;
    }
  });

  // Adicionar conectividade
  Object.values(connectivityItems).forEach(item => {
    if (item && item.option && item.option.price) {
      total += item.option.price * item.quantity;
    }
  });

  // Adicionar serviços personalizados
  customServices.forEach(service => {
    if (service && service.price) {
      total += service.price;
    }
  });

  // Aplicar margem
  if (margin > 0) {
    total = total * (1 + (margin / 100));
  }

  return total;
}
