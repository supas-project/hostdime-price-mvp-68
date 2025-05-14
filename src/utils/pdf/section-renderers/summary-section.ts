
import { PDFFont, PDFPage } from "pdf-lib";
import { COLOR } from "../colors";
import { drawSectionHeader, drawSeparator } from "../drawing-utils";

export function renderSummarySection(
  page: PDFPage,
  currentY: number,
  width: number,
  marginX: number,
  helveticaBold: PDFFont,
  helvetica: PDFFont
): number {
  // Resumo Executivo no novo estilo
  currentY -= 20;
  drawSeparator(page, marginX, currentY, width - (marginX * 2));
  currentY -= 25;
  
  page.drawText("Resumo Executivo", {
    x: marginX,
    y: currentY,
    size: 14,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  currentY -= 25;
  
  // Texto simplificado sem caracteres especiais
  const summaryText = "Agradecemos seu interesse nos servicos da HostDime Brasil. Apresentamos a seguir uma proposta de servidor dedicado personalizada de acordo com suas necessidades especificas. Nossa equipe esta a disposicao para quaisquer esclarecimentos adicionais.";
  
  // Quebrar o resumo em linhas
  const maxWidth = width - (marginX * 2);
  const words = summaryText.split(' ');
  let line = '';
  let lineCount = 0;
  
  for (const word of words) {
    const testLine = line + word + ' ';
    const testWidth = helvetica.widthOfTextAtSize(testLine, 10);
    
    if (testWidth > maxWidth) {
      // Desenhar a linha atual e iniciar uma nova
      page.drawText(line, {
        x: marginX,
        y: currentY - (lineCount * 15),
        size: 10,
        font: helvetica,
        color: COLOR.TEXT
      });
      
      line = word + ' ';
      lineCount++;
    } else {
      line = testLine;
    }
  }
  
  // Desenhar o texto restante
  if (line) {
    page.drawText(line, {
      x: marginX,
      y: currentY - (lineCount * 15),
      size: 10,
      font: helvetica,
      color: COLOR.TEXT
    });
    lineCount++;
  }
  
  return currentY - (lineCount * 15) - 25;
}
