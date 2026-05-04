import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['CesiZenLogo.png', 'vite.svg', 'Bibliotheque.jpg'],
    manifest: {
      name: 'CesiZen - Bien-être Mental',
      short_name: 'CesiZen',
      description: 'Exercices de respiration et cohérence cardiaque',
      theme_color: '#059669',
      background_color: '#f8fafc',
      display: 'standalone',
      icons: [
        {
          src: 'CesiZenLogo.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'CesiZenLogo.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    }
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
