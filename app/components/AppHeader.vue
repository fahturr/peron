<script setup lang="ts">
import { fmtTime } from '#shared/krl'

const now = useNow()
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <NuxtLink to="/" class="brand">
        <AppLogo :size="28" />
        <span>Peron</span>
      </NuxtLink>
      <nav class="nav">
        <NuxtLink to="/">Stasiun</NuxtLink>
        <NuxtLink to="/jalur">Jalur</NuxtLink>
      </nav>
      <ClientOnly>
        <ThemeToggle />
        <template #fallback><span class="toggle-slot" aria-hidden="true" /></template>
      </ClientOnly>
      <div class="clock num" aria-label="Waktu sekarang">
        {{ fmtTime(now) }} <span>WIB</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in srgb, var(--bg) 90%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}
.header__inner { display: flex; align-items: center; gap: 1.25rem; height: 60px; }
.brand { display: flex; align-items: center; gap: 0.55rem; font-size: 1.25rem; font-weight: 700; letter-spacing: -0.01em; text-decoration: none; }
.toggle-slot { display: inline-block; width: 100px; height: 36px; }
.nav { display: flex; gap: 1.25rem; margin-left: auto; }
.nav a {
  padding: 0.3rem 0;
  color: var(--muted);
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  border-bottom: 3px solid transparent;
}
.nav a:hover { color: var(--text); }
.nav a.router-link-exact-active,
.nav a[href='/jalur'].router-link-active { color: var(--text); border-bottom-color: var(--text); }
/* Styled like the grey line tags on the map. */
.clock {
  padding: 0.2rem 0.55rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--tag-text);
  background: var(--tag);
  border-radius: 6px;
}
.clock span { font-size: 0.7em; font-weight: 600; }
@media (max-width: 560px) {
  .header__inner { gap: 0.75rem; }
  .brand span { display: none; }
  .nav { gap: 0.9rem; }
}
@media (max-width: 400px) {
  .clock span { display: none; }
}
</style>
