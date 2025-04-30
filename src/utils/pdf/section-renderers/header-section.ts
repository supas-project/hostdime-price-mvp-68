
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
    height: 100 // Aumentando altura para melhor espaçamento
  };
  
  // Desenhar caixa de informação da cotação com estilo moderno e gradiente sutil
  drawHighlightBox(
    page,
    quoteBox.x,
    quoteBox.y,
    quoteBox.width,
    quoteBox.height,
    COLOR.BACKGROUND
  );
  
  // Adicionar destaque colorido na borda superior
  page.drawRectangle({
    x: quoteBox.x,
    y: quoteBox.y,
    width: quoteBox.width,
    height: 5,
    color: COLOR.PRIMARY,
    borderWidth: 0
  });
  
  // Adicionar título com estilo modernizado
  page.drawText("PROPOSTA COMERCIAL", {
    x: quoteBox.x + 15,
    y: quoteBox.y - 30,
    size: 18,
    font: helveticaBold,
    color: COLOR.SECONDARY
  });
  
  // Adicionar data (sem acentos) com layout moderno
  const date = new Date();
  const monthNames = [
    "Janeiro", "Fevereiro", "Marco", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  const formattedDate = `${date.getDate()} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`;
  
  // Desenhar ícone de calendário (simulado)
  page.drawRectangle({
    x: quoteBox.x + 15,
    y: quoteBox.y - 50,
    width: 10,
    height: 10,
    color: COLOR.PRIMARY,
    opacity: 0.8
  });
  
  page.drawText(`Data: ${formattedDate}`, {
    x: quoteBox.x + 35,
    y: quoteBox.y - 50,
    size: 11,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  // Adicionar número da cotação com destaque
  const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;
  
  // Desenhar ícone de documento (simulado)
  page.drawRectangle({
    x: quoteBox.x + 15,
    y: quoteBox.y - 75,
    width: 10,
    height: 10,
    color: COLOR.ACCENT,
    opacity: 0.8
  });
  
  page.drawText(`Cotacao: ${quoteNumber}`, {
    x: quoteBox.x + 35,
    y: quoteBox.y - 75,
    size: 11,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  // Desenhar borda decorativa ao redor do documento
  for (let i = 0; i < 3; i++) {
    const opacity = 0.15 - (i * 0.05);
    page.drawRectangle({
      x: marginX - 15 + i,
      y: 40 + i,
      width: width - (marginX * 2) + 30 - (i * 2),
      height: height - 80 - (i * 2),
      borderColor: COLOR.PRIMARY,
      borderWidth: 0.7,
      opacity: opacity,
      color: COLOR.WHITE
    });
  }
  
  return { currentY, quoteNumber };
}
