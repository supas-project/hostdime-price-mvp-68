
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

  // CORREÇÃO: Melhor detecção de contrato e condição de pagamento
  let paymentCondition = "Pagamento Mensal";
  if (selectedComponents.contract) {
    const contractName = selectedComponents.contract.name.toLowerCase();
    if (contractName.includes("anual")) {
      paymentCondition = "Pagamento Anual";
    } else if (contractName.includes("semestral")) {
      paymentCondition = "Pagamento Semestral";
    } else if (contractName.includes("trimestral")) {
      paymentCondition = "Pagamento Trimestral";
    } else if (contractName.includes("24 meses") || contractName.includes("dois anos")) {
      paymentCondition = "Pagamento Bianual";
    }
  }

  // CORREÇÃO: Melhor estruturação visual da caixa de informações financeiras
  drawHighlightBox(
    page, 
    marginX, 
    y, 
    width - (marginX * 2), 
    140, // Aumentado para acomodar informações
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

  // CORREÇÃO: Garantir que o subtotal seja exibido com formatação correta
  let subtotalFormatted = formatCurrency(subtotal);
  page.drawText("Subtotal:", {
    x: marginX + 15,
    y: y - 75,
    size: 11,
    font: helveticaBold,
    color: COLOR.TEXT
  });
  
  page.drawText(subtotalFormatted, {
    x: marginX + 150,
    y: y - 75,
    size: 11,
    font: helvetica,
    color: COLOR.TEXT
  });

  // CORREÇÃO: Melhorar destaque e legibilidade do total
  page.drawRectangle({
    x: marginX + 10,
    y: y - 105,
    width: width - (marginX * 2) - 20,
    height: 35, // Aumentado para melhor visualização
    color: COLOR.HIGHLIGHT,
    borderColor: COLOR.PRIMARY,
    borderWidth: 1
  });
  
  // CORREÇÃO: Texto do total mais visível e melhor posicionado
  page.drawText("Total Mensal:", {
    x: marginX + 15,
    y: y - 115, // Ajustado para centralizar no retângulo
    size: 16, // Aumentado para destaque
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  // CORREÇÃO: Garantir que o total seja formatado corretamente e bem posicionado
  let totalFormatted = formatCurrency(total);
  page.drawText(totalFormatted, {
    x: width - marginX - 15 - helveticaBold.widthOfTextAtSize(totalFormatted, 16),
    y: y - 115, // Ajustado para alinhar com o texto "Total Mensal"
    size: 16, // Aumentado para destaque
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  return { page, y: y - 150 }; // Aumentado o espaço após a seção financeira
}
