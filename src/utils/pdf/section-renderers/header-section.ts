import { PDFDocument, PDFPage, PDFFont } from 'pdf-lib';
import { COLOR } from '../colors';
import { drawHeader } from '../drawing-utils';

export async function renderHeaderSection(
  pdfDoc: PDFDocument,
  page: PDFPage,
  width: number,
  height: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
  marginX: number
): Promise<{ currentY: number; quoteNumber: string }> {
  // 1. Draw the header
  let currentY = height - 40;
  currentY = await drawHeader(pdfDoc, page, width, currentY, helveticaBold);
  
  // 2. Generate and display quote number
  const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;
  page.drawText(`Cotação #${quoteNumber}`, {
    x: width - marginX - 150,
    y: height - 30,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT_LIGHT
  });
  
  // 3. Display date
  const today = new Date();
  const dateString = today.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  page.drawText(`Data: ${dateString}`, {
    x: width - marginX - 150,
    y: height - 45,
    size: 10,
    font: helvetica,
    color: COLOR.TEXT_LIGHT
  });
  
  return { currentY, quoteNumber };
}
