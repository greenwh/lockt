// src/config/auth.config.ts

// Dynamically set redirect URI based on environment
const getRedirectUri = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5173/';
  }
  // GitHub Pages URL
  return 'https://greenwh.github.io/lockt/';
};

export const msalConfig = {
  auth: {
    clientId: 'bd453050-3e3c-470a-8db7-16c479b30ec7',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: getRedirectUri(),
  },
  cache: {
    cacheLocation: 'localStorage' as const,
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['Files.ReadWrite.AppFolder'],
};
