
import { PDFDocument, PDFFont } from "pdf-lib";
import { ComponentOption } from "@/types/component";
import { checkAndCreateNewPage, drawSectionHeader } from "../drawing-utils";
import { PageContext } from "../types";
import { renderInternalStorage } from "./storage/internal-storage-renderer";
import { renderExternalStorage } from "./storage/external-storage-renderer";

export function renderStorageSection(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  width: number,
  marginX: number,
  marginRight: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
  helveticaOblique: PDFFont,
): PageContext {
  let { page, y: currentY } = pageContext;
  
  // Return early if no storage items
  if (storageItems.internal.length === 0 && storageItems.external.length === 0) {
    return { page, y: currentY };
  }
  
  // Check if we need to add a new page based on remaining space
  const storagePageCheck = checkAndCreateNewPage(pdfDoc, page, currentY, 300, marginX, 50, helvetica);
  page = storagePageCheck.page;
  currentY = storagePageCheck.y;
  
  // Desenhar o cabeçalho da seção
  currentY = drawSectionHeader(
    page, 
    "2. Solucoes de Armazenamento", 
    marginX, 
    currentY, 
    300,
    helveticaBold
  );
  
  // Renderizar armazenamento interno se houver
  if (storageItems.internal.length > 0) {
    const internalResult = renderInternalStorage(
      pdfDoc,
      { page, y: currentY },
      storageItems.internal,
      width,
      marginX,
      marginRight,
      helvetica,
      helveticaBold,
      helveticaOblique
    );
    
    page = internalResult.page;
    currentY = internalResult.y;
  }
  
  // Renderizar armazenamento externo se houver
  if (storageItems.external.length > 0) {
    const externalResult = renderExternalStorage(
      pdfDoc,
      { page, y: currentY },
      storageItems.external,
      width,
      marginX,
      marginRight,
      helvetica,
      helveticaBold,
      helveticaOblique
    );
    
    page = externalResult.page;
    currentY = externalResult.y;
  }
  
  return { page, y: currentY };
}
