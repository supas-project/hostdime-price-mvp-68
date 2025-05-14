
import { PDFDocument, PDFPage, PDFFont } from 'pdf-lib';
import { COLOR } from '../colors';
import { drawHeader } from '../drawing-utils';
import { QuoteVariables, getQuoteVariables } from '../dynamic-variables';
import { drawTextCell } from '../drawing-utils/text';

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
  // Get dynamic variables
  const quoteVars = getQuoteVariables(variables);
  
  // Draw the header with improved HostDime branding
  let currentY = height - 40;
  currentY = await drawHeader(pdfDoc, page, width, currentY, helveticaBold);
  
  // Generate quote number with structured format
  const today = new Date();
  const monthYear = `${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getFullYear()}`;
  const randomPart = Math.floor(Math.random() * 90000) + 10000;
  const quoteNumber = `HD-${randomPart}-${monthYear}`;
  
  // Create an elegant quote info box
  page.drawRectangle({
    x: width - marginX - 200,
    y: height - 140,
    width: 190,
    height: 115,
    color: COLOR.HIGHLIGHT,
    borderColor: COLOR.PRIMARY_LIGHT,
    borderWidth: 1,
    opacity: 0.95,
    borderOpacity: 0.7
  });
  
  // Draw quote header with proper HostDime branding
  drawTextCell(
    page,
    `Cotação #${quoteNumber}`,
    width - marginX - 190,
    height - 30,
    180,
    helveticaBold,
    12,
    COLOR.PRIMARY,
    'left'
  );
  
  // Draw customer info fields with improved spacing and alignment
  const infoFields = [
    { label: "Data:", value: quoteVars.dataEmissao || today.toLocaleDateString('pt-BR') },
    { label: "Responsável:", value: quoteVars.responsavelComercial },
    { label: "Cliente:", value: quoteVars.clientName },
    { label: "Validade:", value: quoteVars.dataValidade },
    { label: "Contato:", value: quoteVars.numeroContato }
  ];
  
  let infoY = height - 45;
  const labelX = width - marginX - 190;
  const valueX = width - marginX - 105;
  
  infoFields.forEach((field, index) => {
    // Draw the label
    page.drawText(field.label, {
      x: labelX,
      y: infoY - (index * 15),
      size: 10,
      font: helveticaBold,
      color: COLOR.TEXT
    });
    
    // Draw the value
    page.drawText(field.value, {
      x: valueX,
      y: infoY - (index * 15),
      size: 10,
      font: helvetica,
      color: COLOR.TEXT
    });
  });
  
  return { currentY: currentY - 20, quoteNumber };
}
