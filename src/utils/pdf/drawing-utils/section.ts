
import { PDFPage, PDFFont, RGB } from 'pdf-lib';
import { COLOR } from '../colors';

// Enhanced section header with new styling
export const drawSectionHeader = (
  page: PDFPage, 
  text: string,
  x: number,
  y: number,
  width: number,
  boldFont: PDFFont,
  size: number = 16,
  color: RGB = COLOR.PRIMARY,
  useHighlightStyle: boolean = true
): number => {
  if (useHighlightStyle) {
    // Draw background highlight in the new style - light orange background
    page.drawRectangle({
      x: x - 5,
      y: y - 5,
      width: width,
      height: size + 10,
      color: COLOR.HIGHLIGHT,
      borderWidth: 0,
    });
  }
  
  // Draw the actual text
  page.drawText(text, {
    x: x,
    y: y,
    size: size,
    font: boldFont,
    color: color
  });
  
  return y - (size + 20); // Return new Y position after the header
};
