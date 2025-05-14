
import { PDFDocument, PDFPage, RGB } from 'pdf-lib';
import { COLOR } from '../colors';
import { PageContext } from '../types';

// Enhanced highlight box with more subtle styling
export const drawHighlightBox = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB = COLOR.HIGHLIGHT,
  borderColor: RGB = COLOR.PRIMARY_LIGHT,
  borderWidth: number = 1,
  borderOpacity: number = 0.5
) => {
  // Add solid background with subtle border
  page.drawRectangle({
    x: x,
    y: y - height,
    width: width,
    height: height,
    color: color,
    borderColor: borderColor,
    borderWidth: borderWidth,
    opacity: 0.95,
    borderOpacity: borderOpacity
  });
};

// Enhanced separator with gradient-like effect
export const drawSeparator = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  opacity: number = 0.7
) => {
  // Draw main separator line
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 1,
    color: COLOR.PRIMARY_LIGHT,
    opacity: opacity
  });
  
  // Draw subtle shadow effect (slight offset)
  page.drawLine({
    start: { x, y: y - 1 },
    end: { x: x + width, y: y - 1 },
    thickness: 1,
    color: COLOR.ACCENT,
    opacity: opacity / 3
  });
};

// Enhanced table row drawing with subtle hover effect
export const drawTableRow = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  isAlternate: boolean = false,
  isHighlighted: boolean = false
) => {
  if (isHighlighted) {
    // Highlighted row (for totals or important items)
    page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      color: COLOR.PRIMARY_LIGHT,
      borderWidth: 0,
      opacity: 0.15
    });
  } else if (isAlternate) {
    // Alternate row with very subtle background
    page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      color: COLOR.TABLE_ROW_ALT,
      borderWidth: 0
    });
  } else {
    // Regular row with almost white background
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

// New function to draw table header with proper styling
export const drawTableHeader = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  // Draw header background
  page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    color: COLOR.SECONDARY,
    borderWidth: 0,
    opacity: 0.9
  });
  
  // Add subtle orange accent
  page.drawRectangle({
    x,
    y: y,
    width,
    height: 2,
    color: COLOR.PRIMARY,
    borderWidth: 0
  });
};

// Function to draw a progress/status indicator (for payment status, etc)
export const drawProgressIndicator = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  progress: number, // 0.0 to 1.0
  height: number = 6,
  backgroundColor: RGB = COLOR.ACCENT,
  progressColor: RGB = COLOR.PRIMARY
) => {
  // Ensure progress is between 0 and 1
  const safeProgress = Math.max(0, Math.min(1, progress));
  
  // Draw background track
  page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    color: backgroundColor,
    borderWidth: 0,
    opacity: 0.3
  });
  
  // Draw progress fill
  if (safeProgress > 0) {
    page.drawRectangle({
      x,
      y: y - height,
      width: width * safeProgress,
      height,
      color: progressColor,
      borderWidth: 0
    });
  }
};
