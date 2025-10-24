// src/styles/theme.ts
export const theme = {
    colors: {
        primary: '#007bff',
        primaryDark: '#0056b3',
        secondary: '#6c757d',
        secondaryDark: '#5a6268',
        background: '#f8f9fa',
        bodyBackground: '#ffffff',
        headerBackground: '#343a40',
        white: '#ffffff',
        dark: '#343a40',
        text: '#212529',
        textLight: '#f8f9fa',
        border: '#dee2e6',
        lightGrey: '#e9ecef',
        success: '#28a745',
    },
    fonts: {
        main: 'Arial, sans-serif',
    },
    spacing: {
        sm: '8px',
        md: '16px',
        lg: '24px',
    },
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

export type ThemeType = typeof theme;