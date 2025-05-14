
import { PDFDocument, PDFFont } from "pdf-lib";
import { COLOR } from "../colors";
import { PageContext } from "../types";
import { checkAndCreateNewPage, drawSectionHeader } from "../drawing-utils";

export function renderTermsSection(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  marginX: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
  observacoes?: string
): PageContext {
  let { page, y } = pageContext;

  // Verify if we need a new page
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
    "Termos e Condições", 
    marginX, 
    y, 
    300, 
    helveticaBold
  );

  y -= 20;

  // Draw terms and conditions
  const termsLines = [
    "1. Esta proposta é válida por 30 dias.",
    "2. Os preços apresentados podem sofrer alteração sem aviso prévio.",
    "3. A configuração do servidor pode ser personalizada conforme necessidade.",
    "4. Suporte técnico 24x7 incluído em todos os planos."
  ];

  // Draw each terms line
  for (const line of termsLines) {
    page.drawText(line, {
      x: marginX,
      y: y,
      size: 10,
      font: helvetica,
      color: COLOR.TEXT
    });
    y -= 15;
  }
  
  // Adicionar observações se fornecidas
  if (observacoes && observacoes.trim().length > 0) {
    y -= 10;
    
    page.drawText("Observações:", {
      x: marginX,
      y,
      size: 11,
      font: helveticaBold,
      color: COLOR.PRIMARY
    });
    
    y -= 20;
    
    // Dividir observações em linhas para evitar corte
    const maxWidth = 495; // Largura máxima para o texto
    let currentLine = '';
    let words = observacoes.split(' ');
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const lineWidth = helvetica.widthOfTextAtSize(testLine, 10);
      
      if (lineWidth > maxWidth) {
        // Desenhar linha atual e começar nova linha
        page.drawText(currentLine, {
          x: marginX,
          y,
          size: 10,
          font: helvetica,
          color: COLOR.TEXT
        });
        
        y -= 15;
        currentLine = word;
        
        // Verificar se precisamos de uma nova página
        if (y < 50) {
          const newContext = checkAndCreateNewPage(pdfDoc, page, y, 200, marginX, 50, helvetica);
          page = newContext.page;
          y = newContext.y - 15;
        }
      } else {
        currentLine = testLine;
      }
    }
    
    // Desenhar última linha se houver conteúdo
    if (currentLine) {
      page.drawText(currentLine, {
        x: marginX,
        y,
        size: 10,
        font: helvetica,
        color: COLOR.TEXT
      });
      y -= 20;
    }
  }

  // Add footer
  y -= 30;
  page.drawText("Para mais informações, entre em contato com nossa equipe comercial.", {
    x: marginX,
    y,
    size: 9,
    font: helvetica,
    color: COLOR.TEXT_LIGHT
  });

  y -= 15;
  page.drawText("HostDime Brasil | www.hostdime.com.br | comercial@hostdime.com.br | (11) 4766-1391", {
    x: marginX,
    y,
    size: 9,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });

  return { page, y };
}
