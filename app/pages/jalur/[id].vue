<script setup lang="ts">
import { LINE_BY_ID, STATION_BY_ID, lineStations } from '#shared/krl'

const route = useRoute()
const line = LINE_BY_ID[String(route.params.id)]
if (!line) throw createError({ statusCode: 404, statusMessage: 'Jalur tidak ditemukan', fatal: true })

useHead({ title: line.name })

const toStop = (id: string) => ({
  stationId: id,
  name: STATION_BY_ID[id]!.name,
  transfers: STATION_BY_ID[id]!.lines.filter(l => l !== line.id),
  turn: line.shortTurn?.at === id,
})
const stops = line.stations.map(toStop)
/** Branch patterns, drawn over just the stretch only they serve. */
const branches = (line.branches ?? []).map(b => ({ name: b.name, headwayPeak: b.headwayPeak, headwayOff: b.headwayOff, stops: b.own.map(toStop) }))
const stationCount = lineStations(line).length
</script>

<template>
  <div :style="{ '--line': line!.color }">
    <NuxtLink to="/jalur" class="back">← Semua jalur</NuxtLink>

    <header class="head">
      <LineTag :line-id="line!.id" size="xl" labelled />
      <div>
        <h1>{{ line!.name }}</h1>
        <p class="route muted">{{ line!.route }}</p>
      </div>
    </header>
    <dl class="facts">
      <div><dt>Stasiun</dt><dd class="num">{{ stationCount }}</dd></div>
      <div><dt>Jam sibuk, tiap</dt><dd class="num">{{ line!.headwayPeak }} mnt</dd></div>
      <div><dt>Di luar jam sibuk, tiap</dt><dd class="num">{{ line!.headwayOff }} mnt</dd></div>
    </dl>

    <section class="section">
      <div class="track-head">
        <h2>Peta jalur</h2>
        <p v-if="stops.length > 12" class="muted hint">Geser peta ke samping untuk melihat semua stasiun</p>
      </div>
      <LineTrack :stops="stops" :color="line!.color" :label="`Peta ${line!.name}, ${stops.length} stasiun`" />
      <ul class="legend muted">
        <li><span class="legend__node" /> Stasiun transit, tag di bawahnya = jalur yang bisa disambung</li>
        <li v-if="line!.shortTurn"><span class="turn">↩</span> Sebagian KA berbalik di {{ STATION_BY_ID[line!.shortTurn.at]!.name }}</li>
      </ul>
    </section>

    <section v-for="b in branches" :key="b.name" class="section">
      <div class="track-head">
        <h2>Lintas {{ b.name }}</h2>
        <p class="muted hint">Tiap {{ b.headwayPeak }} mnt di jam sibuk, {{ b.headwayOff }} mnt di luar jam sibuk</p>
      </div>
      <LineTrack :stops="b.stops" :color="line!.color" :label="`Lintas ${b.name}, ${b.stops.length} stasiun`" />
    </section>
  </div>
</template>

<style scoped>
.head { display: flex; align-items: center; gap: 1.1rem; }
.head h1 { margin: 0; }
.route { margin: 0.3rem 0 0; font-size: 1.125rem; }
.facts { display: flex; flex-wrap: wrap; gap: 0.5rem 2.5rem; margin: 1.5rem 0 0; }
.facts dt { font-size: 0.875rem; color: var(--muted); }
.facts dd { margin: 0; font-size: 1.5625rem; font-weight: 600; }

.track-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0 1rem; }
.hint { margin: 0 0 0.9rem; font-size: 0.8rem; }

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin: 0.9rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.8rem;
}
.legend li { display: flex; align-items: center; gap: 0.5rem; }
.legend__node { width: 16px; height: 16px; border-radius: 50%; border: 3px solid var(--text); background: var(--surface); }
.turn { font-weight: 700; font-size: 0.9rem; line-height: 1; }
</style>
