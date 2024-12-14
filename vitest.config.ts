/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    env: {
      OPENAI_API_KEY: 'test-key'
    },
    css: true,
    environmentOptions: {
      jsdom: {
        resources: 'usable'
      }
    },
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  resolve: {
    conditions: ['development', 'browser']
  }
})
