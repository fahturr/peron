import { STATION_BY_ID, minutesUntil, wibMinutes, type DataSource, type Departure } from '#shared/krl'

export default defineEventHandler(async (event) => {
  const id = (getRouterParam(event, 'id') ?? '').toUpperCase()
  if (!STATION_BY_ID[id]) throw createError({ statusCode: 404, statusMessage: 'Stasiun tidak ditemukan' })

  const window = Math.min(Math.max(Number(getQuery(event).window) || 180, 30), 600)
  const now = wibMinutes()
  const api = krlApi(event)

  let source: DataSource = 'simulasi'
  let departures: Departure[]
  if (api) {
    // Round the start down to 5 minutes so the upstream cache key is shared between requests.
    const start = Math.floor((now - 2) / 5) * 5
    try {
      departures = await apiDepartures(api, id, Math.max(start, 0), window)
      source = 'krl'
    } catch (err) {
      console.error('[krl] schedule request failed:', err)
      throw createError({ statusCode: 502, statusMessage: 'API KRL tidak dapat dihubungi' })
    }
  } else {
    departures = simDepartures(id, now, window)
  }

  departures.sort((a, b) => minutesUntil(a.time, now) - minutesUntil(b.time, now))
  return { stationId: id, source, departures }
})
