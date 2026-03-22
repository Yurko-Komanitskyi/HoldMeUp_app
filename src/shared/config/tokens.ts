const BRAND_ACCENT = '#7badcf';
export const THEME = {
  light: {
    background: '#faf8f5',
    foreground: '#261d17',
    card: '#fdfdfc',
    cardForeground: '#261d17',
    popover: '#fdfdfc',
    popoverForeground: '#261d17',
    primary: '#2c7696',
    primaryForeground: '#ffffff',
    secondary: '#f2eee8',
    secondaryForeground: '#322720',
    muted: '#efece6',
    mutedForeground: '#6e6053',
    accent: '#e6f0f4',
    accentForeground: '#285b71',
    destructive: '#dc2828',
    destructiveForeground: '#ffffff',
    border: '#e5ddd2',
    input: '#e7e1da',
    ring: '#398aac',
    chart1: '#e76e50',
    chart2: '#2a9d90',
    chart3: '#274754',
    chart4: '#e8c468',
    chart5: '#f4a462',
  },
  dark: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    card: '#0a0a0a',
    cardForeground: '#fafafa',
    popover: '#0a0a0a',
    popoverForeground: '#fafafa',
    primary: '#fafafa',
    primaryForeground: '#171717',
    secondary: '#262626',
    secondaryForeground: '#fafafa',
    muted: '#262626',
    mutedForeground: '#a3a3a3',
    accent: '#8bb9d0',
    accentForeground: '#fafafa',
    destructive: '#e14e4e',
    destructiveForeground: '#ffffff',
    border: '#262626',
    input: '#262626',
    ring: '#737373',
    chart1: '#2662d9',
    chart2: '#2eb88a',
    chart3: '#e88c30',
    chart4: '#af57db',
    chart5: '#e23670',
  },
} as const;

export type ThemeVarKey = keyof typeof THEME.light;

const Light = { ...THEME.light, brandAccent: BRAND_ACCENT } as const;
const Dark = { ...THEME.dark, brandAccent: BRAND_ACCENT } as const;

export type ThemePaletteHex = { [K in ThemeVarKey]: string } & { brandAccent: string };

export const tokens = {
  colors: {
    light: Light as ThemePaletteHex,
    dark: Dark as ThemePaletteHex,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
} as const;
