
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
  // Configuracao inicial
  const marginRight = width - marginX;
  let currentY = height - 50;
  
  // Desenhar cabecalho - atualizado para o novo estilo
  currentY = await drawHeader(pdfDoc, page, width, currentY, helveticaBold);
  
  // Adicionar titulo da cotacao e data no formato do novo design
  const quoteBox: QuoteBoxDimensions = {
    x: marginRight - 320,
    y: currentY + 20,
    width: 300,
    height: 110
  };
  
  // Desenhar caixa de informacao da cotação com o novo estilo
  drawHighlightBox(
    page,
    quoteBox.x,
    quoteBox.y,
    quoteBox.width,
    quoteBox.height,
    COLOR.WHITE,
    COLOR.PRIMARY
  );
  
  // Adicionar barra laranja no topo da caixa
  page.drawRectangle({
    x: quoteBox.x,
    y: quoteBox.y,
    width: quoteBox.width,
    height: 4,
    color: COLOR.PRIMARY,
    borderWidth: 0
  });
  
  // Adicionar título PROPOSTA COMERCIAL
  page.drawText("PROPOSTA COMERCIAL", {
    x: quoteBox.x + 15,
    y: quoteBox.y - 30,
    size: 18,
    font: helveticaBold,
    color: COLOR.SECONDARY
  });
  
  // Adicionar data com layout moderno
  const date = new Date();
  const monthNames = [
    "Janeiro", "Fevereiro", "Marco", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  const formattedDate = `${date.getDate()} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`;
  
  // Quadrado colorido para data
  page.drawRectangle({
    x: quoteBox.x + 15,
    y: quoteBox.y - 45,
    width: 8,
    height: 8,
    color: COLOR.PRIMARY,
    opacity: 0.8
  });
  
  page.drawText(`Data: ${formattedDate}`, {
    x: quoteBox.x + 30,
    y: quoteBox.y - 45,
    size: 11,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  // Adicionar numero da cotacao com destaque
  const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;
  
  // Quadrado colorido para número da cotação
  page.drawRectangle({
    x: quoteBox.x + 15,
    y: quoteBox.y - 70,
    width: 8,
    height: 8,
    color: COLOR.ACCENT,
    opacity: 0.8
  });
  
  page.drawText(`Cotacao: ${quoteNumber}`, {
    x: quoteBox.x + 30,
    y: quoteBox.y - 70,
    size: 11,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  // Borda da página no novo estilo
  page.drawRectangle({
    x: 0,
    y: currentY + 80,
    width: width,
    height: 4,
    color: COLOR.PRIMARY,
    borderWidth: 0
  });
  
  return { currentY, quoteNumber };
}
