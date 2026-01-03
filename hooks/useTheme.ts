import { useColorScheme } from 'react-native';
import { colors, type ColorScheme, type Colors } from '@/constants/theme';

export function useTheme(): { colorScheme: ColorScheme; colors: Colors } {
  const systemColorScheme = useColorScheme();

  // Default to dark mode
  const colorScheme: ColorScheme = systemColorScheme ?? 'dark';

  return {
    colorScheme,
    colors: colors[colorScheme],
  };
}
