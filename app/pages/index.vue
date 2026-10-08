<script setup lang="ts">
import { LINES, STATION_BY_ID } from '#shared/krl'

useHead({ title: 'Cari stasiun' })

const { favorites, loaded, has } = useFavorites()
const hubs = ['MRI', 'THB', 'JAKK', 'SUD', 'DU', 'BKS'].map(id => STATION_BY_ID[id]!)
</script>

<template>
  <div>
    <section class="hero">
      <h1>Jadwal KRL Jabodetabek</h1>
      <p class="lead">Ketik nama stasiun, atau pilih stasiun di peta, untuk melihat kereta yang akan berangkat.</p>
      <div class="hero__search"><StationSearch /></div>
    </section>

    <div class="map-wrap">
      <div class="map-scroll">
        <KrlMap />
      </div>
    </div>

    <div class="lists section">
      <section>
        <h2>Stasiun transit</h2>
        <ul class="stations">
          <li v-for="s in hubs" :key="s.id">
            <NuxtLink :to="`/stasiun/${s.id}`">
              <span class="stations__tags">
                <LineTag v-for="l in s.lines" :key="l" :line-id="l" size="sm" />
              </span>
              <span class="stations__name">{{ s.name }}<FavStar v-if="loaded && has(s.id)" /></span>
            </NuxtLink>
          </li>
        </ul>
      </section>
      <section>
        <h2>Stasiun favorit</h2>
        <ul v-if="loaded && favorites.length" class="stations">
          <li v-for="id in favorites" :key="id">
            <NuxtLink :to="`/stasiun/${id}`">
              <span class="stations__tags">
                <LineTag v-for="l in STATION_BY_ID[id]!.lines" :key="l" :line-id="l" size="sm" />
              </span>
              <span class="stations__name">{{ STATION_BY_ID[id]!.name }}<FavStar /></span>
            </NuxtLink>
          </li>
        </ul>
        <p v-else class="muted empty">
          Tekan <strong>Simpan</strong> di halaman stasiun yang sering Anda pakai, supaya muncul di sini.
        </p>
      </section>
    </div>

    <section class="section">
      <h2>Jalur</h2>
      <ul class="lines">
        <li v-for="line in LINES" :key="line.id">
          <NuxtLink :to="`/jalur/${line.id}`" :style="{ '--line': line.color }">
            <LineTag :line-id="line.id" size="lg" />
            <span class="lines__body">
              <span class="lines__name">{{ line.name }}</span>
              <span class="muted">{{ line.route }}</span>
            </span>
            <span class="lines__count num muted">{{ line.stations.length }} stasiun</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.hero { padding: 1.5rem 0 0.5rem; }
.hero h1 { margin: 0 0 0.75rem; max-width: 16ch; }
.lead { margin: 0 0 1.5rem; max-width: 44ch; font-size: 1.25rem; line-height: 1.45; color: var(--muted); }
.hero__search { max-width: 520px; }

/* The map runs edge to edge; on narrow screens it scrolls sideways at a readable size. */
.map-wrap { margin: 1.5rem calc(-1 * max(16px, (100vw - 1040px) / 2 + 16px)) 0; }
.map-scroll { overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: thin; }
.map-scroll .map { min-width: 760px; max-width: 1100px; margin: 0 auto; padding: 0 16px; }

.lists { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem 3rem; }
.stations { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.2rem; }
.stations a { display: flex; align-items: center; gap: 0.75rem; padding: 0.35rem 0; text-decoration: none; }
.stations a:hover .stations__name { text-decoration: underline; }
.stations__tags { display: inline-flex; gap: 4px; min-width: 64px; }
.stations__name { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 1.0625rem; font-weight: 500; }
.empty { margin: 0; max-width: 34ch; }
.empty strong { color: var(--text); font-weight: 600; }

.lines { list-style: none; margin: 0; padding: 0; }
.lines li + li { border-top: 1px solid var(--border); }
.lines a { position: relative; display: flex; align-items: center; gap: 1rem; padding: 0.9rem 0; text-decoration: none; }
.lines a:hover .lines__name { text-decoration: underline; text-decoration-color: var(--line); text-decoration-thickness: 3px; text-underline-offset: 4px; }
.lines__body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.lines__name { font-weight: 600; font-size: 1.125rem; }
.lines__count { font-size: 0.875rem; white-space: nowrap; }

@media (max-width: 640px) {
  .lists { grid-template-columns: minmax(0, 1fr); }
  .map-wrap { margin-left: -16px; margin-right: -16px; }
}
</style>
