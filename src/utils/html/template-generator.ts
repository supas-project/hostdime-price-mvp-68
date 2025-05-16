
import { QuoteVariables } from "@/utils/pdf/dynamic-variables";
import { formatCurrency } from "@/utils/number-formatter";
import { quoteStyles } from "./quote-styles";
import { hostDimeSvgLogoUrl } from "../pdf-assets";

// Função para gerar o template HTML da cotação
export function generateQuoteTemplate(
  componentsRows: string,
  storageRows: string,
  connectivityRows: string,
  customServicesRows: string,
  total: number,
  margin: number,
  quoteVariables?: Partial<QuoteVariables>
): string {
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
        ${quoteStyles}
        /* Estilos adicionais para specs */
        .specs-list {
          margin-top: 5px;
        }
        .specs-list ul {
          list-style-type: none;
          padding-left: 5px;
          margin: 0;
        }
        .specs-list li {
          font-size: 12px;
          color: #555;
          margin-bottom: 3px;
          display: flex;
          align-items: center;
        }
        .component-name {
          font-weight: bold;
        }
        .component-description {
          font-size: 13px;
          color: #666;
          margin-top: 2px;
        }
        .check-icon {
          color: #FF6600;
          margin-right: 5px;
          font-weight: bold;
        }
        .datacenter-info, .contract-info {
          background-color: #f8f8f8;
          border-left: 4px solid #FF6600;
          padding: 10px 15px;
          margin-bottom: 15px;
          border-radius: 0 4px 4px 0;
        }
        .datacenter-info h3, .contract-info h3 {
          margin-top: 0;
          color: #FF6600;
          font-size: 16px;
          display: flex;
          align-items: center;
        }
        .badge {
          font-size: 11px;
          background-color: rgba(255, 102, 0, 0.1);
          color: #FF6600;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 8px;
          font-weight: normal;
        }
        .info-list {
          list-style-type: none;
          padding-left: 0;
          margin: 10px 0 0;
        }
        .info-list li {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #444;
          margin-bottom: 6px;
        }
        .table th {
          background-color: #FF6600;
          color: white;
          font-weight: bold;
          padding: 10px;
        }
        .table td {
          padding: 10px;
          vertical-align: top;
        }
        .header img {
          max-width: 200px;
          height: auto;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${hostDimeSvgLogoUrl}" alt="HostDime logo">
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
        
        <div class="datacenter-info">
          <h3>Data Center <span class="badge">Localização</span></h3>
          <p>Data center localizado no Nordeste do Brasil</p>
          <ul class="info-list">
            <li><span class="check-icon">✓</span> Certificação Tier III</li>
            <li><span class="check-icon">✓</span> Green Data Center</li>
            <li><span class="check-icon">✓</span> Baixa latência regional</li>
          </ul>
        </div>
        
        <div class="contract-info">
          <h3>Contrato <span class="badge">Duração</span></h3>
          <p>Contrato com desconto por fidelidade</p>
          <ul class="info-list">
            <li><span class="check-icon">✓</span> Desconto de 15% incluído</li>
          </ul>
        </div>
        
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
            ${componentsRows}
            ${storageRows}
            ${connectivityRows}
            ${customServicesRows}
          </tbody>
        </table>
        
        <div class="total-section">
          <h2>Resumo Financeiro</h2>
          <p class="total">Total Mensal: ${formatCurrency(total)}</p>
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
