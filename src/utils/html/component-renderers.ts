
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/utils/number-formatter";

// Função para converter componentes para HTML de tabela
export function generateComponentsRows(components: { [key: string]: ComponentOption }): string {
  if (!components || Object.keys(components).length === 0) {
    return '<tr><td colspan="3">Nenhum componente selecionado</td></tr>';
  }

  return Object.entries(components)
    .filter(([_, component]) => component && component.price !== undefined && !['DataCenter', 'Contrato'].includes(component.type))
    .map(([_, component]) => {
      // Generate specs list HTML if specs are available
      let specsHtml = '';
      if (component.specs && component.specs.length > 0) {
        specsHtml = `
          <div class="specs-list">
            <ul>
              ${component.specs.map(spec => `<li><span class="check-icon">✓</span> ${spec}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      return `
        <tr>
          <td>${component.type}</td>
          <td>
            <div class="component-name">${component.name}</div>
            <div class="component-description">${component.description || ''}</div>
            ${specsHtml}
          </td>
          <td>${formatCurrency(component.price)}</td>
        </tr>
      `;
    }).join('');
}

// Função para gerar HTML para o storage
export function generateStorageRows(internalStorage: ComponentOption[], externalStorage: ComponentOption[]): string {
  let html = '';

  // Internal storage
  if (internalStorage && internalStorage.length > 0) {
    internalStorage.forEach(disk => {
      if (disk && disk.price !== undefined) {
        let specsHtml = '';
        if (disk.specs && disk.specs.length > 0) {
          specsHtml = `
            <div class="specs-list">
              <ul>
                ${disk.specs.map(spec => `<li><span class="check-icon">✓</span> ${spec}</li>`).join('')}
              </ul>
            </div>
          `;
        }
        
        // Add RAID information if available
        if (disk.metadata?.raid) {
          const raid = disk.metadata.raid;
          specsHtml += `
            <div class="specs-list">
              <ul>
                <li><span class="check-icon">✓</span> Capacidade Total: ${raid.totalCapacity}GB</li>
                <li><span class="check-icon">✓</span> Capacidade Útil: ${raid.usableCapacity}GB</li>
                <li><span class="check-icon">✓</span> RAID: ${raid.type !== 'none' ? raid.type : 'Sem RAID'}</li>
                <li><span class="check-icon">✓</span> Tipo RAID: ${raid.isHardware ? 'Hardware' : 'Software'}</li>
                <li><span class="check-icon">✓</span> Proteção: ${raid.protection}</li>
              </ul>
            </div>
          `;
        }

        const quantity = disk.metadata?.quantity && disk.metadata.quantity > 1 ? `${disk.metadata.quantity}x ` : '';

        html += `
          <tr>
            <td>Armazenamento interno</td>
            <td>
              <div class="component-name">${quantity}${disk.name}</div>
              <div class="component-description">${disk.description || ''}</div>
              ${specsHtml}
            </td>
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
        let specsHtml = '';
        if (disk.specs && disk.specs.length > 0) {
          specsHtml = `
            <div class="specs-list">
              <ul>
                ${disk.specs.map(spec => `<li><span class="check-icon">✓</span> ${spec}</li>`).join('')}
              </ul>
            </div>
          `;
        }

        html += `
          <tr>
            <td>Armazenamento externo</td>
            <td>
              <div class="component-name">${disk.name}</div>
              <div class="component-description">${disk.description || ''}</div>
              ${specsHtml}
            </td>
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
    .map(([_, item]) => {
      const { option, quantity } = item;
      
      let specsHtml = '';
      if (option.specs && option.specs.length > 0) {
        specsHtml = `
          <div class="specs-list">
            <ul>
              ${option.specs.map(spec => `<li><span class="check-icon">✓</span> ${spec}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      return `
        <tr>
          <td>Conectividade</td>
          <td>
            <div class="component-name">${option.name}${quantity > 1 ? ` x ${quantity}` : ''}</div>
            <div class="component-description">${option.description || ''}</div>
            ${specsHtml}
          </td>
          <td>${formatCurrency(option.price * quantity)}</td>
        </tr>
      `;
    }).join('');
}

// Função para gerar HTML para serviços personalizados
export function generateCustomServicesRows(customServices: ComponentOption[]): string {
  if (!customServices || customServices.length === 0) {
    return '';
  }

  return customServices.map(service => {
    let specsHtml = '';
    if (service.specs && service.specs.length > 0) {
      specsHtml = `
        <div class="specs-list">
          <ul>
            ${service.specs.map(spec => `<li><span class="check-icon">✓</span> ${spec}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    return `
      <tr>
        <td>Serviço personalizado</td>
        <td>
          <div class="component-name">${service.name}</div>
          <div class="component-description">${service.description || ''}</div>
          ${specsHtml}
        </td>
        <td>${formatCurrency(service.price)}</td>
      </tr>
    `;
  }).join('');
}
