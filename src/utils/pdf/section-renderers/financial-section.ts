
import { PDFDocument, PDFPage, PDFFont } from "pdf-lib";
import { ComponentOption } from "@/types/component";
import { COLOR } from "../colors";
import { checkAndCreateNewPage, drawHighlightBox, drawSectionHeader, drawTableRow } from "../drawing-utils";
import { PageContext } from "../types";
import { calculateTotalValue, formatCurrency } from "../dynamic-variables";

export function renderFinancialSection(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  width: number,
  marginX: number,
  marginRight: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {}
): PageContext {
  let { page, y } = pageContext;

  // Verify if we need a new page - need at least 200 points for financial summary
  const context = checkAndCreateNewPage(
    pdfDoc, 
    page, 
    y, 
    200, 
    marginX, 
    50, 
    helvetica
  );
  
  page = context.page;
  y = context.y;

  // Draw section header
  y = drawSectionHeader(
    page, 
    "Resumo Financeiro", 
    marginX, 
    y, 
    300, 
    helveticaBold
  );
  
  y -= 20;

  // Calcular valores totais
  const { subtotal, total } = calculateTotalValue(
    selectedComponents,
    storageItems,
    customServices,
    connectivityItems,
    margin
  );

  // Determine payment condition from contract
  let paymentCondition = "Pagamento Mensal";
  if (selectedComponents.contract) {
    if (selectedComponents.contract.name.toLowerCase().includes("anual")) {
      paymentCondition = "Pagamento Anual";
    } else if (selectedComponents.contract.name.toLowerCase().includes("semestral")) {
      paymentCondition = "Pagamento Semestral";
    } else if (selectedComponents.contract.name.toLowerCase().includes("trimestral")) {
      paymentCondition = "Pagamento Trimestral";
    }
  }

  // Draw financial information box
  drawHighlightBox(
    page, 
    marginX, 
    y, 
    width - (marginX * 2), 
    120,
    COLOR.HIGHLIGHT,
    COLOR.PRIMARY_LIGHT
  );

  // Title
  page.drawText("Condições Comerciais", {
    x: marginX + 10,
    y: y - 20,
    size: 14,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });

  // Payment method
  page.drawText("Forma de Pagamento:", {
    x: marginX + 10,
    y: y - 45,
    size: 10,
    font: helveticaBold,
    color: COLOR.TEXT
  });
  
  page.drawText(paymentCondition, {
    x: marginX + 150,
    y: y - 45,
    size: 10,
    font: helvetica,
    color: COLOR.TEXT
  });

  // Subtotal
  page.drawText("Subtotal:", {
    x: marginX + 10,
    y: y - 70,
    size: 10,
    font: helveticaBold,
    color: COLOR.TEXT
  });
  
  page.drawText(formatCurrency(subtotal), {
    x: marginX + 150,
    y: y - 70,
    size: 10,
    font: helvetica,
    color: COLOR.TEXT
  });

  // Total
  page.drawText("Total Mensal:", {
    x: marginX + 10,
    y: y - 95,
    size: 12,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  page.drawText(formatCurrency(total), {
    x: marginX + 150,
    y: y - 95,
    size: 12,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  return { page, y: y - 130 };
}
