// src/styles/theme.ts
export const theme = {
  colors: {
    primary: '#007bff',
    primaryDark: '#0056b3',
    secondary: '#6c757d',
    secondaryDark: '#5a6268',
    background: '#f8f9fa',
    bodyBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    headerBackground: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    white: '#ffffff',
    dark: '#343a40',
    lightGrey: '#e9ecef',
    text: '#495057',
    textLight: '#ffffff',
    error: '#dc3545',
    success: '#28a745',
  },
  fonts: {
    main: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: '8px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
};

export type ThemeType = typeof theme;