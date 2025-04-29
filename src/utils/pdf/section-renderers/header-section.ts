
import { PDFDocument, PDFFont, PDFPage } from 'pdf-lib';
import { COLOR } from '../colors';
import { drawHeader, drawHighlightBox } from '../drawing-utils';
import { QuoteBoxDimensions } from '../types';

export async function renderHeaderSection(
  pdfDoc: PDFDocument,
  page: PDFPage,
  width: number, 
  height: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
  marginX: number
): Promise<{ currentY: number, quoteNumber: string }> {
  // Configuração inicial
  const marginRight = width - marginX;
  let currentY = height - 50;
  
  // Desenhar cabeçalho
  currentY = await drawHeader(pdfDoc, page, width, currentY, helveticaBold);
  
  // Adicionar título da cotação e data em um formato elegante
  const quoteBox: QuoteBoxDimensions = {
    x: marginRight - 250,
    y: currentY + 20,
    width: 230,
    height: 80
  };
  
  // Desenhar caixa de informação da cotação
  drawHighlightBox(
    page,
    quoteBox.x,
    quoteBox.y,
    quoteBox.width,
    quoteBox.height,
    COLOR.BACKGROUND
  );
  
  // Adicionar título
  page.drawText("PROPOSTA COMERCIAL", {
    x: quoteBox.x + 10,
    y: quoteBox.y - 25,
    size: 16,
    font: helveticaBold,
    color: COLOR.SECONDARY
  });
  
  // Adicionar data (sem acentos)
  const date = new Date();
  const monthNames = [
    "Janeiro", "Fevereiro", "Marco", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  const formattedDate = `${date.getDate()} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`;
  
  page.drawText(`Data: ${formattedDate}`, {
    x: quoteBox.x + 10,
    y: quoteBox.y - 45,
    size: 10,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  // Adicionar número da cotação
  const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;
  page.drawText(`Cotacao: ${quoteNumber}`, {
    x: quoteBox.x + 10,
    y: quoteBox.y - 60,
    size: 10,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  // Desenhar borda ao redor do documento
  page.drawRectangle({
    x: marginX - 10,
    y: 40,
    width: width - (marginX * 2) + 20,
    height: height - 80,
    borderColor: COLOR.PRIMARY,
    borderWidth: 0.7,
    opacity: 0.15,
    color: COLOR.WHITE
  });
  
  return { currentY, quoteNumber };
}
