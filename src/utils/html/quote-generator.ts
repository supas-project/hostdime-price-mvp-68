
import { ComponentOption } from "@/types/component";
import { QuoteVariables } from "@/utils/pdf/dynamic-variables";
import { formatCurrency as formatCurrencyUtil } from "@/utils/number-formatter";

// Função para converter componentes para HTML de tabela
function generateComponentsRows(components: { [key: string]: ComponentOption }): string {
  if (!components || Object.keys(components).length === 0) {
    return '<tr><td colspan="3">Nenhum componente selecionado</td></tr>';
  }

  return Object.entries(components)
    .filter(([_, component]) => component && component.price !== undefined && !['DataCenter', 'Contrato'].includes(component.type))
    .map(([_, component]) => `
      <tr>
        <td>${component.type}</td>
        <td>${component.name}</td>
        <td>${formatCurrencyUtil(component.price)}</td>
      </tr>
    `).join('');
}

// Função para gerar HTML para o storage
function generateStorageRows(internalStorage: ComponentOption[], externalStorage: ComponentOption[]): string {
  let html = '';

  // Internal storage
  if (internalStorage && internalStorage.length > 0) {
    internalStorage.forEach(disk => {
      if (disk && disk.price !== undefined) {
        html += `
          <tr>
            <td>Armazenamento interno</td>
            <td>${disk.name}</td>
            <td>${formatCurrencyUtil(disk.price)}</td>
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
            <td>${formatCurrencyUtil(disk.price)}</td>
          </tr>
        `;
      }
    });
  }

  return html || '<tr><td colspan="3">Nenhum armazenamento selecionado</td></tr>';
}

// Função para gerar conectividade HTML
function generateConnectivityRows(connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } }): string {
  if (!connectivityItems || Object.keys(connectivityItems).length === 0) {
    return '';
  }

  return Object.entries(connectivityItems)
    .filter(([_, item]) => item && item.option && item.option.price !== undefined)
    .map(([_, item]) => `
      <tr>
        <td>Conectividade</td>
        <td>${item.option.name} x ${item.quantity}</td>
        <td>${formatCurrencyUtil(item.option.price * item.quantity)}</td>
      </tr>
    `).join('');
}

// Função para gerar HTML para serviços personalizados
function generateCustomServicesRows(customServices: ComponentOption[]): string {
  if (!customServices || customServices.length === 0) {
    return '';
  }

  return customServices.map(service => `
    <tr>
      <td>Serviço personalizado</td>
      <td>${service.name}</td>
      <td>${formatCurrencyUtil(service.price)}</td>
    </tr>
  `).join('');
}

// Função principal para gerar HTML da cotação
export function generateQuoteHTML(
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  quoteVariables?: Partial<QuoteVariables>
): string {
  // Calcular o valor total
  let total = 0;

  // Adicionar componentes padrão
  Object.values(selectedComponents)
    .filter(component => component && component.price !== undefined && !['DataCenter', 'Contrato'].includes(component.type))
    .forEach(component => {
      total += component.price || 0;
    });

  // Adicionar armazenamento interno
  storageItems.internal.forEach(disk => {
    if (disk && disk.price) {
      total += disk.price;
    }
  });

  // Adicionar armazenamento externo
  storageItems.external.forEach(disk => {
    if (disk && disk.price) {
      total += disk.price;
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

  // Gerar número de cotação único
  const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;
  
  // Obter a data atual formatada
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Montar HTML completo
  return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cotação HostDime #${quoteNumber}</title>
      <style>
        /* Estilos gerais */
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
          color: #333;
          line-height: 1.6;
        }
        
        h1, h2, h3 {
          color: #FF6600; /* Cor principal HostDime */
          margin: 10px 0;
        }
        
        .container {
          max-width: 800px;
          margin: auto;
          padding: 20px;
          background-color: #fff;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .header img {
          max-width: 250px;
          margin: 0 auto 15px;
          display: block;
        }
        
        .quote-info {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          margin: 20px 0;
        }
        
        .quote-info-item {
          flex: 1;
          min-width: 200px;
          margin-bottom: 15px;
        }
        
        .quote-info-label {
          font-weight: bold;
          margin-bottom: 5px;
          color: #FF6600;
        }
        
        .table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        .table th, .table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        .table th {
          background-color: #FF6600;
          color: #fff;
        }
        
        .table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .table tr:hover {
          background-color: #f5f5f5;
        }
        
        .total-section {
          margin: 30px 0;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          border-left: 4px solid #FF6600;
        }
        
        .total {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin-bottom: 0;
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
        
        .observations {
          margin: 20px 0;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
          .container {
            padding: 15px;
          }
          
          .table th, .table td {
            padding: 8px;
            font-size: 14px;
          }
          
          .total {
            font-size: 18px;
          }
          
          .quote-info-item {
            flex: 0 0 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="data:image/png;base64,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" alt="HostDime logo">
          <h1>Proposta Comercial</h1>
          <p>Cotação #${quoteNumber}</p>
        </div>
        
        <div class="quote-info">
          <div class="quote-info-item">
            <div class="quote-info-label">Data de emissão:</div>
            <div>${quoteVariables?.dataEmissao || currentDate}</div>
          </div>
          
          <div class="quote-info-item">
            <div class="quote-info-label">Validade:</div>
            <div>${quoteVariables?.dataValidade || '30 dias'}</div>
          </div>
          
          <div class="quote-info-item">
            <div class="quote-info-label">Responsável comercial:</div>
            <div>${quoteVariables?.responsavelComercial || 'Equipe Comercial HostDime'}</div>
          </div>
          
          <div class="quote-info-item">
            <div class="quote-info-label">Cliente:</div>
            <div>${quoteVariables?.clientName || 'Cliente'}</div>
          </div>
        </div>
        
        <h2>Resumo Executivo</h2>
        <p>Agradecemos seu interesse nos serviços da HostDime Brasil. Apresentamos a seguir 
        uma proposta personalizada para atender às suas necessidades de infraestrutura, com servidores 
        de alta performance e total suporte técnico.</p>
        
        <h2>Componentes do Servidor</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Preço</th>
            </tr>
          </thead>
          <tbody>
            ${generateComponentsRows(selectedComponents)}
            ${generateStorageRows(storageItems.internal, storageItems.external)}
            ${generateConnectivityRows(connectivityItems)}
            ${generateCustomServicesRows(customServices)}
          </tbody>
        </table>
        
        <div class="total-section">
          <h2>Resumo Financeiro</h2>
          <p class="total">Total Mensal: ${formatCurrencyUtil(total)}</p>
          ${margin > 0 ? `<p>*Incluindo ${margin}% de margem</p>` : ''}
        </div>
        
        ${quoteVariables?.observacoes ? `
          <div class="observations">
            <h3>Observações</h3>
            <p>${quoteVariables.observacoes}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Para mais informações entre em contato:</p>
          <p>Telefone: ${quoteVariables?.numeroContato || '(11) 4766-4840'}</p>
          <p>Email: ${quoteVariables?.emailContato || 'vendas@hostdime.com.br'}</p>
          <p>&copy; ${new Date().getFullYear()} HostDime Brasil - Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Função para abrir a cotação em uma nova aba
export function openQuoteInNewTab(
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  quoteVariables?: Partial<QuoteVariables>
): void {
  try {
    // Gera o HTML da cotação
    const htmlContent = generateQuoteHTML(
      selectedComponents,
      storageItems,
      customServices,
      margin,
      connectivityItems,
      quoteVariables
    );
    
    // Abre uma nova aba
    const newTab = window.open('', '_blank');
    
    if (!newTab) {
      throw new Error('Não foi possível abrir uma nova aba. Verifique se o navegador está bloqueando popups.');
    }
    
    // Escreve o conteúdo HTML na nova aba
    newTab.document.write(htmlContent);
    newTab.document.close();
    
  } catch (error) {
    console.error('Erro ao abrir cotação em nova aba:', error);
    throw error;
  }
}

