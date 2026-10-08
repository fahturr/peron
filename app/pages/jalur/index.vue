<script setup lang="ts">
import { LINES, STATION_BY_ID } from '#shared/krl'

useHead({ title: 'Jalur' })

const lines = LINES.map(line => ({
  line,
  stops: line.stations.map(id => ({
    stationId: id,
    name: STATION_BY_ID[id]!.name,
    transfers: STATION_BY_ID[id]!.lines.filter(l => l !== line.id),
    turn: line.shortTurn?.at === id,
  })),
}))
</script>

<template>
  <div>
    <h1>Jalur KRL</h1>
    <p class="lead muted">Lima jalur KRL Commuter Line di Jabodetabek. Tag di bawah stasiun menunjukkan jalur lain yang bisa disambung di sana.</p>
    <ul class="list">
      <li v-for="{ line, stops } in lines" :key="line.id" :style="{ '--line': line.color }">
        <NuxtLink :to="`/jalur/${line.id}`" class="row">
          <LineTag :line-id="line.id" size="lg" />
          <span class="body">
            <span class="name">{{ line.name }}</span>
            <span class="muted route">
              {{ STATION_BY_ID[line.stations[0]!]!.name }} ⇄ {{ STATION_BY_ID[line.stations.at(-1)!]!.name }}
            </span>
          </span>
          <span class="num muted count">{{ line.stations.length }} stasiun</span>
        </NuxtLink>
        <LineTrack :stops="stops" :color="line.color" :label="`Peta ${line.name}`" compact />
      </li>
    </ul>
  </div>
</template>

<style scoped>
h1 { margin: 0 0 0.75rem; }
.lead { margin: 0 0 2.5rem; max-width: 60ch; font-size: 1.0625rem; }
.list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 2rem; }
.row { display: flex; align-items: center; gap: 0.9rem; margin-bottom: 0.75rem; text-decoration: none; }
.row:hover .name { color: var(--line); text-decoration: underline; }
.body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.name { font-weight: 600; font-size: 1.25rem; }
.route { font-size: 0.875rem; }
.count { font-size: 0.8rem; white-space: nowrap; }
</style>
