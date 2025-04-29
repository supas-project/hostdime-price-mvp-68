
import { PDFDocument, PDFFont, PDFPage } from "pdf-lib";
import { ComponentOption } from "@/types/component";
import { COLOR } from "../colors";
import { checkAndCreateNewPage, drawSectionHeader, drawTableRow } from "../drawing-utils";
import { formatCurrency } from "@/lib/utils";
import { PageContext } from "../types";

export function renderComponentsSection(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  selectedComponents: { [key: string]: ComponentOption },
  width: number,
  marginX: number,
  marginRight: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
  helveticaOblique: PDFFont,
): PageContext {
  let { page, y: currentY } = pageContext;
  
  // Hardware Configuration Section
  currentY = drawSectionHeader(
    page, 
    "1. Configuração de Hardware", 
    marginX, 
    currentY, 
    300,
    helveticaBold
  );
  
  // Regular Components Section
  let rowAlt = false;
  Object.values(selectedComponents).forEach(component => {
    // Skip storage components as they will be handled separately
    if (component.type === "Armazenamento") return;
    
    // Check if we need a new page
    const result = checkAndCreateNewPage(pdfDoc, page, currentY, 150, marginX, 50, helvetica);
    page = result.page;
    currentY = result.y;
    
    // Draw alternating row background
    drawTableRow(page, marginX - 5, currentY + 5, width - (marginX * 2) + 10, 20 + 
      (component.description ? 18 : 0) + 
      (component.specs ? component.specs.length * 14 + 5 : 0) + 
      (component.metadata?.features ? component.metadata.features.length * 14 + 5 : 0),
      rowAlt
    );
    rowAlt = !rowAlt;
    
    // Component name and price
    page.drawText(component.name, {
      x: marginX,
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: COLOR.TEXT
    });
    
    if (component.type !== "DataCenter" && component.type !== "Contrato") {
      const price = formatCurrency(component.price);
      page.drawText(price, {
        x: marginRight - helvetica.widthOfTextAtSize(price, 12),
        y: currentY,
        size: 12,
        font: helvetica,
        color: COLOR.TEXT
      });
    } else {
      page.drawText("Incluído", {
        x: marginRight - helvetica.widthOfTextAtSize("Incluído", 12),
        y: currentY,
        size: 12,
        font: helvetica,
        color: COLOR.TEXT_LIGHT
      });
    }
    
    currentY -= 18;
    
    // Description
    if (component.description) {
      page.drawText(component.description, {
        x: marginX + 15,
        y: currentY,
        size: 10,
        font: helveticaOblique,
        color: COLOR.TEXT_LIGHT
      });
      currentY -= 15;
    }
    
    // Specifications
    if (component.specs) {
      component.specs.forEach(spec => {
        page.drawText(`• ${spec}`, {
          x: marginX + 20,
          y: currentY,
          size: 10,
          font: helvetica,
          color: COLOR.TEXT_LIGHT
        });
        currentY -= 14;
      });
    }
    
    // If component has features, highlight them
    if (component.metadata?.features && component.metadata.features.length > 0) {
      currentY -= 5;
      component.metadata.features.forEach(feature => {
        page.drawText(`> ${feature}`, {
          x: marginX + 20,
          y: currentY,
          size: 10,
          font: helveticaBold,
          color: COLOR.PRIMARY
        });
        currentY -= 14;
      });
    }
    
    currentY -= 10;
  });
  
  return { page, y: currentY };
}
