import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Testes só da lógica pura (app/utils), sem precisar subir o Nuxt.
export default defineConfig({
  resolve: {
    alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
})
