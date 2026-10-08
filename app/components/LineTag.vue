<script setup lang="ts">
import { LINE_BY_ID, lineCode, lineInk, lineLabel } from '#shared/krl'

/**
 * Line marker as drawn on a transit map: a small rounded tag in the line colour
 * carrying the line code (B, C, R, T, TP). Decorative unless `labelled` is set.
 */
const props = withDefaults(defineProps<{
  lineId: string | null
  name?: string
  color?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  labelled?: boolean
}>(), { size: 'md' })

const code = computed(() => lineCode(props.lineId, props.name))
const bg = computed(() => (props.lineId ? LINE_BY_ID[props.lineId]!.color : props.color ?? '#9aa3ae'))
const label = computed(() => (props.lineId ? LINE_BY_ID[props.lineId]!.name : `${lineLabel(null, props.name)} Line`))
</script>

<template>
  <span
    class="tag"
    :class="`tag--${size}`"
    :style="{ background: bg, color: lineInk(lineId, bg) }"
    :role="labelled ? 'img' : undefined"
    :aria-label="labelled ? label : undefined"
    :aria-hidden="labelled ? undefined : 'true'"
    :title="labelled ? label : undefined"
  >{{ code }}</span>
</template>

<style scoped>
.tag {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.9em;
  height: 1.5em;
  padding: 0 0.35em;
  border-radius: 0.3em;
  font-family: 'Jost', sans-serif;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.01em;
}
.tag--sm { font-size: 0.75rem; }
.tag--md { font-size: 0.875rem; }
.tag--lg { font-size: 1.125rem; }
.tag--xl { font-size: 1.75rem; }
</style>
