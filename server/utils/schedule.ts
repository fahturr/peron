// Simulated timetable, used when the partner API isn't configured. Deterministic,
// so every request (and SSR vs. client) sees the same trains.
import { LINES, LINE_BY_ID, STATION_BY_ID, minutesUntil, type Departure, type TrainDetail } from '#shared/krl'

interface Trip {
  id: string
  lineId: string
  stops: { stationId: string; time: number }[]
}

const FIRST_DEPARTURE = 4 * 60
const LAST_DEPARTURE = 23 * 60 + 20

let cache: Trip[] | null = null
let byId: Map<string, Trip> | null = null

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Travel time between two adjacent stations: 2–4 minutes, same in both directions. */
function segmentMinutes(a: string, b: string): number {
  return 2 + (hash(a < b ? a + b : b + a) % 3)
}

const isPeak = (t: number) => (t >= 330 && t < 540) || (t >= 960 && t < 1170)

function allTrips(): Trip[] {
  if (cache) return cache
  const trips: Trip[] = []

  // Each line's main pattern, plus its branch patterns (numbered from 500 up so ids stay unique).
  const patterns = LINES.flatMap(line => [
    { line, stations: line.stations, headwayPeak: line.headwayPeak, headwayOff: line.headwayOff, shortTurn: line.shortTurn, idBase: 0 },
    ...(line.branches ?? []).map(b => ({ line, stations: b.stations, headwayPeak: b.headwayPeak, headwayOff: b.headwayOff, shortTurn: undefined, idBase: 500 })),
  ])

  for (const { line, stations, headwayPeak, headwayOff, shortTurn, idBase } of patterns) {
    for (const direction of [0, 1] as const) {
      const seq = direction === 0 ? stations : [...stations].reverse()
      const offsets = [0]
      for (let i = 1; i < seq.length; i++) offsets.push(offsets[i - 1]! + segmentMinutes(seq[i - 1]!, seq[i]!))

      // Branch patterns start 4 minutes later so they don't share a minute with the main pattern.
      let t = FIRST_DEPARTURE + line.prefix * 2 + direction * 7 + (idBase ? 4 : 0)
      for (let n = 0; t <= LAST_DEPARTURE; n++) {
        let stops = seq.map((stationId, i) => ({ stationId, time: t + offsets[i]! }))

        const st = shortTurn
        if (st && n % st.every === st.every - 1) {
          // Keep the trip in its headway slot; outbound short trips terminate at
          // `at`, inbound ones start there.
          const at = seq.indexOf(st.at)
          stops = direction === 0 ? stops.slice(0, at + 1) : stops.slice(at)
        }

        trips.push({
          id: `${line.prefix}${String(idBase + n * 2 + direction + 1).padStart(3, '0')}`,
          lineId: line.id,
          stops,
        })
        t += isPeak(t) ? headwayPeak : headwayOff
      }
    }
  }

  cache = trips
  return trips
}

export function simDepartures(stationId: string, now: number, window: number): Departure[] {
  const departures: Departure[] = []
  for (const trip of allTrips()) {
    const idx = trip.stops.findIndex(s => s.stationId === stationId)
    // Skip trains that don't call here, or that terminate here (arrival only).
    if (idx < 0 || idx === trip.stops.length - 1) continue

    const time = trip.stops[idx]!.time
    const until = minutesUntil(time, now)
    if (until < -2 || until > window) continue

    const last = trip.stops.at(-1)!
    const line = LINE_BY_ID[trip.lineId]!
    departures.push({
      trainId: trip.id,
      lineId: line.id,
      lineName: line.name,
      color: line.color,
      destinationId: last.stationId,
      destinationName: STATION_BY_ID[last.stationId]!.name,
      time,
      arrivalTime: last.time,
    })
  }
  return departures
}

export function simTrain(id: string): TrainDetail | null {
  byId ??= new Map(allTrips().map(t => [t.id, t]))
  const trip = byId.get(id)
  if (!trip) return null
  const line = LINE_BY_ID[trip.lineId]!
  return {
    id,
    lineId: line.id,
    lineName: line.name,
    color: line.color,
    stops: trip.stops.map(s => ({ ...s, stationName: STATION_BY_ID[s.stationId]!.name })),
  }
}
