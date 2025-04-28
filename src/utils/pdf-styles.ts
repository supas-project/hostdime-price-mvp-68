
import { rgb } from 'pdf-lib';

export const PDFStyles = {
  colors: {
    primary: rgb(0.96, 0.51, 0.13), // #f58220
    text: rgb(0.12, 0.12, 0.12),    // #1e1e1e
    muted: rgb(0.4, 0.4, 0.4),      // text-muted
    white: rgb(1, 1, 1),            // #ffffff
    lightGray: rgb(0.98, 0.98, 0.98),
    tableHeader: rgb(0.95, 0.95, 0.95),
    tableBorder: rgb(0.85, 0.85, 0.85)
  },
  spacing: {
    pagePadding: 50,
    sectionSpacing: 30,
    paragraphSpacing: 20,
    lineHeight: 1.5
  },
  fontSize: {
    title: 28,
    subtitle: 20,
    heading: 16,
    body: 11,
    small: 9
  }
};
