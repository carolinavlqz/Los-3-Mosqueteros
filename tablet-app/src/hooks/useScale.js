import { useWindowDimensions } from 'react-native';

const BASE_WIDTH = 375;
const TABLET_BREAKPOINT = 600;

/**
 * Shared responsive scale hook — same breakpoint logic across every screen so
 * phone, tablet, and browser/laptop windows (Expo web) all resolve consistently.
 * On tablet/laptop widths the content is capped and centered instead of stretching
 * edge-to-edge; `scale` grows modestly with width for larger touch targets/text.
 */
export function useScale({
  maxContentWidthPhone = 480,
  maxContentWidthTablet = 760,
  tabletWidthRatio = 0.9,
  minScale = 0.85,
  maxScale = 1.3,
} = {}) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= TABLET_BREAKPOINT;

  const contentWidth = isTablet
    ? Math.min(width * tabletWidthRatio, maxContentWidthTablet)
    : Math.min(width, maxContentWidthPhone);

  const rawScale = contentWidth / BASE_WIDTH;
  const scale = Math.max(minScale, Math.min(rawScale, maxScale));

  // Filas en vez de columnas cuando hay espacio de sobra: tablet, laptop o celular en landscape.
  const useRowLayout = isTablet || isLandscape;

  return { isLandscape, isTablet, contentWidth, scale, useRowLayout };
}
