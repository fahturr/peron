<script setup lang="ts">
import { LINE_BY_ID, STATION_BY_ID, lineCode, lineInk } from '#shared/krl'

/**
 * Schematic map of the five KRL lines in a regional-rail-map style: octilinear
 * lines with rounded bends, line codes on tags, rivers and region borders as
 * pale background geography. Station names link to their departure boards.
 * Geography is schematic, not to scale.
 */
type Pt = [number, number]

/** Polyline with every bend rounded off by a quadratic curve of radius `r`. */
function roundPath(pts: Pt[], r = 28): string {
  let d = `M${pts[0]![0]},${pts[0]![1]}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1]!
    const [cx, cy] = pts[i]!
    const [nx, ny] = pts[i + 1]!
    const l1 = Math.hypot(cx - px, cy - py)
    const l2 = Math.hypot(nx - cx, ny - cy)
    const r1 = Math.min(r, l1 / 2)
    const r2 = Math.min(r, l2 / 2)
    d += ` L${cx - ((cx - px) / l1) * r1},${cy - ((cy - py) / l1) * r1}`
    d += ` Q${cx},${cy} ${cx + ((nx - cx) / l2) * r2},${cy + ((ny - cy) / l2) * r2}`
  }
  const [lx, ly] = pts.at(-1)!
  return `${d} L${lx},${ly}`
}

const lines = [
  { id: 'rangkasbitung', pts: [[316, 250], [316, 340], [236, 420], [236, 520], [40, 520]] as Pt[], tag: [276, 380, -45], r: 28 },
  { id: 'tangerang', pts: [[330, 160], [160, 160], [100, 220]] as Pt[], tag: [245, 160, 0], r: 28 },
  // Cikarang loop, as on the official map: Kampung Bandan west and down via Duri to Tanah Abang,
  // east along Sudirman–Manggarai to Jatinegara ...
  { id: 'cikarang', pts: [[430, 90], [330, 90], [330, 290], [800, 290]] as Pt[], tag: [680, 290, 0], r: 28 },
  // ... and Kampung Bandan east along the top, down through Jatinegara, then a diagonal east to Bekasi and Cikarang.
  { id: 'cikarang', key: 'cikarang-loop', pts: [[430, 90], [800, 90], [800, 320], [880, 400], [1050, 400]] as Pt[], tag: [620, 90, 0], r: 28 },
  // Jakarta Kota up through Kampung Bandan, then along the top to Tanjung Priok.
  { id: 'tanjung-priok', pts: [[430, 150], [430, 70], [460, 40], [900, 40]] as Pt[], tag: [760, 40, 0], r: 28 },
  // Jakarta Kota east, then south through Manggarai to Bogor.
  { id: 'bogor', pts: [[430, 150], [530, 150], [530, 612]] as Pt[], tag: [530, 380, 0], r: 28 },
].map(l => {
  const color = LINE_BY_ID[l.id]!.color
  return { ...l, d: roundPath(l.pts, l.r), color, code: lineCode(l.id), ink: lineInk(l.id, color) }
})

const rivers = [
  { name: 'Cisadane', d: roundPath([[250, 660], [250, 560], [160, 470], [160, 300], [120, 260], [120, 0]], 40), label: [266, 618, -90] },
  { name: 'Ciliwung', d: roundPath([[575, 660], [575, 420], [555, 400], [555, 200], [590, 165], [590, 0]], 40), label: [592, 560, -90] },
  { name: 'Kali Bekasi', d: roundPath([[860, 660], [860, 460], [890, 430], [890, 0]], 40), label: [876, 580, -90] },
]

const borders = [
  roundPath([[230, 0], [230, 350], [850, 350], [850, 0]], 48),
  roundPath([[380, 660], [380, 562], [700, 562], [700, 660]], 48),
]

const regions = [
  { name: 'Jakarta', x: 665, y: 200 },
  { name: 'Tangerang', x: 120, y: 340 },
  { name: 'Depok', x: 440, y: 470 },
  { name: 'Bogor', x: 440, y: 625 },
  { name: 'Bekasi', x: 960, y: 510 },
]

type Station = { id: string; x: number; y: number; lx: number; ly: number; anchor?: 'start' | 'middle' | 'end'; kind?: 'interchange' | 'terminal'; line?: string; pill?: [number, number, number] }
const stations: Station[] = [
  { id: 'KPB', x: 430, y: 90, lx: 444, ly: 78, kind: 'interchange' },
  { id: 'JAKK', x: 430, y: 150, lx: 430, ly: 177, anchor: 'middle', kind: 'interchange' },
  { id: 'DU', x: 330, y: 160, lx: 344, ly: 165, kind: 'interchange' },
  { id: 'THB', x: 323, y: 250, lx: 350, ly: 255, kind: 'interchange', pill: [307, 241, 32] },
  { id: 'KBY', x: 316, y: 320, lx: 302, ly: 325, anchor: 'end', line: 'rangkasbitung' },
  { id: 'SUD', x: 430, y: 290, lx: 430, ly: 314, anchor: 'middle', line: 'cikarang' },
  { id: 'MRI', x: 530, y: 290, lx: 542, ly: 279, kind: 'interchange' },
  { id: 'PSE', x: 800, y: 180, lx: 814, ly: 185, line: 'cikarang' },
  { id: 'JNG', x: 800, y: 290, lx: 814, ly: 295, kind: 'interchange' },
  { id: 'BKS', x: 935, y: 400, lx: 935, ly: 425, anchor: 'middle', line: 'cikarang' },
  { id: 'CKR', x: 1050, y: 400, lx: 1056, ly: 425, anchor: 'end', kind: 'terminal', line: 'cikarang' },
  { id: 'DP', x: 530, y: 470, lx: 544, ly: 475, line: 'bogor' },
  { id: 'BOO', x: 530, y: 612, lx: 544, ly: 617, kind: 'terminal', line: 'bogor' },
  { id: 'AC', x: 620, y: 40, lx: 620, ly: 24, anchor: 'middle', line: 'tanjung-priok' },
  { id: 'TPK', x: 900, y: 40, lx: 900, ly: 24, anchor: 'middle', kind: 'terminal', line: 'tanjung-priok' },
  { id: 'TNG', x: 100, y: 220, lx: 100, ly: 246, anchor: 'middle', kind: 'terminal', line: 'tangerang' },
  { id: 'SRP', x: 236, y: 460, lx: 250, ly: 465, line: 'rangkasbitung' },
  { id: 'PRP', x: 130, y: 520, lx: 130, ly: 504, anchor: 'middle', line: 'rangkasbitung' },
  { id: 'RK', x: 40, y: 520, lx: 34, ly: 546, kind: 'terminal', line: 'rangkasbitung' },
]
const stationName = (id: string) => STATION_BY_ID[id]!.name
const { has } = useFavorites()
</script>

<template>
  <svg class="map" viewBox="0 0 1080 660" role="group" aria-label="Peta skematik jalur KRL Jabodetabek">
    <g class="geo" aria-hidden="true">
      <path v-for="(b, i) in borders" :key="`b${i}`" :d="b" class="border" />
      <path v-for="r in rivers" :key="r.name" :d="r.d" class="river" />
      <text v-for="r in rivers" :key="`t${r.name}`" :transform="`translate(${r.label[0]} ${r.label[1]}) rotate(${r.label[2]})`" class="river-name">{{ r.name }}</text>
      <text v-for="g in regions" :key="g.name" :x="g.x" :y="g.y" class="region-name">{{ g.name }}</text>
    </g>

    <g class="lines">
      <path v-for="l in lines" :key="l.key ?? l.id" :d="l.d" :stroke="l.color" class="line" />
    </g>

    <g class="tags" aria-hidden="true">
      <g v-for="l in lines" :key="`tag-${l.key ?? l.id}`" :transform="`translate(${l.tag[0]} ${l.tag[1]}) rotate(${l.tag[2]})`">
        <rect :x="l.code.length > 1 ? -17 : -13" y="-11" :width="l.code.length > 1 ? 34 : 26" height="22" rx="5" :fill="l.color" />
        <text text-anchor="middle" dy="0.36em" :fill="l.ink" class="tag-code">{{ l.code }}</text>
      </g>
    </g>

    <g class="stations">
      <a
        v-for="s in stations"
        :key="s.id"
        :href="`/stasiun/${s.id}`"
        :class="s.kind"
        @click.prevent="navigateTo(`/stasiun/${s.id}`)"
      >
        <rect v-if="s.pill" :x="s.pill[0]" :y="s.pill[1]" :width="s.pill[2]" height="18" rx="9" class="node node--ink" />
        <circle v-else-if="s.kind === 'interchange'" :cx="s.x" :cy="s.y" r="9" class="node node--ink" />
        <circle v-else :cx="s.x" :cy="s.y" :r="s.kind === 'terminal' ? 7 : 5.5" class="node" :stroke="LINE_BY_ID[s.line!]!.color" />
        <text :x="s.lx" :y="s.ly" :text-anchor="s.anchor ?? 'start'" class="name">{{ stationName(s.id) }}<tspan v-if="has(s.id)" dx="4" class="star">★<title>Stasiun favorit</title></tspan></text>
      </a>
    </g>
  </svg>
</template>

<style scoped>
.map { display: block; width: 100%; height: auto; }
.border { fill: none; stroke: var(--land); stroke-width: 1.5; }
.river { fill: none; stroke: var(--river); stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; }
.river-name { fill: var(--river-text); font-size: 14px; font-weight: 500; text-anchor: middle; }
.region-name { fill: var(--land-text); font-size: 14px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; text-anchor: middle; }
.line { fill: none; stroke-width: var(--line-w); stroke-linecap: round; stroke-linejoin: round; }
.tag-code { font-size: 14px; font-weight: 700; }
.node { fill: var(--surface); stroke-width: 3; }
.node--ink { stroke: var(--text); }
.name { fill: var(--text); font-size: 13.5px; font-weight: 500; }
.terminal .name, .interchange .name { font-weight: 700; }
.star { fill: var(--fav); font-size: 15px; }
.stations a { cursor: pointer; outline: none; }
.stations a:hover .name, .stations a:focus-visible .name { text-decoration: underline; }
.stations a:focus-visible .node { stroke: var(--focus); stroke-width: 4; }
</style>
