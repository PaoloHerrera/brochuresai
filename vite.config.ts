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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id) return undefined
          if (id.includes('node_modules')) {
            // Agrupar toda la familia React en un solo chunk para evitar ciclos
            const isReactFamily = /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id) || id.includes('react/jsx-runtime')
            if (isReactFamily) return 'react-vendor'
            if (id.includes('@heroui')) return 'heroui'
            if (id.includes('lucide-react')) return 'icons'
            // vendor genérico para el resto de node_modules
            return 'vendor'
          }
          return undefined
        },
      },
    },
  },
})
