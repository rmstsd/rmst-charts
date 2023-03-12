import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    react({
      // 取消HMR
      exclude: '**/*.tsx'
    }),
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
})
