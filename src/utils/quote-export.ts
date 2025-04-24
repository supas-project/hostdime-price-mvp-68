
import html2pdf from 'html2pdf.js';
import { ComponentOption } from "@/data/server-components";
import { formatCurrency } from "@/lib/utils";

export const generateQuotePDF = async (
  selectedComponents: { [key: string]: ComponentOption },
  margin: number
) => {
  const subtotal = Object.values(selectedComponents).reduce(
    (sum, component) => sum + component.price,
    0
  );
  
  const profit = (subtotal * margin) / 100;
  const total = subtotal + profit;

  const content = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f58220;">Cotação de Servidor Dedicado</h1>
        <p style="color: #666;">Data: ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e1e1e; border-bottom: 2px solid #f58220; padding-bottom: 10px;">
          Especificações Técnicas
        </h2>
        <ul style="list-style-type: none; padding: 0;">
          ${Object.values(selectedComponents)
            .map(
              (component) =>
                `<li style="margin-bottom: 10px; color: #444;">
                  <strong>${component.name}</strong> - ${component.description}
                  ${
                    component.specs
                      ? `<ul style="margin-top: 5px; padding-left: 20px;">
                          ${component.specs
                            .map(
                              (spec) =>
                                `<li style="color: #666; margin-bottom: 3px;">• ${spec}</li>`
                            )
                            .join('')}
                        </ul>`
                      : ''
                  }
                </li>`
            )
            .join('')}
        </ul>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e1e1e; border-bottom: 2px solid #f58220; padding-bottom: 10px;">
          Resumo Financeiro
        </h2>
        <div style="margin-top: 20px;">
          <p style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #666;">
            <span>Subtotal:</span>
            <strong>${formatCurrency(subtotal)}</strong>
          </p>
          <p style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #666;">
            <span>Margem (${margin}%):</span>
            <strong style="color: #f58220;">${formatCurrency(profit)}</strong>
          </p>
          <p style="display: flex; justify-content: space-between; margin-top: 20px; font-size: 1.2em;">
            <strong>Total Mensal:</strong>
            <strong style="color: #f58220;">${formatCurrency(total)}</strong>
          </p>
        </div>
      </div>

      <div style="text-align: center; color: #666; margin-top: 40px; font-size: 0.9em;">
        <p>Para mais informações, entre em contato com nossa equipe.</p>
        <p>HostDime Brasil - Soluções em Hospedagem</p>
      </div>
    </div>
  `;

  const opt = {
    margin: 10,
    filename: `cotacao-servidor-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const element = document.createElement('div');
  element.innerHTML = content;
  document.body.appendChild(element);

  try {
    await html2pdf().from(element).set(opt).save();
  } finally {
    document.body.removeChild(element);
  }
};

