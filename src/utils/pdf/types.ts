
import { ComponentOption } from "@/types/component";
import { PDFPage, PDFFont, RGB } from "pdf-lib";

export interface GroupedDisk {
  disk: ComponentOption;
  quantity: number;
}

// Updated PdfColorScheme interface with refined color palette
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

// New interfaces for enhanced components
export interface TextOptions {
  fontSize?: number;
  lineHeight?: number;
  maxWidth?: number;
  color?: RGB;
  align?: 'left' | 'center' | 'right';
}

export interface ImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  preserveAspectRatio?: boolean;
  fallbackText?: string;
}

export interface TableColumn {
  header: string;
  key: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}
