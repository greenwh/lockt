// src/config/auth.config.ts

export const msalConfig = {
  auth: {
    clientId: 'bd453050-3e3c-470a-8db7-16c479b30ec7',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:5173/', 
  },
  cache: {
    cacheLocation: 'localStorage' as const,
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['Files.ReadWrite.AppFolder'],
};
