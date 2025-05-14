
import { PDFDocument, PDFPage, PDFFont } from 'pdf-lib';
import { COLOR } from '../colors';
import { drawHeader } from '../drawing-utils';
import { QuoteVariables, getQuoteVariables } from '../dynamic-variables';

export async function renderHeaderSection(
  pdfDoc: PDFDocument,
  page: PDFPage,
  width: number,
  height: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
  marginX: number,
  variables?: Partial<QuoteVariables>
): Promise<{ currentY: number; quoteNumber: string }> {
  // Obter variáveis dinâmicas
  const quoteVars = getQuoteVariables(variables);
  
  // 1. Draw the header
  let currentY = height - 40;
  currentY = await drawHeader(pdfDoc, page, width, currentY, helveticaBold);
  
  // 2. Generate and display quote number
  const today = new Date();
  const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${today.getFullYear()}`;
  
  page.drawText(`Cotação #${quoteNumber}`, {
    x: width - marginX - 150,
    y: height - 30,
    size: 12,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  // 3. Display date with better formatting
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
  
  // Adicionar responsável comercial
  page.drawText(`Responsável: ${quoteVars.responsavelComercial}`, {
    x: width - marginX - 150,
    y: height - 60,
    size: 10,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  // Adicionar cliente
  page.drawText(`Cliente: ${quoteVars.clientName}`, {
    x: width - marginX - 150,
    y: height - 75,
    size: 10,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  // Adicionar data de validade
  page.drawText(`Validade: ${quoteVars.dataValidade}`, {
    x: width - marginX - 150,
    y: height - 90,
    size: 10,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  return { currentY: currentY - 20, quoteNumber };
}
