export const DESIGN_TOKENS = {
  container: {
    contentMaxWidthPx: 680,
    pageMaxWidthPx: 1280,
    sidebarWidthPx: 384,
  },
  spacing: {
    xsPx: 4,
    smPx: 8,
    mdPx: 16,
    lgPx: 24,
    xlPx: 32,
  },
  radius: {
    smPx: 6,
    mdPx: 8,
    lgPx: 12,
    xlPx: 16,
  },
  shadow: {
    button: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)',
    card: '0px 1px 4px 0px rgba(12, 12, 13, 0.1), 0px 1px 4px 0px rgba(12, 12, 13, 0.05)',
  },
  typography: {
    bodyFontSizePx: 16,
    bodyLineHeightPx: 24,
    headingFontSizePx: 20,
    headingLineHeightPx: 28,
  },
  zIndex: {
    overlay: 50,
    floatingControls: 40,
    stickyHeader: 30,
  },
} as const;
