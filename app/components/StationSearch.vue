<script setup lang="ts">
import { STATIONS } from '#shared/krl'

const { has } = useFavorites()

const query = ref('')
const active = ref(0)
const open = ref(false)

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

const results = computed(() => {
  const q = norm(query.value)
  if (!q) return []
  const rank = (name: string) => (norm(name).startsWith(q) ? 0 : 1)
  return STATIONS
    .filter(s => norm(s.name).includes(q))
    .sort((a, b) => rank(a.name) - rank(b.name))
    .slice(0, 8)
})

watch(query, () => { active.value = 0; open.value = true })

function go(id: string) {
  open.value = false
  query.value = ''
  navigateTo(`/stasiun/${id}`)
}

function onKey(e: KeyboardEvent) {
  const n = results.value.length
  if (e.key === 'ArrowDown' && n) { e.preventDefault(); active.value = (active.value + 1) % n }
  else if (e.key === 'ArrowUp' && n) { e.preventDefault(); active.value = (active.value - 1 + n) % n }
  else if (e.key === 'Enter' && n) { e.preventDefault(); go(results.value[active.value]!.id) }
  else if (e.key === 'Escape') open.value = false
}
</script>

<template>
  <div class="search">
    <svg class="search__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <input
      v-model="query"
      type="search"
      placeholder="Cari stasiun, mis. Manggarai"
      autocomplete="off"
      role="combobox"
      aria-label="Cari stasiun"
      aria-controls="station-results"
      :aria-expanded="open && results.length > 0"
      @keydown="onKey"
      @focus="open = true"
      @blur="open = false"
    >
    <ul v-if="open && results.length" id="station-results" class="search__results" role="listbox">
      <li
        v-for="(s, i) in results"
        :key="s.id"
        role="option"
        :aria-selected="i === active"
        :class="{ active: i === active }"
        @mousedown.prevent="go(s.id)"
        @mousemove="active = i"
      >
        <span class="search__name">{{ s.name }}<FavStar v-if="has(s.id)" /></span>
        <span class="search__lines">
          <LineBadge v-for="l in s.lines" :key="l" :line-id="l" size="sm" />
          <span v-if="s.area === 'yogyakarta'" class="search__area">Yogyakarta</span>
        </span>
      </li>
    </ul>
    <p v-else-if="open && query && !results.length" class="search__empty">Stasiun tidak ditemukan.</p>
  </div>
</template>

<style scoped>
.search { position: relative; }
.search__icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
}
input {
  width: 100%;
  height: 56px;
  padding: 0 1rem 0 3rem;
  font: inherit;
  font-size: 1.05rem;
  color: var(--text);
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 999px;
  outline: none;
}
input:focus { border-color: var(--text); box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus) 30%, transparent); }
.search__results, .search__empty {
  position: absolute;
  z-index: 5;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  margin: 0;
  padding: 6px;
  list-style: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 10px 24px rgb(40 50 65 / 0.14);
}
.search__empty { padding: 1rem; color: var(--muted); }
li {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.7rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
}
li.active { background: var(--surface-2); }
.search__name { display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 700; }
.search__lines { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.search__area { font-size: 0.75rem; color: var(--muted); }
</style>
