<script setup lang="ts">
import { LINE_BY_ID, fmtTime } from '#shared/krl'

export interface TrackStop {
  stationId: string | null
  name: string
  /** Other line ids reachable here; drawn as roundels under the node. */
  transfers?: string[]
  /** WIB minutes; shown under the node when set (train view). */
  time?: number
  passed?: boolean
  next?: boolean
  here?: boolean
  turn?: boolean
}

/** Horizontal line diagram: rail, station nodes, slanted names; scrolls sideways when long. */
const props = defineProps<{
  stops: TrackStop[]
  color: string
  label: string
  compact?: boolean
  /** Stop index to scroll into the middle of the view (e.g. the train's next stop). */
  focus?: number
}>()

const { has } = useFavorites()
const track = ref<HTMLElement>()
const items = ref<HTMLElement[]>([])

function scrollToFocus(behavior: ScrollBehavior) {
  const el = props.focus != null && props.focus >= 0 ? items.value[props.focus] : undefined
  if (!track.value || !el) return
  track.value.scrollTo({ left: el.offsetLeft - track.value.clientWidth / 2 + el.offsetWidth / 2, behavior })
}

onMounted(() => scrollToFocus('instant'))
watch(() => props.focus, () => scrollToFocus('smooth'))

const hasTimes = computed(() => props.stops.some(s => s.time != null))
</script>

<template>
  <div
    ref="track"
    class="track"
    :class="{ compact, timed: hasTimes }"
    :style="{ '--line': color }"
    tabindex="0"
    :aria-label="label"
  >
    <ol class="stations">
      <li
        v-for="(s, i) in stops"
        :key="i"
        ref="items"
        :class="{
          terminal: i === 0 || i === stops.length - 1,
          transfer: !!s.transfers?.length,
          passed: s.passed,
          next: s.next,
        }"
      >
        <NuxtLink v-if="s.stationId" :to="`/stasiun/${s.stationId}`" class="name">{{ s.name }}<FavStar v-if="has(s.stationId)" size="0.95em" class="name__star" /></NuxtLink>
        <span v-else class="name">{{ s.name }}</span>
        <span class="node" aria-hidden="true" />
        <span class="below">
          <span v-if="s.time != null" class="time num">{{ fmtTime(s.time) }}</span>
          <span v-if="s.here" class="here">Anda</span>
          <NuxtLink v-for="l in s.transfers" :key="l" :to="`/jalur/${l}`" :title="`Transit ke ${LINE_BY_ID[l]!.name}`">
            <LineTag :line-id="l" size="sm" labelled />
          </NuxtLink>
          <span v-if="s.turn" class="turn" title="Sebagian KA berbalik di sini">↩</span>
        </span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.track {
  position: relative;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  padding: 0 0.25rem;
}
.stations {
  --rail-y: 168px;
  --below: 64px;
  --step: 58px;
  display: flex;
  width: max-content;
  margin: 0;
  padding: 0 5.5rem 0 0;
  list-style: none;
}
.timed .stations { --below: 84px; }
.compact .stations { --rail-y: 128px; --below: 44px; --step: 46px; padding-right: 4.5rem; }

.stations li {
  position: relative;
  flex: none;
  width: var(--step);
  height: calc(var(--rail-y) + var(--below));
}
/* rail segment */
.stations li::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: calc(var(--rail-y) - var(--line-w) / 2);
  height: var(--line-w);
  background: var(--line);
}
.stations li:first-child::before { left: calc(50% - var(--line-w) / 2); border-radius: 999px 0 0 999px; }
.stations li:last-child::before { right: calc(50% - var(--line-w) / 2); border-radius: 0 999px 999px 0; }
.compact .stations { --line-w: 8px; }

/* stretch already travelled */
.stations li.passed::before { background: color-mix(in srgb, var(--line) 30%, var(--bg)); }
.stations li.next::before {
  background: linear-gradient(90deg, color-mix(in srgb, var(--line) 30%, var(--bg)) 50%, var(--line) 50%);
}

.node {
  position: absolute;
  z-index: 1;
  left: 50%;
  top: var(--rail-y);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--surface);
  border: 4px solid var(--line);
  transform: translate(-50%, -50%);
}
.transfer .node { width: 22px; height: 22px; border-color: var(--text); }
.terminal .node { width: 26px; height: 26px; border-width: 6px; }
.compact .node { width: 14px; height: 14px; border-width: 3px; }
.compact .transfer .node { width: 18px; height: 18px; }
.compact .terminal .node { width: 20px; height: 20px; border-width: 5px; }
.passed .node { border-color: color-mix(in srgb, var(--line) 35%, var(--bg)); }
.next .node {
  width: 26px;
  height: 26px;
  background: var(--line);
  border-color: var(--surface);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--line) 30%, transparent);
}

.name {
  position: absolute;
  left: 50%;
  bottom: calc(100% - var(--rail-y) + 18px);
  transform-origin: 0 100%;
  transform: rotate(-45deg);
  font-size: 0.9375rem;
  font-weight: 500;
  white-space: nowrap;
  text-decoration: none;
}
a.name:hover { color: var(--line); text-decoration: underline; }
.name__star { margin-left: 0.3em; }
.terminal .name, .next .name { font-weight: 700; font-size: 1rem; }
.passed .name { color: var(--muted); }
.compact .name { bottom: calc(100% - var(--rail-y) + 14px); font-size: 0.75rem; }
.compact .terminal .name { font-size: 0.8rem; }

.below {
  position: absolute;
  left: 50%;
  top: calc(var(--rail-y) + 18px);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.compact .below { top: calc(var(--rail-y) + 14px); }
.below a { display: flex; text-decoration: none; }
.time { font-size: 0.875rem; font-weight: 600; }
.passed .time { color: var(--muted); font-weight: 400; }
.next .time { color: var(--soon); }
.here {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.05rem 0.4rem;
  border-radius: var(--radius);
  color: var(--bg);
  background: var(--text);
}
.turn { font-weight: 700; font-size: 0.9rem; color: var(--muted); line-height: 1; }

@media (max-width: 480px) {
  .stations { --rail-y: 150px; --step: 50px; }
  .compact .stations { --rail-y: 120px; --step: 42px; }
  .name { font-size: 0.8rem; }
  .terminal .name, .next .name { font-size: 0.875rem; }
}
</style>
