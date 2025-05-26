
import { PDFDocument, PDFFont } from "pdf-lib";
import { ComponentOption } from "@/types/component";
import { COLOR } from "../../colors";
import { checkAndCreateNewPage, drawTableRow } from "../../drawing-utils";
import { formatCurrency } from "@/lib/utils";
import { PageContext } from "../../types";

export function renderExternalStorage(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  externalStorage: ComponentOption[],
  width: number,
  marginX: number,
  marginRight: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont
): PageContext {
  let { page, y: currentY } = pageContext;
  
  // Return early if no external storage items
  if (externalStorage.length === 0) {
    return { page, y: currentY };
  }
  
  // Check if we need a new page
  const result = checkAndCreateNewPage(pdfDoc, page, currentY, 200, marginX, 50, helvetica);
  page = result.page;
  currentY = result.y;
  
  // Adicionar cabecalho da secao
  page.drawText("2.2 Storage Externo:", {
    x: marginX,
    y: currentY,
    size: 12,
    font: helveticaBold,
    color: COLOR.SECONDARY
  });
  
  currentY -= 20;
  
  let rowAlt = false;
  externalStorage.forEach(storage => {
    // Draw alternating row background
    const rowHeight = 20 + 
      (storage.description ? 15 : 0) + 
      (storage.specs ? storage.specs.length * 14 : 0);
    
    drawTableRow(page, marginX + 10, currentY + 5, width - (marginX * 2) - 20, rowHeight, rowAlt);
    rowAlt = !rowAlt;
    
    page.drawText(storage.name, {
      x: marginX + 15,
      y: currentY,
      size: 12,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    const price = formatCurrency(storage.price);
    page.drawText(price, {
      x: marginRight - helvetica.widthOfTextAtSize(price, 12),
      y: currentY,
      size: 12,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    currentY -= 20;
    
    if (storage.description) {
      page.drawText(storage.description, {
        x: marginX + 30,
        y: currentY,
        size: 10,
        font: helvetica,
        color: COLOR.TEXT_LIGHT
      });
      currentY -= 15;
    }
    
    if (storage.specs) {
      storage.specs.forEach(spec => {
        page.drawText(`* ${spec}`, {
          x: marginX + 30,
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
