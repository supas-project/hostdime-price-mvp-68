
import { PDFPage, PDFFont, PDFDocument } from 'pdf-lib';
import { PDFColors, PDFConfig } from '../constants';
import { drawFooter, wrapText, embedPageBackground, drawPositionedText } from '../utils';

export async function addConfidentialityPage(page: PDFPage, boldFont: PDFFont, font: PDFFont, pdfDoc: PDFDocument) {
  const { width, height } = page.getSize();
  const margin = PDFConfig.margins.default;
  
  // Adicionar imagem de fundo
  await embedPageBackground(pdfDoc, page, PDFConfig.templates.pages.confidentiality, {
    stretch: true
  });
  
  // Título da página
  drawPositionedText(
    page,
    "Acordo de Confidencialidade",
    margin,
    height - margin,
    boldFont,
    24,
    { color: PDFColors.primary }
  );
  
  let currentY = height - margin - 40;
  
  // Texto do acordo
  const confidentialityText = "Este documento contém informações confidenciais e proprietárias da HostDime Brasil. A divulgação, distribuição ou cópia deste documento sem autorização prévia é estritamente proibida. Este material destina-se apenas ao destinatário especificado. Se você recebeu este documento por engano, notifique-nos imediatamente.";
  
  const lines = wrapText(confidentialityText, font, 11, width - 2 * margin);
  for (const line of lines) {
    drawPositionedText(
      page,
      line,
      margin,
      currentY,
      font,
      11,
      { color: PDFColors.text }
    );
    currentY -= 20;
  }
  
  currentY -= 40;
  
  // Informações adicionais
  drawPositionedText(
    page,
    "Informações Importantes",
    margin,
    currentY,
    boldFont,
    16,
    { color: PDFColors.primary }
  );
  
  currentY -= 30;
  
  const additionalInfo = [
    "Os preços apresentados nesta proposta têm validade de 15 dias.",
    "Todos os valores estão em Reais (BRL) e incluem impostos aplicáveis.",
    "Esta proposta não constitui um contrato vinculativo até que seja aceita e assinada por ambas as partes.",
    "O SLA (Acordo de Nível de Serviço) está detalhado em documento separado."
  ];
  
  for (const info of additionalInfo) {
    drawPositionedText(
      page,
      `• ${info}`,
      margin + 10,
      currentY,
      font,
      11,
      { color: PDFColors.text }
    );
    currentY -= 20;
  }
  
  // Rodapé
  drawFooter(page, width, font);
  
  return page;
}
