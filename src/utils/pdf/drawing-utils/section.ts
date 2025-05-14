
import { PDFPage, PDFFont, RGB } from 'pdf-lib';
import { COLOR } from '../colors';
import { drawWrappedText } from './text';

// Enhanced section header with improved styling
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
    // Draw background with a subtle gradient-like effect
    page.drawRectangle({
      x: x - 5,
      y: y - 5,
      width: width,
      height: size + 10,
      color: COLOR.HIGHLIGHT,
      borderWidth: 0,
    });
    
    // Add a subtle orange line on the left for visual separation
    page.drawRectangle({
      x: x - 5,
      y: y - 5,
      width: 3,
      height: size + 10,
      color: COLOR.PRIMARY,
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

// New function to draw a subsection header with different styling
export const drawSubsectionHeader = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  width: number,
  boldFont: PDFFont,
  size: number = 14,
  color: RGB = COLOR.SECONDARY
): number => {
  // Draw a subtle bottom border
  page.drawLine({
    start: { x, y: y - size - 5 },
    end: { x: x + width - 10, y: y - size - 5 },
    thickness: 1,
    color: COLOR.ACCENT,
    opacity: 0.5
  });
  
  // Draw the text
  page.drawText(text, {
    x,
    y,
    size,
    font: boldFont,
    color
  });
  
  return y - (size + 15);
};

// Function to draw a section with long text that may need wrapping
export const drawTextSection = (
  page: PDFPage,
  title: string,
  content: string,
  x: number,
  y: number,
  width: number,
  boldFont: PDFFont,
  regularFont: PDFFont,
  titleSize: number = 12,
  contentSize: number = 10,
  titleColor: RGB = COLOR.TEXT,
  contentColor: RGB = COLOR.TEXT_LIGHT
): number => {
  // Draw the title
  page.drawText(title, {
    x,
    y,
    size: titleSize,
    font: boldFont,
    color: titleColor
  });
  
  // Draw the content with word wrapping
  const newY = drawWrappedText(
    page,
    content,
    x,
    y - titleSize - 5,
    width - x,
    regularFont,
    contentSize,
    contentColor
  );
  
  return newY - 10;
};
