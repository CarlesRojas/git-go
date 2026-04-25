import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
})
