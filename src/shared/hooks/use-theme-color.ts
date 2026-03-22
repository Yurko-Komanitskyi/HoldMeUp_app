import * as React from 'react';
import { useColorScheme } from 'nativewind';

import { tokens, type ThemePaletteHex } from '@/shared/config/tokens';

export type ThemeColors = ThemePaletteHex & { isDark: boolean };
export function useThemeColor(): ThemeColors {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return React.useMemo(
    () => ({
      ...(isDark ? tokens.colors.dark : tokens.colors.light),
      isDark,
    }),
    [isDark],
  );
}
