
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
  
  // Seção de configuração de hardware com estilo atualizado
  currentY = drawSectionHeader(
    page, 
    "1. Configuracao de Hardware", 
    marginX, 
    currentY, 
    300,
    helveticaBold,
    16,
    COLOR.PRIMARY,
    true // Usar o novo estilo destacado
  );
  
  // Seção de componentes regulares
  let rowAlt = false;
  Object.values(selectedComponents).forEach(component => {
    // Ignorar componentes de armazenamento, serão tratados separadamente
    if (component.type === "Armazenamento") return;
    
    // Verificar se precisamos de uma nova página
    const result = checkAndCreateNewPage(pdfDoc, page, currentY, 150, marginX, 50, helvetica);
    page = result.page;
    currentY = result.y;
    
    // Desenhar fundo de linha alternado
    drawTableRow(page, marginX - 5, currentY + 5, width - (marginX * 2) + 10, 20 + 
      (component.description ? 18 : 0) + 
      (component.specs ? component.specs.length * 14 + 5 : 0) + 
      (component.metadata?.features ? component.metadata.features.length * 14 + 5 : 0),
      rowAlt
    );
    rowAlt = !rowAlt;
    
    // Nome do componente e preço
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
      page.drawText("Incluido", {
        x: marginRight - helvetica.widthOfTextAtSize("Incluido", 12),
        y: currentY,
        size: 12,
        font: helvetica,
        color: COLOR.TEXT_LIGHT
      });
    }
    
    currentY -= 18;
    
    // Descrição do componente
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
    
    // Especificações
    if (component.specs) {
      component.specs.forEach(spec => {
        page.drawText(`* ${spec}`, {
          x: marginX + 20,
          y: currentY,
          size: 10,
          font: helvetica,
          color: COLOR.TEXT_LIGHT
        });
        currentY -= 14;
      });
    }
    
    // Se o componente tem recursos, destaque-os com o novo estilo
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
