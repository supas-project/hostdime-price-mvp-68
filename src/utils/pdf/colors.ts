
import { rgb, RGB } from 'pdf-lib';
import { PdfColorScheme } from './types';

// Updated color palette to perfectly match HostDime's brand with improved visual hierarchy
export const COLOR: PdfColorScheme = {
  PRIMARY: rgb(1.00, 0.40, 0.00),      // HostDime Orange (#FF6600) - Main brand color
  SECONDARY: rgb(0.10, 0.12, 0.17),    // Dark Blue/Black (#1A1F2C) - Secondary brand color
  PRIMARY_LIGHT: rgb(1.00, 0.75, 0.55), // Light Orange - For highlights and accents
  TEXT: rgb(0.13, 0.15, 0.19),         // Darker Text color for better readability (#212429)
  TEXT_LIGHT: rgb(0.35, 0.37, 0.41),   // Secondary text (#5A5E68)
  ACCENT: rgb(0.55, 0.62, 0.69),       // Accent color (#8E9196)
  WHITE: rgb(1, 1, 1),                 // White
  BACKGROUND: rgb(0.98, 0.98, 0.99),   // Background color
  HIGHLIGHT: rgb(1.0, 0.96, 0.92),     // Very light orange highlight (#FFF5EA)
  TABLE_ROW_ALT: rgb(0.98, 0.96, 0.94)  // Subtle alternating row color (#FAF5EF)
};
