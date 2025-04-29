
import { PDFDocument, PDFFont } from "pdf-lib";
import { COLOR } from "../colors";
import { checkAndCreateNewPage, drawSectionHeader } from "../drawing-utils";
import { PageContext } from "../types";

export function renderBenefitsSection(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  marginX: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont
): PageContext {
  let { page, y: currentY } = pageContext;
  
  // Add company benefits section
  const benefitsCheck = checkAndCreateNewPage(pdfDoc, page, currentY, 200, marginX, 50, helvetica);
  page = benefitsCheck.page;
  currentY = benefitsCheck.y;
  
  // Add company benefits section
  currentY = drawSectionHeader(
    page, 
    "Vantagens HostDime", 
    marginX, 
    currentY, 
    300,
    helveticaBold
  );
  
  // List of benefits (removed accents)
  const benefits = [
    "Suporte tecnico 24x7x365 em portugues",
    "Data centers certificados Tier III",
    "Garantia de disponibilidade (SLA) de 99,9%",
    "Rede redundante e alta disponibilidade",
    "Monitoramento proativo do servidor",
    "Painel de gerenciamento exclusivo"
  ];
  
  benefits.forEach(benefit => {
    page.drawText(`• ${benefit}`, {
      x: marginX + 20,
      y: currentY,
      size: 11,
      font: helvetica,
      color: COLOR.TEXT
    });
    currentY -= 20;
  });
  
  return { page, y: currentY };
}
