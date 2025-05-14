import { ComponentOption } from "@/types/component";
import { PDFPage, PDFFont, RGB } from "pdf-lib";

export interface GroupedDisk {
  disk: ComponentOption;
  quantity: number;
}

// Atualizar interface PdfColorScheme para adicionar nova cor
export interface PdfColorScheme {
  PRIMARY: RGB;
  SECONDARY: RGB;
  PRIMARY_LIGHT: RGB;
  TEXT: RGB;
  TEXT_LIGHT: RGB;
  ACCENT: RGB;
  WHITE: RGB;
  BACKGROUND: RGB;
  HIGHLIGHT: RGB;
  TABLE_ROW_ALT: RGB;
}

export interface PageContext {
  page: PDFPage;
  y: number;
}

export interface QuoteBoxDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}
