
import { PDFFont } from 'pdf-lib';
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

