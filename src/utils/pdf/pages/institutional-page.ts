
import { PDFPage, PDFFont, PDFDocument } from 'pdf-lib';
import { PDFColors, PDFConfig } from '../constants';
import { drawFooter, wrapText, embedPageBackground, drawPositionedText } from '../utils';

export async function addInstitutionalPage(page: PDFPage, boldFont: PDFFont, font: PDFFont, pdfDoc: PDFDocument) {
  const { width, height } = page.getSize();
  const margin = PDFConfig.margins.default;
  
  // Adicionar imagem de fundo institucional
  await embedPageBackground(pdfDoc, page, PDFConfig.templates.pages.institutional, {
    stretch: true,
    opacity: 1
  });
  
  // Título da página - posicionado especificamente para o template
  drawPositionedText(
    page,
    "Quem Somos",
    margin,
    height - margin,
    boldFont,
    PDFConfig.fontSize.title,
    {
      color: PDFColors.primary
    }
  );
  
  // Texto institucional
  const institutionalText = "A HostDime é uma empresa global de data center e infraestrutura de nuvem com mais de 20 anos de experiência. Nossa missão é fornecer serviços de hospedagem e colocation de classe mundial com suporte técnico 24/7 em nossos data centers certificados.";
  
  // Posicionar abaixo do título, com largura controlada para caber no template
  const lines = wrapText(institutionalText, font, 11, width - 2 * margin);
  let currentY = height - margin - 40;
  
  for (const line of lines) {
    drawPositionedText(
      page,
      line,
      margin,
      currentY,
      font,
      11,
      {
        color: PDFColors.text
      }
    );
    currentY -= 20;
  }
  
  // Rodapé
  drawFooter(page, width, font);
  
  return page;
}
