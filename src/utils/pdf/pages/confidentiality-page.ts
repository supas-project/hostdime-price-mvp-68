import { PDFPage, PDFFont } from 'pdf-lib';
import { PDFColors, PDFConfig } from '../constants';
import { drawFooter, wrapText } from '../utils';

export function addConfidentialityPage(page: PDFPage, boldFont: PDFFont, font: PDFFont) {
  const { width, height } = page.getSize();
  const margin = PDFConfig.margins.default;
  let currentY = height - margin;
  
  // Título da página
  page.drawText("Acordo de Confidencialidade", {
    x: margin,
    y: currentY,
    size: 24,
    font: boldFont,
    color: PDFColors.primary
  });
  
  currentY -= 40;
  
  // Texto do acordo
  const confidentialityText = "Este documento contém informações confidenciais e proprietárias da HostDime Brasil. A divulgação, distribuição ou cópia deste documento sem autorização prévia é estritamente proibida. Este material destina-se apenas ao destinatário especificado. Se você recebeu este documento por engano, notifique-nos imediatamente.";
  
  const lines = wrapText(confidentialityText, font, 11, width - 2 * margin);
  for (const line of lines) {
    page.drawText(line, {
      x: margin,
      y: currentY,
      size: 11,
      font,
      color: PDFColors.text
    });
    currentY -= 20;
  }
  
  currentY -= 40;
  
  // Informações adicionais
  page.drawText("Informações Importantes", {
    x: margin,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PDFColors.primary
  });
  
  currentY -= 30;
  
  const additionalInfo = [
    "Os preços apresentados nesta proposta têm validade de 15 dias.",
    "Todos os valores estão em Reais (BRL) e incluem impostos aplicáveis.",
    "Esta proposta não constitui um contrato vinculativo até que seja aceita e assinada por ambas as partes.",
    "O SLA (Acordo de Nível de Serviço) está detalhado em documento separado."
  ];
  
  for (const info of additionalInfo) {
    page.drawText(`• ${info}`, {
      x: margin + 10,
      y: currentY,
      size: 11,
      font,
      color: PDFColors.text
    });
    currentY -= 20;
  }
  
  // Rodapé
  drawFooter(page, width, font);
}
