// Theme constants for the Recipe App
// Dark mode is the default

export const colors = {
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#98989D',
    textMuted: '#636366',
    primary: '#0A84FF',
    primaryPressed: '#0066CC',
    success: '#30D158',
    warning: '#FFD60A',
    error: '#FF453A',
    border: '#38383A',
    borderLight: '#48484A',
  },
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F7',
    surfaceElevated: '#FFFFFF',
    text: '#000000',
    textSecondary: '#3C3C43',
    textMuted: '#8E8E93',
    primary: '#007AFF',
    primaryPressed: '#0056B3',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    border: '#C6C6C8',
    borderLight: '#D1D1D6',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export type ColorScheme = 'dark' | 'light';
export type Colors = (typeof colors)[ColorScheme];
