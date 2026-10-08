<script setup lang="ts">
/**
 * Peron mark: two KRL lines (Bogor red, Cikarang blue) crossing at an interchange,
 * drawn like the map — rounded caps, rounded bends, white station node.
 * Keep in sync with public/favicon.svg.
 */
withDefaults(defineProps<{ size?: number | string }>(), { size: 28 })
</script>

<template>
  <svg class="logo" viewBox="0 0 32 32" :width="size" :height="size" aria-hidden="true">
    <path d="M3 25H6Q9.5 25 9.5 21.5V14Q9.5 10.5 13 10.5H29" stroke="#E30A16" />
    <path d="M18 10.5V21.5Q18 25 21.5 25H29" stroke="#0084D8" />
    <circle cx="18" cy="10.5" r="4.3" class="node" />
  </svg>
</template>

<style scoped>
.logo { flex: none; display: block; }
.logo path { fill: none; stroke-width: 4.2; stroke-linecap: round; stroke-linejoin: round; }
.node { fill: var(--surface); stroke: var(--text); stroke-width: 2.2; }
</style>
