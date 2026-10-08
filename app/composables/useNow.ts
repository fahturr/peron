import { wibMinutes } from '#shared/krl'

let ticking = false

/** Current WIB time in minutes since midnight, updated every second on the client. */
export function useNow() {
  const now = useState('wib-now', () => wibMinutes())
  if (import.meta.client && !ticking) {
    ticking = true
    setInterval(() => { now.value = wibMinutes() }, 1000)
  }
  return now
}
