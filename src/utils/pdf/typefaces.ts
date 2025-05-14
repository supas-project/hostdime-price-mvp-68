
// Defining font settings for consistent typography across the PDF
export const PDF_FONTS = {
  HEADING: {
    PRIMARY: {
      SIZE: 18,
      COLOR: [0.96, 0.51, 0.13], // HostDime Orange
    },
    SECONDARY: {
      SIZE: 16,
      COLOR: [0.08, 0.10, 0.14], // Dark blue
    },
  },
  BODY: {
    PRIMARY: {
      SIZE: 11,
      COLOR: [0.15, 0.17, 0.21], // Dark text
    },
    SECONDARY: {
      SIZE: 10,
      COLOR: [0.35, 0.37, 0.41], // Light text
    },
  },
  HIGHLIGHT: {
    SIZE: 14,
    COLOR: [0.08, 0.65, 0.91], // Accent blue
  },
};

export const PDF_SPACING = {
  SECTION_MARGIN_TOP: 30,
  PARAGRAPH_SPACING: 14,
  ITEM_SPACING: 18,
  LIST_ITEM_INDENT: 20,
};
