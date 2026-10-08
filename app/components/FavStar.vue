<script setup lang="ts">
/** Marks a station the reader saved as favourite. */
withDefaults(defineProps<{ size?: string }>(), { size: '1em' })
</script>

<template>
  <svg class="fav-star" viewBox="0 0 20 20" :width="size" :height="size" role="img" aria-label="Stasiun favorit">
    <title>Stasiun favorit</title>
    <path d="M10 1.8l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.4l-4.94 2.6.94-5.5-4-3.9 5.53-.8z" />
  </svg>
</template>

<style scoped>
.fav-star { flex: none; display: inline-block; vertical-align: -0.1em; }
.fav-star path { fill: var(--fav); stroke: var(--fav); stroke-width: 1.2; stroke-linejoin: round; }
</style>
