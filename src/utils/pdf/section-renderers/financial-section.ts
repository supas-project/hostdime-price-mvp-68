
import { PDFDocument, PDFPage, PDFFont } from "pdf-lib";
import { ComponentOption } from "@/types/component";
import { COLOR } from "../colors";
import { checkAndCreateNewPage, drawHighlightBox, drawSectionHeader, drawTableRow, drawTableHeader } from "../drawing-utils";
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
    220, 
    marginX, 
    50, 
    helvetica
  );
  
  page = context.page;
  y = context.y;

  // Draw section header with HostDime styling
  y = drawSectionHeader(
    page, 
    "Resumo Financeiro", 
    marginX, 
    y, 
    300, 
    helveticaBold,
    18,
    COLOR.PRIMARY
  );
  
  y -= 25;

  // Calculate values
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

  // Draw financial information box with HostDime styling
  drawHighlightBox(
    page, 
    marginX, 
    y, 
    width - (marginX * 2), 
    130,
    COLOR.BACKGROUND,
    COLOR.PRIMARY,
    1,
    0.7
  );

  // Draw header bar for financial section
  page.drawRectangle({
    x: marginX,
    y: y,
    width: width - (marginX * 2),
    height: 30,
    color: COLOR.PRIMARY,
    borderWidth: 0
  });

  // Title on orange background
  page.drawText("Condições Comerciais", {
    x: marginX + 15,
    y: y - 20,
    size: 14,
    font: helveticaBold,
    color: COLOR.WHITE
  });

  // Payment method
  page.drawText("Forma de Pagamento:", {
    x: marginX + 15,
    y: y - 50,
    size: 11,
    font: helveticaBold,
    color: COLOR.TEXT
  });
  
  page.drawText(paymentCondition, {
    x: marginX + 150,
    y: y - 50,
    size: 11,
    font: helvetica,
    color: COLOR.TEXT
  });

  // Subtotal
  page.drawText("Subtotal:", {
    x: marginX + 15,
    y: y - 75,
    size: 11,
    font: helveticaBold,
    color: COLOR.TEXT
  });
  
  page.drawText(formatCurrency(subtotal), {
    x: marginX + 150,
    y: y - 75,
    size: 11,
    font: helvetica,
    color: COLOR.TEXT
  });

  // Total with HostDime highlight
  page.drawRectangle({
    x: marginX + 10,
    y: y - 95,
    width: width - (marginX * 2) - 20,
    height: 25,
    color: COLOR.HIGHLIGHT,
    borderColor: COLOR.PRIMARY_LIGHT,
    borderWidth: 1
  });
  
  page.drawText("Total Mensal:", {
    x: marginX + 15,
    y: y - 105,
    size: 14,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  page.drawText(formatCurrency(total), {
    x: width - marginX - 15 - helveticaBold.widthOfTextAtSize(formatCurrency(total), 14),
    y: y - 105,
    size: 14,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  return { page, y: y - 140 };
}
