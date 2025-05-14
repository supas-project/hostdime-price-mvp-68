
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
  
  // CORREÇÃO: Ajustar a posição e tamanho do box de informações para melhor alinhamento
  page.drawRectangle({
    x: width - marginX - 250, // Mais à esquerda para caber todo o conteúdo
    y: height - 130, // Ajuste de posição para não se sobrepor
    width: 240, // Aumentado para acomodar textos mais longos
    height: 120,
    color: COLOR.HIGHLIGHT,
    borderColor: COLOR.PRIMARY_LIGHT,
    borderWidth: 1,
    opacity: 0.95,
    borderOpacity: 0.7
  });
  
  // CORREÇÃO: Melhor posicionamento do número da cotação
  drawTextCell(
    page,
    `Cotação #${quoteNumber}`,
    width - marginX - 240, // Alinhado com o box
    height - 110, // Agora posicionado dentro do box
    230,
    helveticaBold,
    12,
    COLOR.PRIMARY,
    'left'
  );
  
  // CORREÇÃO: Melhor espaçamento e alinhamento dos campos de informação
  const infoFields = [
    { label: "Data:", value: quoteVars.dataEmissao || today.toLocaleDateString('pt-BR') },
    { label: "Responsável:", value: quoteVars.responsavelComercial },
    { label: "Cliente:", value: quoteVars.clientName },
    { label: "Validade:", value: quoteVars.dataValidade },
    { label: "Contato:", value: quoteVars.numeroContato }
  ];
  
  let infoY = height - 90; // Ajustado para começar após o título da cotação
  const labelX = width - marginX - 240; // Alinhado com o início do box
  const valueX = width - marginX - 150; // Posição para os valores
  
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
