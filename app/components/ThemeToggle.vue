<script setup lang="ts">
import type { ThemeChoice } from '~/composables/useTheme'

const { theme, set } = useTheme()

const options: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'Ikuti sistem' },
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
]
</script>

<template>
  <div class="toggle" role="radiogroup" aria-label="Tema tampilan">
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      role="radio"
      :aria-checked="theme === o.value"
      :aria-label="o.label"
      :title="o.label"
      @click="set(o.value)"
    >
      <svg v-if="o.value === 'system'" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        <rect x="2.5" y="3.5" width="15" height="10" rx="2" />
        <path d="M7 17h6M10 13.5V17" />
      </svg>
      <svg v-else-if="o.value === 'light'" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        <circle cx="10" cy="10" r="3.5" />
        <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6 16 16M4 16l1.4-1.4M14.6 5.4 16 4" />
      </svg>
      <svg v-else viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        <path d="M16.5 12.5A7 7 0 0 1 7.5 3.5a7 7 0 1 0 9 9Z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.toggle { display: inline-flex; padding: 3px; gap: 2px; background: var(--surface-2); border-radius: 999px; }
button {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  color: var(--muted);
  background: transparent;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}
button:hover { color: var(--text); }
button[aria-checked='true'] { color: var(--bg); background: var(--text); }
svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
</style>
