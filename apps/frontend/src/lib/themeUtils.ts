import { MantineTheme, useMantineTheme } from '@mantine/core';

function normalizeHex(hex: string): string {
  if (!hex) return '#000000';
  if (hex.startsWith('#')) return hex;
  return hex;
}

function hexToRgb(hex: string) {
  const h = normalizeHex(hex).replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function luminanceFromHex(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  // convert to sRGB
  const srgb = [r, g, b].map(v => v / 255).map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  // luminance
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

export function getContrastColor(hex: string) {
  try {
    const lum = luminanceFromHex(hex);
    // return dark text for light backgrounds and white text for dark backgrounds
    return lum > 0.5 ? '#000000' : '#ffffff';
  } catch (err) {
    return '#ffffff';
  }
}

export function getPrimaryForTheme(theme: MantineTheme | any, colorScheme: 'light' | 'dark') {
  const primaryColorName = (theme && theme.primaryColor) || 'blue';
  const colors = (theme && theme.colors) || ({} as any);
  const shades = colors[primaryColorName];
  // prefer different shades per scheme for better contrast
  const shadeIndex = colorScheme === 'dark' ? 4 : 6;
  if (Array.isArray(shades)) {
    return shades[shadeIndex] || shades[5] || shades[0];
  }
  // some themes might provide color strings directly
  if (typeof shades === 'string') return shades;
  // fallback to theme.colors.blue[6] if available
  if (colors && colors.blue && Array.isArray(colors.blue)) return colors.blue[6] || '#228be6';
  return '#228be6';
}

export function useAppTheme() {
  const theme = useMantineTheme();
  const colorScheme = (theme as any)?.colorScheme || 'light';
  const primary = getPrimaryForTheme(theme as any, colorScheme as 'light' | 'dark');
  const contrast = getContrastColor(primary);
  return { theme, primary, contrast };
}

// Compatibility shim: provide a hook with the same API as Mantine's `useMantineColorScheme`
// backed by the app-level color scheme context. This lets components call
// `useMantineColorScheme()` even though the app uses a local provider.
import { useAppColorScheme } from './color-scheme';

export function useMantineColorScheme() {
  try {
    const { colorScheme, toggleColorScheme } = useAppColorScheme();
    return { colorScheme, toggleColorScheme } as any;
  } catch (err) {
    // If context not available, provide a no-op shim
    return {
      colorScheme: 'light',
      toggleColorScheme: (_?: any) => undefined,
    } as any;
  }
}

/**
 * Convert a 3- or 6-digit hex color to an rgba() string with the given alpha (0-1).
 * Returns the input hex if parsing fails.
 */
export function hexToRgba(hex: string, alpha = 1) {
  try {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    let h = hex.replace('#', '').trim();
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6) return hex;
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
  } catch (err) {
    return hex;
  }
}

export function getThemeColors(theme: MantineTheme | any, colorScheme: 'light' | 'dark') {
  // Best-effort mapping from Mantine theme to a small set of CSS vars used across the app.
  try {
    const colors = (theme && theme.colors) || {};
    if (colorScheme === 'dark') {
      const bg = (colors.dark && colors.dark[8]) || '#0b1220';
      const surface = (colors.dark && colors.dark[7]) || '#0f1724';
      const text = '#e6eef8';
      const muted = hexToRgba('#ffffff', 0.6);
      return { bg, surface, text, muted };
    }

    // light
    const bg = (theme && theme.white) || '#ffffff';
    const surface = (colors.gray && colors.gray[0]) || '#f8fafc';
    const text = '#111827';
    const muted = '#6b7280';
    return { bg, surface, text, muted };
  } catch (err) {
    return { bg: '#ffffff', surface: '#f8fafc', text: '#111827', muted: '#6b7280' };
  }
}
