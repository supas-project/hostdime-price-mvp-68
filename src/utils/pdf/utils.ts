import { PDFFont, PDFPage, RGB } from 'pdf-lib';
import { PDFColors } from './constants';

export function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const width = font.widthOfTextAtSize(`${currentLine} ${word}`.trim(), fontSize);
    
    if (width < maxWidth) {
      currentLine = `${currentLine} ${word}`.trim();
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

export function drawFooter(page: any, pageWidth: number, font: PDFFont) {
  const footerY = 30;
  
  // Linha separadora
  page.drawLine({
    start: { x: 50, y: footerY + 15 },
    end: { x: pageWidth - 50, y: footerY + 15 },
    thickness: 1,
    color: PDFColors.muted,
  });
  
  // Texto do rodapé
  page.drawText("HostDime Brasil | www.hostdime.com.br | 0800 200 8532", {
    x: pageWidth / 2 - 150,
    y: footerY,
    size: 9,
    font,
    color: PDFColors.muted,
  });
}

// Updated function for drawing boxes - removed borderRadius property
export function drawRoundedBox(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB,
  borderColor?: RGB,
  borderWidth: number = 1
) {
  // Draw the background rectangle
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color,
    borderColor,
    borderWidth
  });
  
  // Note: pdf-lib doesn't support borderRadius directly
  // To simulate rounded corners, we'd need to draw curves or multiple shapes
  // This is a simplified version without rounded corners
}

// Nova função para desenhar cabeçalhos de seção
export function drawSectionHeader(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  color: RGB = PDFColors.primary
) {
  page.drawText(text, {
    x,
    y,
    size: 16,
    font,
    color
  });
  
  // Linha decorativa abaixo do título
  page.drawLine({
    start: { x, y: y - 10 },
    end: { x: x + font.widthOfTextAtSize(text, 16) * 0.8, y: y - 10 },
    thickness: 2,
    color,
  });
}

// Função para desenhar listas com bullets
export function drawBulletList(
  page: PDFPage,
  items: string[],
  x: number,
  y: number,
  font: PDFFont,
  fontSize: number = 11,
  color: RGB = PDFColors.text,
  bulletIndent: number = 10,
  lineSpacing: number = 20
) {
  let currentY = y;
  
  for (const item of items) {
    // Desenhar o bullet
    page.drawText("•", {
      x,
      y: currentY,
      size: fontSize,
      font,
      color,
    });
    
    // Desenhar o texto do item
    page.drawText(item, {
      x: x + bulletIndent,
      y: currentY,
      size: fontSize,
      font,
      color,
    });
    
    currentY -= lineSpacing;
  }
  
  return currentY;
}

// Função para desenhar uma tabela simples
export function drawSimpleTable(
  page: PDFPage,
  headers: string[],
  rows: Array<string[]>,
  x: number,
  y: number,
  width: number,
  rowHeight: number,
  headerFont: PDFFont,
  bodyFont: PDFFont,
  fontSize: number = 10
) {
  const columnCount = headers.length;
  const columnWidth = width / columnCount;
  let currentY = y;
  
  // Desenhar cabeçalho
  page.drawRectangle({
    x,
    y: currentY - rowHeight,
    width,
    height: rowHeight,
    color: PDFColors.primary
  });
  
  headers.forEach((header, index) => {
    page.drawText(header, {
      x: x + (index * columnWidth) + 5,
      y: currentY - rowHeight/2 - 5,
      size: fontSize,
      font: headerFont,
      color: PDFColors.white
    });
  });
  
  currentY -= rowHeight;
  
  // Desenhar linhas
  let alternate = true;
  rows.forEach(row => {
    page.drawRectangle({
      x,
      y: currentY - rowHeight,
      width,
      height: rowHeight,
      color: alternate ? PDFColors.lightGray : PDFColors.white
    });
    
    row.forEach((cell, index) => {
      page.drawText(cell, {
        x: x + (index * columnWidth) + 5,
        y: currentY - rowHeight/2 - 5,
        size: fontSize,
        font: bodyFont,
        color: PDFColors.text
      });
    });
    
    currentY -= rowHeight;
    alternate = !alternate;
  });
  
  // Desenhar bordas da tabela
  page.drawRectangle({
    x,
    y: currentY,
    width,
    height: y - currentY,
    borderColor: PDFColors.muted,
    borderWidth: 1
  });
  
  // Desenhar linhas verticais
  for (let i = 1; i < columnCount; i++) {
    page.drawLine({
      start: { x: x + i * columnWidth, y },
      end: { x: x + i * columnWidth, y: currentY },
      thickness: 0.5,
      color: PDFColors.muted
    });
  }
  
  return currentY;
}
