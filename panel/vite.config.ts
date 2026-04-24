import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '',
  build: {
    outDir: '../media',
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: './src/main.tsx',
      output: {
        entryFileNames: 'webview.js',
        assetFileNames: 'webview.[ext]',
        format: 'iife',
        manualChunks: undefined,
      },
    },
  },
});
