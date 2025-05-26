
import { PDFDocument, PDFPage, PDFFont } from "pdf-lib";
import { ComponentOption } from "@/types/component";
import { COLOR } from "../colors";
import { checkAndCreateNewPage, drawHighlightBox, drawSectionHeader } from "../drawing-utils";
import { PageContext } from "../types";

export function renderContractSection(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  selectedComponents: { [key: string]: ComponentOption },
  width: number,
  marginX: number,
  marginRight: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont
): PageContext {
  let { page, y } = pageContext;

  // Check if contract component exists
  const contractComponent = selectedComponents.contract || selectedComponents.contrato;
  if (!contractComponent) {
    return { page, y };
  }

  // Verify if we need a new page
  const context = checkAndCreateNewPage(
    pdfDoc, 
    page, 
    y, 
    120, 
    marginX, 
    50, 
    helvetica
  );
  
  page = context.page;
  y = context.y;

  // Draw contract section with orange background similar to Data Center
  drawHighlightBox(
    page, 
    marginX, 
    y, 
    width - (marginX * 2), 
    100,
    COLOR.BACKGROUND,
    COLOR.ACCENT, // Orange border
    1,
    0.7
  );

  // Header with orange background
  page.drawRectangle({
    x: marginX,
    y: y,
    width: width - (marginX * 2),
    height: 25,
    color: COLOR.ACCENT, // Orange background
    borderWidth: 0
  });

  // Contract title
  page.drawText("Contrato", {
    x: marginX + 10,
    y: y - 18,
    size: 12,
    font: helveticaBold,
    color: COLOR.WHITE
  });

  // Contract duration label
  page.drawText("Duração", {
    x: width - marginX - 100,
    y: y - 18,
    size: 10,
    font: helvetica,
    color: COLOR.WHITE
  });

  // Contract description
  const contractDescription = getContractDescription(contractComponent);
  page.drawText(contractDescription, {
    x: marginX + 10,
    y: y - 45,
    size: 11,
    font: helvetica,
    color: COLOR.TEXT
  });

  // Contract benefits
  if (contractComponent.metadata?.discount && contractComponent.metadata.discount > 0) {
    page.drawText(`✓ Desconto de ${contractComponent.metadata.discount}% incluído`, {
      x: marginX + 10,
      y: y - 65,
      size: 10,
      font: helvetica,
      color: COLOR.SUCCESS
    });
  }

  return { page, y: y - 110 };
}

function getContractDescription(contractComponent: ComponentOption): string {
  const contractName = contractComponent.name.toLowerCase();
  
  if (contractName.includes("sem contrato") || contractName.includes("0")) {
    return "Contrato flexível sem compromisso de permanência";
  }
  
  if (contractName.includes("12") || contractName.includes("anual")) {
    return "Contrato com desconto por fidelidade";
  }
  
  if (contractName.includes("24")) {
    return "Contrato de dois anos com desconto especial";
  }
  
  if (contractName.includes("36")) {
    return "Contrato de três anos com desconto máximo";
  }
  
  if (contractName.includes("48")) {
    return "Contrato de quatro anos com desconto premium";
  }
  
  if (contractName.includes("60")) {
    return "Contrato de cinco anos com desconto corporativo";
  }
  
  return contractComponent.description || "Contrato personalizado";
}
