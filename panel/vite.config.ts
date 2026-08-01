import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// Every asset used to be emitted as `webview.[ext]`, so all the fonts collided on the same
// name and Rollup disambiguated them with a counter (webview2.woff, webview3.woff, ...).
// That counter follows the emission order, which is not stable between builds, so the fonts
// kept swapping filenames and every build showed up as a diff. Naming each asset after its
// source file keeps the output byte-for-byte identical when nothing changed.
const assetName = (asset: { names?: string[]; name?: string }) => {
  const source = asset.names?.[0] ?? asset.name ?? ''
  return source.endsWith('.css') ? 'webview.css' : 'webview-[name][extname]'
}

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
    // `media` only ever holds the build output, so wiping it keeps assets that are no longer
    // referenced (renamed fonts, dropped subsets) from piling up in the repository.
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: './src/main.tsx',
      output: {
        entryFileNames: 'webview.js',
        assetFileNames: assetName,
        format: 'iife',
        manualChunks: undefined,
      },
    },
  },
})
