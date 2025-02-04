import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  base: "./",  // 🔹 Asegura que los archivos sean correctamente referenciados en producción
  build: {
    outDir: "dist",
    assetsDir: "assets"  // 🔹 Asegura que los archivos estáticos vayan a /assets/
  }
});
