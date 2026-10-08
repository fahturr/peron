export type ThemeChoice = 'system' | 'light' | 'dark'

/** Keep in sync with the inline script in nuxt.config.ts that applies it before first paint. */
export const THEME_KEY = 'peron:theme'

/**
 * Light/dark/system theme choice, remembered per browser. 'system' follows the
 * device setting; the choice is applied as `data-theme` on <html>.
 */
export function useTheme() {
  const theme = useState<ThemeChoice>('theme', () => 'system')

  onMounted(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY)
      if (stored === 'light' || stored === 'dark') theme.value = stored
    } catch { /* storage unavailable */ }
  })

  function set(next: ThemeChoice) {
    theme.value = next
    const root = document.documentElement
    if (next === 'system') delete root.dataset.theme
    else root.dataset.theme = next
    try {
      if (next === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, next)
    } catch { /* storage unavailable */ }
  }

  return { theme, set }
}
