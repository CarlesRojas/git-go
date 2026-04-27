import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@git': path.resolve(__dirname, '@/src'),
    },
  },
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
