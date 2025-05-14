
import { ComponentOption } from "@/types/component";
import { PDFPage, PDFFont, RGB } from "pdf-lib";

export interface GroupedDisk {
  disk: ComponentOption;
  quantity: number;
}

// Updated PdfColorScheme interface with refined HostDime branding colors
export interface PdfColorScheme {
  PRIMARY: RGB;        // HostDime Orange
  SECONDARY: RGB;      // Dark color for contrast
  PRIMARY_LIGHT: RGB;  // Light orange for accents
  TEXT: RGB;           // Main text color
  TEXT_LIGHT: RGB;     // Secondary text color
  ACCENT: RGB;         // Subtle accent color
  WHITE: RGB;          // White for backgrounds and contrasting text
  BACKGROUND: RGB;     // Page background color
  HIGHLIGHT: RGB;      // Highlight background
  TABLE_ROW_ALT: RGB;  // Alternating table row color
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

// Enhanced text options for better typography
export interface TextOptions {
  fontSize?: number;
  lineHeight?: number;
  maxWidth?: number;
  color?: RGB;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
}

// Enhanced image options for better layout
export interface ImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  preserveAspectRatio?: boolean;
  fallbackText?: string;
  backgroundColor?: RGB;
  border?: boolean;
  borderColor?: RGB;
  borderRadius?: number;
}

// Enhanced table options for better data display
export interface TableColumn {
  header: string;
  key: string;
  width: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
  style?: {
    fontColor?: RGB;
    bold?: boolean;
  };
}
