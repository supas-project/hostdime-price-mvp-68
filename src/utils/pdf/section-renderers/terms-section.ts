
import { PDFDocument, PDFFont } from "pdf-lib";
import { COLOR } from "../colors";
import { checkAndCreateNewPage } from "../drawing-utils";
import { PageContext } from "../types";

export function renderTermsSection(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  marginX: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont
): PageContext {
  let { page, y: currentY } = pageContext;
  
  // Add footnote
  currentY -= 30;
  const footnoteCheck = checkAndCreateNewPage(pdfDoc, page, currentY, 150, marginX, 50, helvetica);
  page = footnoteCheck.page;
  currentY = footnoteCheck.y;
  
  page.drawText("Termos e Condições:", {
    x: marginX,
    y: currentY,
    size: 10,
    font: helveticaBold,
    color: COLOR.TEXT
  });
  
  currentY -= 15;
  
  const termsText = "Esta proposta tem validade de 15 dias. Os valores podem sofrer alterações sem aviso prévio. Impostos não inclusos. As configurações deste documento foram personalizadas com base nas informações fornecidas pelo cliente.";
  
  page.drawText(termsText, {
    x: marginX,
    y: currentY,
    size: 8,
    font: helvetica,
    color: COLOR.TEXT_LIGHT
  });
  
  return { page, y: currentY };
}
