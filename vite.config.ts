import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
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
