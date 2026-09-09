export const theme = {
  colors: {
    background: {
      default: '#ffffff',
      secondary: '#f1f5f9',
    },
    text: {
      heading: '#021b38',
      primary: '#18233a',
      secondary: '#676e81',
      subtitle: '#6e6f7d',
      inverse: '#f5f8fa',
      error: '#e7000b',
      link: '#1751a7',
    },
    border: {
      default: '#cad5e2',
      error: '#e7000b',
      focus: '#052d69',
      hover: '#94a3b8',
    },
    button: {
      primaryBg: '#052d69',
      primaryHover: '#0b3d85',
      primaryActive: '#041f4d',
    },
    icon: {
      success: '#00a63e',
    },
    brand: '#052d69',
  },
  fonts: {
    heading: "var(--font-montserrat, 'Montserrat'), sans-serif",
    body: "var(--font-roboto, 'Roboto'), system-ui, sans-serif",
  },
  typography: {
    h4: { family: 'heading', size: 28, lineHeight: 1.35, weight: 600, letterSpacing: '0.02em' },
    h6: { family: 'heading', size: 18, lineHeight: 1.45, weight: 600, letterSpacing: '0.02em' },
    bodyL: { family: 'body', size: 18, lineHeight: '28px', weight: 400 },
    bodyM: { family: 'body', size: 16, lineHeight: '24px', weight: 400 },
    bodyMMedium: {
      family: 'body',
      size: 16,
      lineHeight: '24px',
      weight: 500,
      letterSpacing: '0.5px',
    },
    bodyS: { family: 'body', size: 14, lineHeight: '20px', weight: 400 },
    helper: { family: 'body', size: 14, lineHeight: '16px', weight: 400, letterSpacing: '0.5px' },
    caption: { family: 'body', size: 12, lineHeight: '12px', weight: 400 },
    link: { family: 'body', size: 16, lineHeight: '18px', weight: 500, letterSpacing: '0.5px' },
    button: { family: 'body', size: 16, lineHeight: '24px', weight: 700, letterSpacing: '0.05em' },
  },
  spacing: {
    1: '4px',
    2: '8px',
    2.5: '10px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    10: '40px',
    14: '56px',
  },
  radii: {
    sm: '4px',
    lg: '8px',
    xl: '10px',
    pill: '9999px',
  },
  sizes: {
    navbarHeight: '98px',
    progressHeight: '13px',
    contentWidth: '574px',
  },
  gradients: {
    progress: 'linear-gradient(90deg, #aed0f9 0%, #216ad5 100%)',
  },
  transitions: {
    fast: '150ms ease',
  },
  opacity: {
    disabled: 0.5,
  },
} as const satisfies ThemeShape;

type FontFamilyName = 'heading' | 'body';

export type TextStyle = {
  family: FontFamilyName;
  size: number;
  lineHeight: number | string;
  weight: number;
  letterSpacing?: string;
};

type ThemeShape = {
  colors: Record<string, string | Record<string, string>>;
  fonts: Record<FontFamilyName, string>;
  typography: Record<string, TextStyle>;
  spacing: Record<number, string>;
  radii: Record<string, string>;
  sizes: Record<string, string>;
  gradients: Record<string, string>;
  transitions: Record<string, string>;
  opacity: Record<string, number>;
};

export type AppTheme = typeof theme;
export type TextStyleName = keyof AppTheme['typography'];
