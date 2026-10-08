import { STATION_BY_ID } from '#shared/krl'

const KEY = 'krl:favorites'

/** Favorite station ids, persisted per browser. Empty during SSR. */
export function useFavorites() {
  const favorites = useState<string[]>('favorites', () => [])
  const loaded = useState('favorites-loaded', () => false)

  onMounted(() => {
    if (loaded.value) return
    loaded.value = true
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      if (Array.isArray(stored)) favorites.value = stored.filter(x => typeof x === 'string' && STATION_BY_ID[x])
    } catch { /* storage unavailable */ }
  })

  function toggle(id: string) {
    favorites.value = favorites.value.includes(id)
      ? favorites.value.filter(x => x !== id)
      : [...favorites.value, id]
    try { localStorage.setItem(KEY, JSON.stringify(favorites.value)) } catch { /* storage unavailable */ }
  }

  return { favorites, loaded, toggle, has: (id: string) => favorites.value.includes(id) }
}
