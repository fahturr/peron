<script setup lang="ts">
import { STATION_BY_ID, fmtCountdown, minutesUntil } from '#shared/krl'

const route = useRoute()
const id = String(route.params.id)
const from = typeof route.query.dari === 'string' ? route.query.dari : null

const { data, error } = await useFetch(`/api/trains/${encodeURIComponent(id)}`)
if (!data.value) {
  throw createError({
    statusCode: error.value?.statusCode ?? 404,
    statusMessage: error.value?.statusMessage ?? 'Kereta tidak ditemukan',
    fatal: true,
  })
}

const train = data.value.train
const origin = train.stops[0]!
const destination = train.stops.at(-1)!
useHead({ title: `KA ${id} ke ${destination.stationName}` })

const now = useNow()

const stops = computed(() => train.stops.map(s => ({
  ...s,
  until: minutesUntil(s.time, now.value),
  transfers: s.stationId ? STATION_BY_ID[s.stationId]!.lines.filter(l => l !== train.lineId) : [],
})))

/** Index of the next stop the train hasn't left yet; -1 when the trip is over. */
const nextIdx = computed(() => stops.value.findIndex(s => s.until >= 0))

const trackStops = computed(() => stops.value.map((s, i) => ({
  stationId: s.stationId,
  name: s.stationName,
  time: s.time,
  transfers: s.transfers,
  passed: s.until < 0,
  next: i === nextIdx.value,
  here: !!s.stationId && s.stationId === from,
})))

const status = computed(() => {
  const first = stops.value[0]!.until
  if (first > 0) return `Berangkat dari ${origin.stationName} dalam ${fmtCountdown(first)}`
  if (nextIdx.value === -1) return `Sudah tiba di ${destination.stationName}`
  const s = stops.value[nextIdx.value]!
  return `Menuju ${s.stationName}, ${s.until < 1 ? 'tiba sekarang' : `${fmtCountdown(s.until)} lagi`}`
})
</script>

<template>
  <div :style="{ '--line': train.color }">
    <NuxtLink :to="from ? `/stasiun/${from}` : '/'" class="back">
      ← {{ from && STATION_BY_ID[from] ? STATION_BY_ID[from]!.name : 'Beranda' }}
    </NuxtLink>

    <SourceNote :source="data!.source" />

    <header class="head">
      <div class="head__line">
        <LineTag :line-id="train.lineId" :name="train.lineName" :color="train.color" size="lg" labelled />
        <span class="muted num">Kereta {{ id }}</span>
      </div>
      <h1>{{ origin.stationName }} – {{ destination.stationName }}</h1>
      <p class="status"><span class="pulse" aria-hidden="true" />{{ status }}</p>
    </header>

    <section class="section">
      <h2>Rute perjalanan</h2>
      <LineTrack
        :stops="trackStops"
        :color="train.color"
        :label="`Rute KA ${id}, ${stops.length} stasiun`"
        :focus="nextIdx >= 0 ? nextIdx : undefined"
      />
    </section>
  </div>
</template>

<style scoped>
.head { margin-bottom: 0.5rem; }
.head__line { display: flex; align-items: center; gap: 0.75rem; }
.head h1 { margin: 0.75rem 0 0.6rem; }
.status { display: flex; align-items: center; gap: 0.7rem; margin: 0; font-size: 1.25rem; font-weight: 500; }
.pulse { flex: none; width: 12px; height: 12px; border-radius: 50%; background: var(--line); animation: pulse 1.8s infinite; }
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--line) 55%, transparent); }
  100% { box-shadow: 0 0 0 10px transparent; }
}
</style>
