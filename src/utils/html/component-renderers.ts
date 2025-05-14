
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/utils/number-formatter";

// Função para converter componentes para HTML de tabela
export function generateComponentsRows(components: { [key: string]: ComponentOption }): string {
  if (!components || Object.keys(components).length === 0) {
    return '<tr><td colspan="3">Nenhum componente selecionado</td></tr>';
  }

  return Object.entries(components)
    .filter(([_, component]) => component && component.price !== undefined && !['DataCenter', 'Contrato'].includes(component.type))
    .map(([_, component]) => `
      <tr>
        <td>${component.type}</td>
        <td>${component.name}</td>
        <td>${formatCurrency(component.price)}</td>
      </tr>
    `).join('');
}

// Função para gerar HTML para o storage
export function generateStorageRows(internalStorage: ComponentOption[], externalStorage: ComponentOption[]): string {
  let html = '';

  // Internal storage
  if (internalStorage && internalStorage.length > 0) {
    internalStorage.forEach(disk => {
      if (disk && disk.price !== undefined) {
        html += `
          <tr>
            <td>Armazenamento interno</td>
            <td>${disk.name}</td>
            <td>${formatCurrency(disk.price)}</td>
          </tr>
        `;
      }
    });
  }

  // External storage
  if (externalStorage && externalStorage.length > 0) {
    externalStorage.forEach(disk => {
      if (disk && disk.price !== undefined) {
        html += `
          <tr>
            <td>Armazenamento externo</td>
            <td>${disk.name}</td>
            <td>${formatCurrency(disk.price)}</td>
          </tr>
        `;
      }
    });
  }

  return html || '<tr><td colspan="3">Nenhum armazenamento selecionado</td></tr>';
}

// Função para gerar conectividade HTML
export function generateConnectivityRows(connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } }): string {
  if (!connectivityItems || Object.keys(connectivityItems).length === 0) {
    return '';
  }

  return Object.entries(connectivityItems)
    .filter(([_, item]) => item && item.option && item.option.price !== undefined)
    .map(([_, item]) => `
      <tr>
        <td>Conectividade</td>
        <td>${item.option.name} x ${item.quantity}</td>
        <td>${formatCurrency(item.option.price * item.quantity)}</td>
      </tr>
    `).join('');
}

// Função para gerar HTML para serviços personalizados
export function generateCustomServicesRows(customServices: ComponentOption[]): string {
  if (!customServices || customServices.length === 0) {
    return '';
  }

  return customServices.map(service => `
    <tr>
      <td>Serviço personalizado</td>
      <td>${service.name}</td>
      <td>${formatCurrency(service.price)}</td>
    </tr>
  `).join('');
}
