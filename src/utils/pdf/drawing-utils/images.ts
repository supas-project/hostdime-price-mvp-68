
import { PDFDocument, PDFImage, PDFPage, PDFFont } from 'pdf-lib';
import { hostDimeLogoBase64 } from '../../pdf-assets';

export async function embeddedImage(doc: PDFDocument, base64Image: string) {
  try {
    // Here's the fix: Change embedJpeg to embedJpg
    const image = await doc.embedJpg(base64Image);
    return image;
  } catch (error) {
    console.error("Error embedding image:", error);
    throw new Error(`Failed to embed image: ${error}`);
  }
}

export async function embedHostDimeLogo(doc: PDFDocument) {
  try {
    return await embeddedImage(doc, hostDimeLogoBase64);
  } catch (error) {
    console.error("Failed to embed HostDime logo:", error);
    throw new Error("Could not embed company logo in document");
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
    // Don't throw here, just return null to continue without customer logo
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

// Adding the embedAndDrawImage function that was missing
export async function embedAndDrawImage(
  pdfDoc: PDFDocument,
  page: PDFPage, 
  imageBytes: Uint8Array,
  dimensions: { x: number, y: number, width: number, height: number },
  fallbackText: string,
  font: PDFFont
) {
  try {
    // Try to embed the image
    const image = await pdfDoc.embedJpg(imageBytes);
    
    // Draw it on the page
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
      size: 12
    });
    
    return false;
  }
}
