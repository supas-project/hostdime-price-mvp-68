
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import { ComponentOption } from "@/types/component";
import { COLOR } from "../colors";
import { checkAndCreateNewPage, drawHighlightBox, drawSectionHeader, drawTableRow } from "../drawing-utils";
import { formatCurrency } from "@/lib/utils";
import { groupDisksByTypeAndCapacity } from "../disk-utils";
import { PageContext } from "../types";

export function renderStorageSection(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  width: number,
  marginX: number,
  marginRight: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
  helveticaOblique: PDFFont,
): PageContext {
  let { page, y: currentY } = pageContext;
  
  // Return early if no storage items
  if (storageItems.internal.length === 0 && storageItems.external.length === 0) {
    return { page, y: currentY };
  }
  
  // Check if we need to add a new page based on remaining space
  const storagePageCheck = checkAndCreateNewPage(pdfDoc, page, currentY, 300, marginX, 50, helvetica);
  page = storagePageCheck.page;
  currentY = storagePageCheck.y;
  
  currentY = drawSectionHeader(
    page, 
    "2. Soluções de Armazenamento", 
    marginX, 
    currentY, 
    300,
    helveticaBold
  );
  
  // Internal Storage
  if (storageItems.internal.length > 0) {
    page.drawText("2.1 Discos Internos:", {
      x: marginX,
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: COLOR.SECONDARY
    });
    
    currentY -= 20;
    
    const groupedDisks = groupDisksByTypeAndCapacity(storageItems.internal);
    
    let rowAlt = false;
    groupedDisks.forEach(group => {
      // Check if we need a new page
      const result = checkAndCreateNewPage(pdfDoc, page, currentY, 150, marginX, 50, helvetica);
      page = result.page;
      currentY = result.y;
      
      // Draw alternating row background
      const rowHeight = 20 + 
        (group.disk.description ? 15 : 0) + 
        (group.disk.specs ? group.disk.specs.length * 14 : 0) +
        (group.disk.metadata?.raid && group.disk.metadata.raid.type !== 'none' ? 80 : 0);
      
      drawTableRow(page, marginX + 10, currentY + 5, width - (marginX * 2) - 20, rowHeight, rowAlt);
      rowAlt = !rowAlt;
      
      // Name and quantity
      page.drawText(`${group.quantity}x ${group.disk.name}`, {
        x: marginX + 15,
        y: currentY,
        size: 12,
        font: helvetica,
        color: COLOR.TEXT
      });
      
      const price = formatCurrency(group.disk.price * group.quantity);
      page.drawText(price, {
        x: marginRight - helvetica.widthOfTextAtSize(price, 12),
        y: currentY,
        size: 12,
        font: helvetica,
        color: COLOR.TEXT
      });
      
      currentY -= 20;
      
      // Description and specs
      if (group.disk.description) {
        page.drawText(group.disk.description, {
          x: marginX + 30,
          y: currentY,
          size: 10,
          font: helveticaOblique,
          color: COLOR.TEXT_LIGHT
        });
        currentY -= 15;
      }
      
      if (group.disk.specs) {
        group.disk.specs.forEach(spec => {
          page.drawText(`• ${spec}`, {
            x: marginX + 30,
            y: currentY,
            size: 10,
            font: helvetica,
            color: COLOR.TEXT_LIGHT
          });
          currentY -= 14;
        });
      }
      
      // RAID Configuration
      if (group.disk.metadata?.raid && group.disk.metadata.raid.type !== 'none') {
        // Add a highlighted background for RAID configuration
        drawHighlightBox(
          page,
          marginX + 25,
          currentY - 5,
          300,
          80,
          rgb(0.95, 0.95, 1.0), // Light blue background
          rgb(0.7, 0.7, 0.9)     // Blue border
        );
        
        currentY -= 15;
        page.drawText("Configuração RAID:", {
          x: marginX + 30,
          y: currentY,
          size: 11,
          font: helveticaBold,
          color: COLOR.SECONDARY
        });
        currentY -= 18;
        
        const raidInfo = [
          `Tipo: RAID ${group.disk.metadata.raid.type}`,
          group.disk.metadata.raid.description,
          `Proteção: ${group.disk.metadata.raid.protection}`,
          `Capacidade útil: ${group.disk.metadata.raid.usableCapacity}GB`
        ];
        
        raidInfo.forEach(info => {
          page.drawText(`• ${info}`, {
            x: marginX + 35,
            y: currentY,
            size: 10,
            font: helvetica,
            color: COLOR.TEXT
          });
          currentY -= 14;
        });
        
        currentY -= 5;
      }
      
      currentY -= 10;
    });
  }
  
  // External Storage
  if (storageItems.external.length > 0) {
    // Check if we need a new page
    const result = checkAndCreateNewPage(pdfDoc, page, currentY, 200, marginX, 50, helvetica);
    page = result.page;
    currentY = result.y;
    
    page.drawText("2.2 Storage Externo:", {
      x: marginX,
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: COLOR.SECONDARY
    });
    
    currentY -= 20;
    
    let rowAlt = false;
    storageItems.external.forEach(storage => {
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
          font: helveticaOblique,
          color: COLOR.TEXT_LIGHT
        });
        currentY -= 15;
      }
      
      if (storage.specs) {
        storage.specs.forEach(spec => {
          page.drawText(`• ${spec}`, {
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
  }
  
  return { page, y: currentY };
}
