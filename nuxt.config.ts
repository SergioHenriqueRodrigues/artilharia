import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  devtools: { enabled: true },

  // SPA estática: publicada no Cloudflare Pages a partir de `nuxt generate`.
  ssr: false,

  modules: [
    '@nuxtjs/supabase',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    'shadcn-nuxt',
  ],

  css: ['~/assets/css/main.css', 'vue-sonner/style.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Artilharia',
      meta: [
        { name: 'description', content: 'Artilharia e times da pelada de quarta-feira.' },
        { name: 'theme-color', content: '#16a34a' },
      ],
    },
  },

  supabase: {
    types: '~/types/database.types.ts',
    // A tela pública não exige login; só /admin é protegido.
    redirectOptions: {
      login: '/admin/login',
      callback: '/admin',
      include: ['/admin(/*)?'],
      exclude: ['/admin/login'],
      saveRedirectToCookie: true,
    },
  },

  colorMode: {
    classSuffix: '',
  },

  icon: {
    serverBundle: false,
    clientBundle: { scan: true },
  },

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },
})
