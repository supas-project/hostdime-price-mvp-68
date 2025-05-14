
import { PDFDocument, PDFImage, PDFPage } from 'pdf-lib';
import { QuoteBoxDimensions } from '../types';

// Helper to safely embed and draw images with fallback
export const embedAndDrawImage = async (
  pdfDoc: PDFDocument,
  page: PDFPage,
  imageBytes: Uint8Array,
  dimensions: QuoteBoxDimensions,
  fallbackText?: string,
  fallbackFont?: any
): Promise<boolean> => {
  try {
    let image: PDFImage;
    
    // Determine image type and embed accordingly
    try {
      // Try as PNG first
      image = await pdfDoc.embedPng(imageBytes);
    } catch (error) {
      // Fall back to JPG if PNG fails
      try {
        image = await pdfDoc.embedJpg(imageBytes);
      } catch (jpgError) {
        throw new Error('Failed to embed image: Unsupported format');
      }
    }
    
    // Calculate aspect ratio and resize image while maintaining proportions
    const originalWidth = image.width;
    const originalHeight = image.height;
    const aspectRatio = originalWidth / originalHeight;
    
    let drawWidth = dimensions.width;
    let drawHeight = drawWidth / aspectRatio;
    
    // If height exceeds available space, recalculate dimensions
    if (drawHeight > dimensions.height) {
      drawHeight = dimensions.height;
      drawWidth = drawHeight * aspectRatio;
    }
    
    // Center the image in the allocated space
    const xOffset = (dimensions.width - drawWidth) / 2;
    const yOffset = (dimensions.height - drawHeight) / 2;
    
    page.drawImage(image, {
      x: dimensions.x + xOffset,
      y: dimensions.y - drawHeight + yOffset,
      width: drawWidth,
      height: drawHeight
    });
    
    return true;
  } catch (error) {
    console.error('Error embedding image:', error);
    
    // Draw fallback text if image fails and fallback is provided
    if (fallbackText && fallbackFont) {
      page.drawText(fallbackText, {
        x: dimensions.x + 10,
        y: dimensions.y - dimensions.height / 2,
        size: 12,
        font: fallbackFont
      });
    }
    
    return false;
  }
};
