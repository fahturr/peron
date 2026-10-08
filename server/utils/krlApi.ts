// Client for the KRL partner API. Response shapes match what www.kci.id serves
// (same `status`/`data` envelope and field names). Set NUXT_KRL_API_BASE (including
// the version prefix from the partner docs) and NUXT_KRL_API_TOKEN to enable it.
import type { H3Event } from 'h3'
import {
  LINE_BY_ID, STATION_BY_ID, fmtTime, lineIdByApiName, parseClock, stationIdByName,
  type Departure, type TrainDetail, type TrainStop,
} from '#shared/krl'

/** Endpoint paths relative to NUXT_KRL_API_BASE — adjust here if the partner docs differ. */
const PATHS = {
  schedule: '/schedule',
  train: '/schedule-train',
}

interface Envelope<T> { status: number; message?: string; data: T }

interface ApiSchedule {
  train_id: string
  ka_name: string
  route_name: string
  dest: string
  time_est: string
  color: string
  dest_time: string
}

interface ApiTrainStop {
  train_id: string
  ka_name: string
  station_id: string
  station_name: string
  time_est: string
  color: string
}

interface Api { base: string; token: string }

export function krlApi(event: H3Event): Api | null {
  const { krlApiBase, krlApiToken } = useRuntimeConfig(event)
  return krlApiBase && krlApiToken ? { base: krlApiBase.replace(/\/$/, ''), token: krlApiToken } : null
}

async function get<T>(api: Api, path: string, query: Record<string, string>): Promise<T> {
  const res = await $fetch<Envelope<T>>(api.base + path, {
    query,
    headers: { Authorization: `Bearer ${api.token}`, Accept: 'application/json' },
    timeout: 10_000,
  })
  if (!res || !Array.isArray(res.data)) throw new Error(`Unexpected response from ${path}`)
  return res.data
}

const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase())

const fetchSchedule = defineCachedFunction(
  (api: Api, stationId: string, from: string, to: string) =>
    get<ApiSchedule[]>(api, PATHS.schedule, { stationid: stationId, timefrom: from, timeto: to }),
  { name: 'krl-schedule', maxAge: 60, getKey: (_api: Api, s: string, f: string, t: string) => `${s}-${f}-${t}` },
)

const fetchTrain = defineCachedFunction(
  (api: Api, trainId: string) => get<ApiTrainStop[]>(api, PATHS.train, { trainid: trainId }),
  { name: 'krl-train', maxAge: 300, getKey: (_api: Api, id: string) => id },
)

function toDeparture(s: ApiSchedule, dayOffset: number): Departure {
  const lineId = lineIdByApiName(s.ka_name)
  const destinationId = stationIdByName(s.dest)
  const time = parseClock(s.time_est) + dayOffset
  let arrivalTime = parseClock(s.dest_time) + dayOffset
  if (arrivalTime < time) arrivalTime += 1440
  return {
    trainId: s.train_id,
    lineId,
    lineName: s.ka_name,
    color: lineId ? LINE_BY_ID[lineId]!.color : s.color,
    destinationId,
    destinationName: destinationId ? STATION_BY_ID[destinationId]!.name : titleCase(s.dest),
    time,
    arrivalTime,
  }
}

/** Departures between `start` and `start + window` minutes; splits the request at midnight. */
export async function apiDepartures(api: Api, stationId: string, start: number, window: number): Promise<Departure[]> {
  const end = start + window
  const today = await fetchSchedule(api, stationId, fmtTime(start), fmtTime(Math.min(end, 1439)))
  const deps = today.map(s => toDeparture(s, 0))
  if (end > 1439) {
    const tomorrow = await fetchSchedule(api, stationId, '00:00', fmtTime(end - 1440))
    deps.push(...tomorrow.map(s => toDeparture(s, 1440)))
  }
  return deps
}

export async function apiTrain(api: Api, trainId: string): Promise<TrainDetail | null> {
  const rows = await fetchTrain(api, trainId)
  if (!rows.length) return null

  let prev = -1
  let offset = 0
  const stops: TrainStop[] = rows.map((r) => {
    let time = parseClock(r.time_est) + offset
    if (time < prev) { offset += 1440; time += 1440 }
    prev = time
    const stationId = STATION_BY_ID[r.station_id] ? r.station_id : stationIdByName(r.station_name)
    return { stationId, stationName: stationId ? STATION_BY_ID[stationId]!.name : titleCase(r.station_name), time }
  })

  const lineId = lineIdByApiName(rows[0]!.ka_name)
  return {
    id: trainId,
    lineId,
    lineName: rows[0]!.ka_name,
    color: lineId ? LINE_BY_ID[lineId]!.color : rows[0]!.color,
    stops,
  }
}
