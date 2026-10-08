export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  // Server-only; set via NUXT_KRL_API_BASE / NUXT_KRL_API_TOKEN. Empty → simulated schedule.
  runtimeConfig: {
    krlApiBase: '',
    krlApiToken: '',
  },
  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Peron',
      titleTemplate: '%s · Peron',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Peron: jadwal keberangkatan KRL Commuter Line Jabodetabek secara real-time.' },
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#12161b', media: '(prefers-color-scheme: dark)' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap' },
      ],
      // Apply a saved light/dark choice before first paint (see app/composables/useTheme.ts).
      script: [
        { innerHTML: "try{var t=localStorage.getItem('peron:theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}", tagPosition: 'head' },
      ],
    },
  },
})
