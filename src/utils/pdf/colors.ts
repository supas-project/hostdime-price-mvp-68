
import { rgb, RGB } from 'pdf-lib';
import { PdfColorScheme } from './types';

// Updated color palette to match the screenshot design
export const COLOR: PdfColorScheme = {
  PRIMARY: rgb(0.92, 0.52, 0.22),      // HostDime Orange (#eb8538)
  SECONDARY: rgb(0.10, 0.12, 0.17),    // Dark Blue/Black (#1A1F2C)
  PRIMARY_LIGHT: rgb(0.99, 0.70, 0.45), // Light Orange 
  TEXT: rgb(0.15, 0.17, 0.21),         // Text color (#262A36)
  TEXT_LIGHT: rgb(0.35, 0.37, 0.41),   // Secondary text (#5A5E68)
  ACCENT: rgb(0.55, 0.62, 0.69),       // Accent color (#8E9196)
  WHITE: rgb(1, 1, 1),                 // White
  BACKGROUND: rgb(0.98, 0.98, 0.99),   // Background color
  HIGHLIGHT: rgb(1.0, 0.94, 0.88),     // Light orange highlight (#FFF0E0)
  TABLE_ROW_ALT: rgb(0.97, 0.94, 0.91) // Alternating row color (#F7F0E8)
};
