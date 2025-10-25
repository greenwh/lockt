import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/lockt/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Lockt',
        short_name: 'Lockt',
        description: 'Secure personal data storage',
        theme_color: '#1a1a1a',
        background_color: '#ffffff',
        display: 'standalone'
      }
    })
  ]
});
