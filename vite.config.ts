import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({

  plugins: [react(), tailwindcss(), visualizer({ filename: 'dist/stats.html', template: 'treemap', gzipSize: true, brotliSize: true })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  build: {
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@heroui')) return 'vendor-heroui'
            if (id.includes('react-slick') || id.includes('slick-carousel')) return 'vendor-slick'
            if (id.includes('axios')) return 'vendor-axios'
            // Removed explicit vendor-react split to avoid runtime issues with React resolution
          }
        },
      },
    },
  },
})
