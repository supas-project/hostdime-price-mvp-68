
import { PDFDocument, PDFFont, rgb } from "pdf-lib";
import { ComponentOption } from "@/types/component";
import { COLOR } from "../../colors";
import { checkAndCreateNewPage, drawHighlightBox, drawTableRow } from "../../drawing-utils";
import { formatCurrency } from "@/lib/utils";
import { groupDisksByTypeAndCapacity } from "../../disk-utils";
import { PageContext } from "../../types";

export function renderInternalStorage(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  internalStorage: ComponentOption[],
  width: number,
  marginX: number,
  marginRight: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
  helveticaOblique: PDFFont
): PageContext {
  let { page, y: currentY } = pageContext;
  
  // Return early if no internal storage items
  if (internalStorage.length === 0) {
    return { page, y: currentY };
  }
  
  // Adicionar cabecalho da secao
  page.drawText("2.1 Discos Internos:", {
    x: marginX,
    y: currentY,
    size: 12,
    font: helveticaBold,
    color: COLOR.SECONDARY
  });
  
  currentY -= 20;
  
  const groupedDisks = groupDisksByTypeAndCapacity(internalStorage);
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
    
    // Nome e quantidade
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
    
    // Descricao e especificacoes
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
    
    // Configuracao RAID
    if (group.disk.metadata?.raid && group.disk.metadata.raid.type !== 'none') {
      // Adicionar um fundo destacado para a configuracao RAID
      drawHighlightBox(
        page,
        marginX + 25,
        currentY - 5,
        300,
        80,
        rgb(0.95, 0.95, 1.0), // Fundo azul claro
        rgb(0.7, 0.7, 0.9)     // Borda azul
      );
      
      currentY -= 15;
      page.drawText("Configuracao RAID:", {
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
        `Protecao: ${group.disk.metadata.raid.protection}`,
        `Capacidade util: ${group.disk.metadata.raid.usableCapacity}GB`
      ];
      
      raidInfo.forEach(info => {
        page.drawText(`* ${info}`, {
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
  
  return { page, y: currentY };
}
