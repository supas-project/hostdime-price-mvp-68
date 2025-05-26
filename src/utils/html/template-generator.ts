import { QuoteVariables } from "@/utils/pdf/dynamic-variables";
import { formatCurrency } from "@/utils/number-formatter";
import { quoteStyles } from "./quote-styles";
import { hostDimeSvgLogoUrl } from "../pdf-assets";
import { ComponentOption } from "@/types/component";

// Função para obter o texto da duração do contrato
function getContractDurationText(contractComponent: ComponentOption): string {
  const subtype = contractComponent.subtype || "0";
  
  if (subtype === "0") {
    return "Sem contrato";
  }
  
  return `${subtype} meses`;
}

// Função para gerar o template HTML da cotação
export function generateQuoteTemplate(
  componentsRows: string,
  storageRows: string,
  connectivityRows: string,
  customServicesRows: string,
  total: number,
  margin: number,
  quoteVariables?: Partial<QuoteVariables>,
  selectedComponents?: { [key: string]: ComponentOption }
): string {
  // Gerar número de cotação único
  const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;
  
  // Obter a data atual formatada
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Verificar se existe contrato selecionado
  const contractComponent = selectedComponents?.contract || selectedComponents?.contrato;
  const contractDuration = contractComponent ? getContractDurationText(contractComponent) : "Não especificado";
  const contractDiscount = contractComponent?.metadata?.discount || 0;

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
        
        /* Estilos para campos editáveis */
        .editable-field {
          border: 1px solid transparent;
          padding: 2px 4px;
          border-radius: 3px;
          transition: all 0.2s ease;
          cursor: pointer;
          display: inline-block;
          min-width: 60px;
        }
        .editable-field:hover {
          background-color: #f0f8ff;
          border-color: #FF6600;
        }
        .editable-field:focus {
          outline: none;
          background-color: white;
          border-color: #FF6600;
          box-shadow: 0 0 3px rgba(255, 102, 0, 0.3);
        }
        .edit-controls {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border: 2px solid #FF6600;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          max-width: 300px;
        }
        .edit-controls h4 {
          margin: 0 0 10px 0;
          color: #FF6600;
          font-size: 14px;
          font-weight: bold;
        }
        .edit-controls p {
          margin: 0 0 10px 0;
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }
        .edit-controls button {
          background: #FF6600;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          margin-right: 8px;
        }
        .edit-controls button:hover {
          background: #e55a00;
        }
        .margin-control {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #eee;
        }
        .margin-control label {
          font-size: 12px;
          color: #333;
          display: block;
          margin-bottom: 5px;
        }
        .margin-control input[type="range"] {
          width: 100%;
          margin-bottom: 5px;
        }
        .margin-display {
          font-size: 11px;
          color: #666;
          text-align: center;
        }
        .editable-textarea {
          border: 1px solid transparent;
          padding: 4px 6px;
          border-radius: 3px;
          transition: all 0.2s ease;
          cursor: pointer;
          width: 100%;
          min-height: 60px;
          resize: vertical;
          font-family: inherit;
          font-size: inherit;
        }
        .editable-textarea:hover {
          background-color: #f0f8ff;
          border-color: #FF6600;
        }
        .editable-textarea:focus {
          outline: none;
          background-color: white;
          border-color: #FF6600;
          box-shadow: 0 0 3px rgba(255, 102, 0, 0.3);
        }
      </style>
    </head>
    <body>
      <!-- Controles de Edição -->
      <div class="edit-controls">
        <h4>🎯 Edição Ativa</h4>
        <p>Clique nos campos destacados para editá-los diretamente na cotação.</p>
        <button onclick="window.print()">🖨️ Imprimir</button>
        <button onclick="exportToPDF()">📄 Salvar PDF</button>
        
        <div class="margin-control">
          <label for="marginSlider">Margem de Lucro:</label>
          <input type="range" id="marginSlider" min="0" max="100" value="${margin}" onchange="updateMargin(this.value)">
          <div class="margin-display" id="marginDisplay">${margin}%</div>
        </div>
      </div>

      <div class="container">
        <div class="header">
          <img src="${hostDimeSvgLogoUrl}" alt="HostDime logo">
          <h1>Proposta Comercial</h1>
          <p>Cotação #${quoteNumber}</p>
        </div>
        
        <div class="quote-info">
          <div class="quote-info-item">
            <div class="quote-info-label">Data de emissão:</div>
            <div><span class="editable-field" contenteditable="true" data-field="dataEmissao">${quoteVariables?.dataEmissao || currentDate}</span></div>
          </div>
          
          <div class="quote-info-item">
            <div class="quote-info-label">Validade:</div>
            <div><span class="editable-field" contenteditable="true" data-field="dataValidade">${quoteVariables?.dataValidade || '30 dias'}</span></div>
          </div>
          
          <div class="quote-info-item">
            <div class="quote-info-label">Responsável comercial:</div>
            <div><span class="editable-field" contenteditable="true" data-field="responsavelComercial">${quoteVariables?.responsavelComercial || 'Equipe Comercial HostDime'}</span></div>
          </div>
          
          <div class="quote-info-item">
            <div class="quote-info-label">Cliente:</div>
            <div><span class="editable-field" contenteditable="true" data-field="clientName">${quoteVariables?.clientName || 'Cliente'}</span></div>
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
          <h3>Contrato <span class="badge">${contractDuration}</span></h3>
          <p>${contractComponent?.description || 'Contrato personalizado'}</p>
          <ul class="info-list">
            ${contractDiscount > 0 ? `<li><span class="check-icon">✓</span> Desconto de ${contractDiscount}% incluído</li>` : ''}
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
          <p class="total" id="totalPrice">Total Mensal: ${formatCurrency(total)}</p>
          <p id="marginInfo">${margin > 0 ? `*Incluindo ${margin}% de margem` : ''}</p>
        </div>
        
        <div style="margin-top: 30px;">
          <h3>Observações</h3>
          <textarea class="editable-textarea" data-field="observacoes" placeholder="Clique aqui para adicionar observações personalizadas...">${quoteVariables?.observacoes || ''}</textarea>
        </div>
        
        <div class="footer">
          <p>Para mais informações entre em contato:</p>
          <p>Telefone: <span class="editable-field" contenteditable="true" data-field="numeroContato">${quoteVariables?.numeroContato || '(11) 4766-4840'}</span></p>
          <p>Email: <span class="editable-field" contenteditable="true" data-field="emailContato">${quoteVariables?.emailContato || 'vendas@hostdime.com.br'}</span></p>
          <p>&copy; ${new Date().getFullYear()} HostDime Brasil - Todos os direitos reservados</p>
        </div>
      </div>

      <script>
        // Variáveis globais para controle
        let originalTotal = ${total};
        let baseMargin = ${margin};
        
        // Função para atualizar margem
        function updateMargin(newMargin) {
          const marginValue = parseInt(newMargin);
          const marginMultiplier = (100 + marginValue) / (100 + baseMargin);
          const newTotal = originalTotal * marginMultiplier;
          
          document.getElementById('totalPrice').textContent = 'Total Mensal: ' + formatCurrencyJS(newTotal);
          document.getElementById('marginDisplay').textContent = marginValue + '%';
          document.getElementById('marginInfo').textContent = marginValue > 0 ? '*Incluindo ' + marginValue + '% de margem' : '';
        }
        
        // Função para formatar moeda em JavaScript
        function formatCurrencyJS(value) {
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(value);
        }
        
        // Função para exportar PDF (placeholder)
        function exportToPDF() {
          // Remove os controles antes de imprimir
          const controls = document.querySelector('.edit-controls');
          controls.style.display = 'none';
          
          // Usa a função de impressão do navegador
          window.print();
          
          // Restaura os controles
          setTimeout(() => {
            controls.style.display = 'block';
          }, 1000);
        }
        
        // Auto-save quando campos são editados
        document.addEventListener('input', function(e) {
          if (e.target.classList.contains('editable-field') || e.target.classList.contains('editable-textarea')) {
            console.log('Campo editado:', e.target.dataset.field, '=', e.target.textContent || e.target.value);
          }
        });
        
        // Melhorar experiência dos campos editáveis
        document.addEventListener('DOMContentLoaded', function() {
          const editableFields = document.querySelectorAll('.editable-field, .editable-textarea');
          
          editableFields.forEach(field => {
            field.addEventListener('focus', function() {
              this.style.backgroundColor = 'white';
            });
            
            field.addEventListener('blur', function() {
              this.style.backgroundColor = '';
            });
          });
        });
      </script>
    </body>
    </html>
  `;
}
