
import { PDFPage, PDFFont, PDFDocument } from 'pdf-lib';
import { PDFColors, PDFConfig } from '../constants';
import { drawFooter, embedPageBackground, drawPositionedText } from '../utils';

export async function addDataCenterPage(page: PDFPage, boldFont: PDFFont, font: PDFFont, pdfDoc: PDFDocument) {
  const { width, height } = page.getSize();
  const margin = PDFConfig.margins.default;
  
  // Adicionar imagem de fundo do data center
  await embedPageBackground(pdfDoc, page, PDFConfig.templates.pages.datacenter, {
    stretch: true
  });
  
  // Título da página
  drawPositionedText(
    page, 
    "Nossos Data Centers", 
    margin, 
    height - margin,
    boldFont,
    24,
    { color: PDFColors.primary }
  );
  
  let currentY = height - margin - 40;
  
  // Data Center de João Pessoa
  drawPositionedText(
    page,
    "Data Center Nordeste - João Pessoa",
    margin,
    currentY,
    boldFont,
    18,
    { color: PDFColors.text }
  );
  
  currentY -= 30;
  
  const jpFeatures = [
    "Certificação Tier III",
    "5.000m² de área total",
    "1MW de capacidade energética",
    "Redundância N+1 em todos os sistemas",
    "Conectividade com múltiplos provedores",
    "Sistema contra incêndio com gás FM-200",
    "Segurança física 24x7"
  ];
  
  for (const feature of jpFeatures) {
    drawPositionedText(
      page,
      `• ${feature}`,
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
