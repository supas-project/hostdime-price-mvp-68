
import { PDFDocument, PDFFont, PDFPage } from "pdf-lib";
import { ComponentOption } from "@/types/component";
import { COLOR } from "../colors";
import { checkAndCreateNewPage, drawSectionHeader, drawTableRow, drawTableHeader } from "../drawing-utils";
import { formatCurrency } from "@/lib/utils";
import { PageContext } from "../types";

function renderComponentDetails(
  page: PDFPage,
  component: ComponentOption,
  x: number,
  y: number,
  helvetica: PDFFont,
  helveticaOblique: PDFFont
): number {
  let currentY = y;
  
  if (component.description) {
    page.drawText(component.description, {
      x: x + 15,
      y: currentY,
      size: 10,
      font: helveticaOblique,
      color: COLOR.TEXT_LIGHT
    });
    currentY -= 15;
  }
  
  if (component.specs) {
    component.specs.forEach(spec => {
      page.drawText(`• ${spec}`, {
        x: x + 15,
        y: currentY,
        size: 10,
        font: helvetica,
        color: COLOR.TEXT_LIGHT
      });
      currentY -= 14;
    });
  }
  
  return currentY;
}

export function renderComponentsSection(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  selectedComponents: { [key: string]: ComponentOption },
  width: number,
  marginX: number,
  marginRight: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
  helveticaOblique: PDFFont
): PageContext {
  let { page, y: currentY } = pageContext;
  
  // Filter out null or undefined components
  const validComponents = Object.values(selectedComponents).filter(component => component != null) as ComponentOption[];
  
  // Return early if no components are selected
  if (validComponents.length === 0) {
    return { page, y: currentY };
  }
  
  // Check if we need to add a new page
  const componentsCheck = checkAndCreateNewPage(pdfDoc, page, currentY, 300, marginX, 50, helvetica);
  page = componentsCheck.page;
  currentY = componentsCheck.y;
  
  // Add section header with HostDime styling
  currentY = drawSectionHeader(
    page, 
    "Componentes do Servidor", 
    marginX, 
    currentY, 
    300,
    helveticaBold,
    16,
    COLOR.PRIMARY
  );
  
  // Draw table header with HostDime styling
  drawTableHeader(
    page,
    marginX - 5,
    currentY - 5,
    width - (marginX * 2) + 10,
    25
  );
  
  // CORREÇÃO: Ajuste na posição do cabeçalho da tabela para melhorar alinhamento
  page.drawText("Componente", {
    x: marginX + 5,
    y: currentY - 20,
    size: 12,
    font: helveticaBold,
    color: COLOR.WHITE
  });
  
  // CORREÇÃO: Ajuste na palavra "Valor" para melhor alinhamento com o valor monetário
  page.drawText("Valor", {
    x: marginRight - helveticaBold.widthOfTextAtSize("Valor", 12) - 10,
    y: currentY - 20,
    size: 12,
    font: helveticaBold,
    color: COLOR.WHITE
  });
  
  currentY -= 35;
  
  // Draw component rows with alternating background
  let rowAlt = false;
  validComponents.forEach(component => {
    // Calculate row height based on content
    const rowHeight = 20 + 
      (component.description ? 15 : 0) + 
      (component.specs ? component.specs.length * 14 : 0);
    
    drawTableRow(page, marginX - 5, currentY + 5, width - (marginX * 2) + 10, rowHeight, rowAlt);
    rowAlt = !rowAlt;
    
    // Draw component name
    page.drawText(component.name, {
      x: marginX,
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: COLOR.TEXT
    });
    
    // CORREÇÃO: Verificar que o preço não é zero antes de formatar e exibir
    // e melhorar o alinhamento do valor
    let price = "R$ 0,00";
    if (component.price && component.price > 0) {
      price = formatCurrency(component.price);
    }
    
    page.drawText(price, {
      x: marginRight - helvetica.widthOfTextAtSize(price, 12) - 5, // Melhor alinhamento
      y: currentY,
      size: 12,
      font: helvetica,
      color: COLOR.PRIMARY
    });
    
    currentY -= 20;
    
    // Render component details
    currentY = renderComponentDetails(page, component, marginX, currentY, helvetica, helveticaOblique);
    
    currentY -= 10;
  });
  
  return { page, y: currentY };
}
