<script setup lang="ts">
import { STATION_BY_ID, fmtCountdown, fmtTime, lineLabel, minutesUntil } from '#shared/krl'

const route = useRoute()
const id = String(route.params.id).toUpperCase()
const station = STATION_BY_ID[id]
if (!station) throw createError({ statusCode: 404, statusMessage: 'Stasiun tidak ditemukan', fatal: true })

useHead({ title: `Stasiun ${station.name}` })

const { data, refresh, error } = await useFetch(`/api/stations/${id}/departures`, { query: { window: 240 } })
const now = useNow()
const { has, toggle } = useFavorites()

/** Lines are keyed by our line id when known, else by the API's line name. */
const lineKey = (d: { lineId: string | null; lineName: string }) => d.lineId ?? d.lineName

const lineFilter = ref<string | null>(null)
const destFilter = ref<string | null>(null)
const limit = ref(20)

watch(lineFilter, () => { destFilter.value = null; limit.value = 20 })
watch(destFilter, () => { limit.value = 20 })

const all = computed(() =>
  (data.value?.departures ?? [])
    .map(d => ({ ...d, until: minutesUntil(d.time, now.value) }))
    .filter(d => d.until > -0.5)
    .sort((a, b) => a.until - b.until),
)

const lines = computed(() => {
  const seen = new Map<string, { key: string; lineId: string | null; name: string; color: string }>()
  for (const d of all.value) seen.set(lineKey(d), { key: lineKey(d), lineId: d.lineId, name: d.lineName, color: d.color })
  return [...seen.values()]
})
const byLine = computed(() => all.value.filter(d => !lineFilter.value || lineKey(d) === lineFilter.value))
const destinations = computed(() => [...new Set(byLine.value.map(d => d.destinationName))])
const filtered = computed(() => byLine.value.filter(d => !destFilter.value || d.destinationName === destFilter.value))
const next = computed(() => filtered.value[0])
const rest = computed(() => filtered.value.slice(1, limit.value))

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(refresh, 120_000) })
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div>
    <NuxtLink to="/" class="back">← Semua stasiun</NuxtLink>

    <header class="head">
      <div>
        <h1>{{ station!.name }}<FavStar v-if="has(id)" size="0.6em" class="title-star" /></h1>
        <div class="head__meta">
          <span class="code num" title="Kode stasiun KCI">{{ id }}</span>
          <NuxtLink v-for="l in station!.lines" :key="l" :to="`/jalur/${l}`" class="head__line">
            <LineBadge :line-id="l" />
          </NuxtLink>
        </div>
      </div>
      <ClientOnly>
        <button class="btn fav" :aria-pressed="has(id)" @click="toggle(id)">
          <span aria-hidden="true">{{ has(id) ? '★' : '☆' }}</span>
          {{ has(id) ? 'Tersimpan' : 'Simpan' }}
        </button>
      </ClientOnly>
    </header>

    <SourceNote :source="data?.source" />

    <p v-if="error" class="card empty">
      {{ error.statusCode === 502 ? 'API KRL tidak menjawab. Coba lagi sebentar lagi.' : 'Jadwal gagal dimuat.' }}
      <button class="btn" @click="refresh()">Muat ulang</button>
    </p>

    <template v-else>
      <!-- Next departure, drawn as a piece of map: from this station to the destination. -->
      <NuxtLink v-if="next" :to="`/kereta/${next.trainId}?dari=${id}`" class="next" :style="{ '--line': next.color }">
        <p class="next__label">Kereta berikutnya</p>
        <p class="next__eta num" :class="{ soon: next.until < 5 }">{{ fmtCountdown(next.until) }}</p>
        <div class="route" aria-hidden="true">
          <span class="route__stop route__stop--here" />
          <span class="route__line">
            <LineTag :line-id="next.lineId" :name="next.lineName" :color="next.color" size="md" />
          </span>
          <span class="route__stop" />
        </div>
        <div class="route__labels">
          <span><strong>{{ station!.name }}</strong><span class="num">berangkat {{ fmtTime(next.time) }}</span></span>
          <span><strong>{{ next.destinationName }}</strong><span class="num">tiba {{ fmtTime(next.arrivalTime) }}</span></span>
        </div>
        <p class="next__foot muted num">
          <span>{{ lineLabel(next.lineId, next.lineName) }} Line, kereta {{ next.trainId }}</span>
          <span class="next__more">Lihat rute lengkap</span>
        </p>
      </NuxtLink>

      <section class="section">
        <div class="board-head">
          <h2>Keberangkatan berikutnya</h2>
          <div v-if="lines.length > 1" class="chips" role="group" aria-label="Filter jalur">
            <button class="chip" :aria-pressed="lineFilter === null" @click="lineFilter = null">Semua jalur</button>
            <button
              v-for="l in lines"
              :key="l.key"
              class="chip"
              :aria-pressed="lineFilter === l.key"
              @click="lineFilter = l.key"
            >
              <LineTag :line-id="l.lineId" :name="l.name" :color="l.color" size="sm" />{{ lineLabel(l.lineId, l.name) }}
            </button>
          </div>
          <div v-if="destinations.length > 1" class="chips" role="group" aria-label="Filter tujuan">
            <button class="chip" :aria-pressed="destFilter === null" @click="destFilter = null">Semua tujuan</button>
            <button
              v-for="d in destinations"
              :key="d"
              class="chip"
              :aria-pressed="destFilter === d"
              @click="destFilter = d"
            >
              ke {{ d }}
            </button>
          </div>
        </div>

        <ol v-if="rest.length" class="board">
          <li v-for="d in rest" :key="d.trainId + d.time">
            <NuxtLink :to="`/kereta/${d.trainId}?dari=${id}`" class="dep">
              <span class="dep__time num">{{ fmtTime(d.time) }}</span>
              <LineTag :line-id="d.lineId" :name="d.lineName" :color="d.color" labelled />
              <span class="dep__main">
                <span class="dep__dest">{{ d.destinationName }}</span>
                <span class="dep__meta num">
                  <span>Kereta {{ d.trainId }}</span>
                  <span>tiba {{ fmtTime(d.arrivalTime) }}</span>
                </span>
              </span>
              <span class="dep__eta num" :class="{ soon: d.until < 5 }">{{ fmtCountdown(d.until) }}</span>
            </NuxtLink>
          </li>
        </ol>
        <p v-else-if="!next" class="card empty">Tidak ada kereta berangkat dalam 4 jam ke depan. Coba stasiun lain atau cek lagi nanti.</p>
        <button v-if="filtered.length > limit" class="btn more" @click="limit += 20">Tampilkan 20 lagi</button>
      </section>
    </template>
  </div>
</template>

<style scoped>
.head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.75rem; }
.head h1 { margin: 0 0 0.75rem; }
.title-star { margin-left: 0.35em; vertical-align: 0.15em; }
.head__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1rem; }
.head__line { text-decoration: none; }
.head__line:hover { text-decoration: underline; }
.code { padding: 0.1rem 0.5rem; font-size: 0.875rem; font-weight: 700; color: var(--tag-text); background: var(--tag); border-radius: 6px; }
.fav { flex: none; }
.fav[aria-pressed='true'] { color: var(--soon); border-color: currentColor; }

/* Next departure as a map fragment. */
.next { display: block; max-width: 680px; text-decoration: none; }
.next__label { margin: 0; color: var(--muted); }
.next__eta { margin: 0.1rem 0 1.25rem; font-size: clamp(3rem, 10vw, 4.75rem); font-weight: 600; line-height: 1; letter-spacing: -0.02em; }
.next__eta.soon { color: var(--soon); }
.route { display: flex; align-items: center; }
.route__line {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--line-w);
  margin: 0 -2px;
  background: var(--line);
}
.route__stop { position: relative; z-index: 1; width: 22px; height: 22px; border-radius: 50%; background: var(--surface); border: 4px solid var(--line); }
.route__stop--here { border-color: var(--text); }
.route__labels { display: flex; justify-content: space-between; gap: 1rem; margin-top: 0.6rem; }
.route__labels > span { display: flex; flex-direction: column; }
.route__labels > span:last-child { text-align: right; }
.route__labels strong { font-size: 1.25rem; font-weight: 600; }
.route__labels .num { color: var(--muted); }
.next__foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.25rem 1rem; margin: 1rem 0 0; font-size: 0.9375rem; }
.next__more { color: var(--text); text-decoration: underline; text-underline-offset: 3px; }
.next:hover .next__more { text-decoration-thickness: 2px; }

.board-head { display: grid; gap: 0.6rem; margin-bottom: 0.75rem; }
.board-head h2 { margin: 0 0 0.25rem; }

.board { list-style: none; margin: 0; padding: 0; }
.board li { border-bottom: 1px solid var(--border); }
.dep {
  display: grid;
  grid-template-columns: 3.4rem auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 0.25rem;
  text-decoration: none;
}
.dep:hover { background: var(--surface-2); }
.dep:hover .dep__dest { text-decoration: underline; }
.dep__time { font-size: 1.25rem; font-weight: 600; }
.dep__main { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.dep__dest { font-size: 1.125rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dep__meta { display: flex; flex-wrap: wrap; gap: 0 0.9rem; font-size: 0.875rem; color: var(--muted); }
.dep__eta { font-size: 1.0625rem; font-weight: 600; text-align: right; white-space: nowrap; }
.dep__eta.soon { color: var(--soon); }

.more { display: flex; margin: 1rem auto 0; }
.empty { display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; padding: 1.25rem; color: var(--muted); }

@media (max-width: 480px) {
  .dep { grid-template-columns: 3rem auto minmax(0, 1fr) auto; gap: 0.6rem; }
  .dep__time { font-size: 1.0625rem; }
  .route__labels strong { font-size: 1.0625rem; }
}
</style>
