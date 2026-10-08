<script setup lang="ts">
import { lineLabel } from '#shared/krl'

/** Line tag + short line name. Pass a known `lineId`, or the API's `name` + `color` for unknown lines. */
const props = defineProps<{ lineId: string | null; name?: string; color?: string; size?: 'sm' | 'md' }>()
const label = computed(() => lineLabel(props.lineId, props.name))
</script>

<template>
  <span class="badge" :class="{ 'badge--sm': size === 'sm' }">
    <LineTag :line-id="lineId" :name="name" :color="color" :size="size === 'sm' ? 'sm' : 'md'" />
    {{ label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  color: inherit;
}
.badge--sm { font-size: 0.8125rem; }
</style>
