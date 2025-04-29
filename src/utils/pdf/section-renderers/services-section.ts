
import { PDFDocument, PDFFont } from "pdf-lib";
import { ComponentOption } from "@/types/component";
import { COLOR } from "../colors";
import { checkAndCreateNewPage, drawSectionHeader, drawTableRow } from "../drawing-utils";
import { formatCurrency } from "@/lib/utils";
import { PageContext } from "../types";

export function renderServicesSection(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  customServices: ComponentOption[],
  width: number,
  marginX: number,
  marginRight: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
  helveticaOblique: PDFFont,
): PageContext {
  let { page, y: currentY } = pageContext;
  
  // Return early if no services
  if (customServices.length === 0) {
    return { page, y: currentY };
  }
  
  // Check if we need to add a new page
  const result = checkAndCreateNewPage(pdfDoc, page, currentY, 200, marginX, 50, helvetica);
  page = result.page;
  currentY = result.y;
  
  currentY = drawSectionHeader(
    page, 
    "3. Serviços Adicionais", 
    marginX, 
    currentY, 
    300,
    helveticaBold
  );
  
  let rowAlt = false;
  customServices.forEach(service => {
    // Draw alternating row background
    const rowHeight = 20 + 
      (service.description ? 15 : 0) + 
      (service.specs ? service.specs.length * 14 : 0);
    
    drawTableRow(page, marginX - 5, currentY + 5, width - (marginX * 2) + 10, rowHeight, rowAlt);
    rowAlt = !rowAlt;
    
    const quantity = service.metadata?.quantity || 1;
    const serviceText = quantity > 1 ? `${quantity}x ${service.name}` : service.name;
    
    page.drawText(serviceText, {
      x: marginX,
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: COLOR.TEXT
    });
    
    const price = formatCurrency(service.price);
    page.drawText(price, {
      x: marginRight - helvetica.widthOfTextAtSize(price, 12),
      y: currentY,
      size: 12,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    currentY -= 20;
    
    if (service.description) {
      page.drawText(service.description, {
        x: marginX + 15,
        y: currentY,
        size: 10,
        font: helveticaOblique,
        color: COLOR.TEXT_LIGHT
      });
      currentY -= 15;
    }
    
    if (service.specs) {
      service.specs.forEach(spec => {
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
    
    currentY -= 10;
  });
  
  return { page, y: currentY };
}
