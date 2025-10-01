// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/data/*.json', // Archivos fuente
          dest: 'data'               // Carpeta dentro de dist/
        }
      ]
    })
  ],
  server: {
    port: 5173,
    host: true
  }
});
