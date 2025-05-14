
import { PDFPage, PDFFont, RGB } from 'pdf-lib';
import { COLOR } from '../colors';
import { drawWrappedText } from './text';

// Enhanced section header with improved HostDime branding
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
    // Draw background with HostDime styling
    page.drawRectangle({
      x: x - 5,
      y: y - 5,
      width: width,
      height: size + 10,
      color: COLOR.HIGHLIGHT,
      borderWidth: 0,
    });
    
    // Add accent bar with HostDime orange
    page.drawRectangle({
      x: x - 5,
      y: y - 5,
      width: 4,
      height: size + 10,
      color: COLOR.PRIMARY,
      borderWidth: 0,
    });
  }
  
  // Draw the section title
  page.drawText(text, {
    x: x,
    y: y,
    size: size,
    font: boldFont,
    color: color
  });
  
  return y - (size + 20); // Return new Y position after the header
};

// Enhanced subsection header with HostDime styling
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
  // Draw a subtle bottom border with HostDime accent
  page.drawLine({
    start: { x, y: y - size - 5 },
    end: { x: x + width - 10, y: y - size - 5 },
    thickness: 1,
    color: COLOR.PRIMARY,
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

// Enhanced text section with improved typography
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
  titleColor: RGB = COLOR.PRIMARY,
  contentColor: RGB = COLOR.TEXT
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
