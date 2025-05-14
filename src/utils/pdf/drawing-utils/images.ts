
import { PDFDocument, PDFImage, PDFPage, PDFFont } from 'pdf-lib';
import { hostDimeLogoBase64 } from '../../pdf-assets';

export async function embeddedImage(doc: PDFDocument, base64Image: string) {
  try {
    // Better error handling to avoid document breaking
    if (!base64Image || base64Image.trim() === '') {
      console.warn("Base64 image is empty");
      return null;
    }
    
    // Try to embed as JPG or PNG with enhanced error handling
    try {
      return await doc.embedJpg(base64Image);
    } catch (jpgError) {
      return await doc.embedPng(base64Image);
    }
  } catch (error) {
    console.error("Error embedding image:", error);
    return null;
  }
}

export async function embedHostDimeLogo(doc: PDFDocument) {
  try {
    return await embeddedImage(doc, hostDimeLogoBase64);
  } catch (error) {
    console.error("Failed to embed HostDime logo:", error);
    return null;
  }
}

export async function embedCustomerLogo(doc: PDFDocument, logoBase64?: string) {
  if (!logoBase64) {
    return null;
  }
  
  try {
    return await embeddedImage(doc, logoBase64);
  } catch (error) {
    console.error("Failed to embed customer logo:", error);
    return null;
  }
}

export function calculateImageDimensions(
  originalWidth: number, 
  originalHeight: number, 
  maxWidth: number, 
  maxHeight: number
) {
  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight;
  
  // Start with maximum dimensions
  let width = maxWidth;
  let height = maxHeight;
  
  // Adjust dimensions to maintain aspect ratio
  if (width / height > aspectRatio) {
    // Height is the limiting factor
    width = height * aspectRatio;
  } else {
    // Width is the limiting factor
    height = width / aspectRatio;
  }
  
  return { width, height };
}

// Enhanced function to embed and draw images with robust error handling
export async function embedAndDrawImage(
  pdfDoc: PDFDocument,
  page: PDFPage, 
  imageBytes: Uint8Array,
  dimensions: { x: number, y: number, width: number, height: number },
  fallbackText: string,
  font: PDFFont
) {
  try {
    // Check for valid image data
    if (!imageBytes || imageBytes.length === 0) {
      throw new Error("Image data is empty");
    }
    
    // Try to embed the image with multiple format support
    let image;
    try {
      image = await pdfDoc.embedJpg(imageBytes);
    } catch (jpgError) {
      try {
        image = await pdfDoc.embedPng(imageBytes);
      } catch (pngError) {
        throw new Error("Failed to embed as JPG or PNG");
      }
    }
    
    // If we have a valid image, draw it
    page.drawImage(image, {
      x: dimensions.x,
      y: dimensions.y - dimensions.height,
      width: dimensions.width,
      height: dimensions.height
    });
    
    return true;
  } catch (error) {
    console.error("Failed to embed image:", error);
    
    // Fallback: draw text instead
    page.drawText(fallbackText, {
      x: dimensions.x,
      y: dimensions.y - dimensions.height / 2,
      font,
      size: 14
    });
    
    return false;
  }
}
