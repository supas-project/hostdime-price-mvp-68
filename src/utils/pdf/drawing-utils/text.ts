
import { PDFPage, PDFFont, RGB } from 'pdf-lib';
import { COLOR } from '../colors';

// Draw text with proper word wrapping for long descriptions
export const drawWrappedText = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  font: PDFFont,
  fontSize: number = 10,
  color: RGB = COLOR.TEXT,
  lineHeight: number = 14
): number => {
  if (!text) return y;
  
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  for (const word of words) {
    const testLine = line ? line + ' ' + word : word;
    const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testLineWidth > maxWidth) {
      // Draw the current line
      page.drawText(line, {
        x,
        y: currentY,
        size: fontSize,
        font,
        color
      });
      
      // Move to the next line
      line = word;
      currentY -= lineHeight;
    } else {
      line = testLine;
    }
  }
  
  // Draw the last line
  if (line) {
    page.drawText(line, {
      x,
      y: currentY,
      size: fontSize,
      font,
      color
    });
    currentY -= lineHeight;
  }
  
  return currentY;
};

// Draw a text cell with alignment options (useful for tables)
export const drawTextCell = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  width: number,
  font: PDFFont,
  fontSize: number = 10,
  color: RGB = COLOR.TEXT,
  align: 'left' | 'right' | 'center' = 'left'
): void => {
  if (!text) return;
  
  let textX = x;
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  
  if (align === 'right') {
    textX = x + width - textWidth;
  } else if (align === 'center') {
    textX = x + (width - textWidth) / 2;
  }
  
  page.drawText(text, {
    x: textX,
    y,
    size: fontSize,
    font,
    color
  });
};
