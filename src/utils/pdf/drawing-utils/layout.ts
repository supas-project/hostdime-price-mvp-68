
import { PDFDocument, PDFPage, RGB } from 'pdf-lib';
import { COLOR } from '../colors';
import { PageContext } from '../types';

// Helper function to create a highlighted box for important information
export const drawHighlightBox = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB = COLOR.HIGHLIGHT,
  borderColor: RGB = COLOR.PRIMARY_LIGHT
) => {
  // Add solid background with border
  page.drawRectangle({
    x: x,
    y: y - height,
    width: width,
    height: height,
    color: color,
    borderColor: borderColor,
    borderWidth: 1,
    opacity: 0.95
  });
};

// Enhanced separator with new style
export const drawSeparator = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  opacity: number = 0.7
) => {
  // Draw simple line separator in the new style
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 1,
    color: COLOR.PRIMARY_LIGHT,
    opacity: opacity
  });
};

// Helper function to draw table rows with alternating colors - updated for new style
export const drawTableRow = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  isAlternate: boolean = false
) => {
  if (isAlternate) {
    page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      color: COLOR.TABLE_ROW_ALT,
      borderWidth: 0
    });
  } else {
    // Draw very subtle background for even rows
    page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      color: COLOR.WHITE,
      borderWidth: 0
    });
  }
};
