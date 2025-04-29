
import { rgb, RGB } from 'pdf-lib';
import { PdfColorScheme } from './types';

// Enhanced color scheme for a more professional look
export const COLOR: PdfColorScheme = {
  PRIMARY: rgb(0.96, 0.51, 0.13),      // HostDime Orange (#f58220)
  SECONDARY: rgb(0.10, 0.12, 0.17),    // Dark Blue (#1A1F2C)
  PRIMARY_LIGHT: rgb(0.98, 0.67, 0.40), // Light Orange
  TEXT: rgb(0.2, 0.2, 0.2),            // Dark Gray for text
  TEXT_LIGHT: rgb(0.4, 0.4, 0.4),      // Light Gray for secondary text
  ACCENT: rgb(0.61, 0.53, 0.96),       // Purple accent (#9b87f5)
  WHITE: rgb(1, 1, 1),                 // White
  BACKGROUND: rgb(0.98, 0.98, 0.98),   // Light gray background
  HIGHLIGHT: rgb(1, 0.97, 0.91),       // Cream highlight
  TABLE_ROW_ALT: rgb(0.97, 0.97, 0.97) // Alternating row color
};
