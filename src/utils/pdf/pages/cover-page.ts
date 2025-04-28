
import { PDFPage, PDFFont, PDFDocument } from 'pdf-lib';
import { PDFColors, PDFConfig } from '../constants';
import { drawFooter } from '../utils';

export function addCoverPage(page: PDFPage, boldFont: PDFFont, font: PDFFont, pdfDoc: PDFDocument) {
  const { width, height } = page.getSize();
  
  // Fundo laranja gradiente
  page.drawRectangle({
    x: 0,
    y: height * 0.5,
    width: width,
    height: height * 0.5,
    color: PDFColors.primary
  });

  // Logo e título
  page.drawText("HostDime", {
    x: width / 2 - 100,
    y: height * 0.7,
    size: PDFConfig.fontSize.title,
    font: boldFont,
    color: PDFColors.white
  });

  page.drawText("PROPOSTA COMERCIAL", {
    x: width / 2 - 120,
    y: height * 0.6,
    size: PDFConfig.fontSize.subtitle,
    font: boldFont,
    color: PDFColors.white
  });

  // Data
  const today = new Date().toLocaleDateString('pt-BR');
  page.drawText(`Data: ${today}`, {
    x: PDFConfig.margins.default,
    y: height * 0.45,
    size: PDFConfig.fontSize.body,
    font,
    color: PDFColors.text
  });

  // Slogan
  page.drawText("ABRA ESPAÇO PARA A INOVAÇÃO", {
    x: width / 2 - 150,
    y: height * 0.2,
    size: PDFConfig.fontSize.subtitle,
    font: boldFont,
    color: PDFColors.primary
  });

  // Linha decorativa
  page.drawLine({
    start: { x: PDFConfig.margins.default, y: height * 0.15 },
    end: { x: width - PDFConfig.margins.default, y: height * 0.15 },
    thickness: 2,
    color: PDFColors.primary
  });

  drawFooter(page, width, font);
  
  return page;
}
