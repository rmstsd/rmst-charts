import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'

import buildTime from './vite-plugins/vite-plugin-build-time'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'rmst-charts': path.resolve(__dirname, '../rmst-charts/src'),
      'rmst-render': path.resolve(__dirname, '../rmst-render/src')
    }
  },
  server: { port: 5400 },
  plugins: [
    react({
      // 取消HMR
      exclude: '**/*.tsx'
    }),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    buildTime()
  ]
})
