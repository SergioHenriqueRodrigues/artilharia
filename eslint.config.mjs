import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: ['app/components/ui/**', 'app/types/database.types.ts'],
})
