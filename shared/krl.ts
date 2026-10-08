// Shared KRL Commuter Line data + helpers, used by both the app and the server.
// Station ids are KCI station codes (sta_id), e.g. MRI = Manggarai.
import { STATION_CATALOG } from './stations'

export interface Line {
  id: string
  name: string
  short: string
  route: string
  color: string
  /** Normalized line name as it appears in the API's `ka_name` ("COMMUTER LINE <key>"). */
  apiKey: string
  /** Line code shown in the roundel, as on KCI signage (B, C, R, T, TP). */
  code: string
  /** Tag text colour; overrides the automatic black/white choice. */
  ink?: '#111111' | '#ffffff'
  prefix: number
  headwayPeak: number
  headwayOff: number
  /** Station codes in direction-0 order. */
  stations: string[]
  /** Every n-th trip turns back at this station instead of running the full line. */
  shortTurn?: { at: string; every: number }
  /** Additional service patterns on the same line, e.g. the Cikarang loop via Pasar Senen. */
  branches?: Branch[]
}

export interface Branch {
  name: string
  /** Full station sequence of the pattern, in its direction-0 order. */
  stations: string[]
  /** The stretch only this pattern serves, shown on the line page. */
  own: string[]
  headwayPeak: number
  headwayOff: number
}

export interface Station {
  id: string
  name: string
  area: 'jabodetabek' | 'yogyakarta'
  lines: string[]
}

export interface Departure {
  trainId: string
  /** Known line id, or null when the API reports a line we don't have metadata for. */
  lineId: string | null
  lineName: string
  color: string
  destinationName: string
  destinationId: string | null
  /** Minutes since 00:00 WIB; may exceed 1440 past midnight. */
  time: number
  arrivalTime: number
}

export interface TrainStop {
  stationId: string | null
  stationName: string
  time: number
}

export interface TrainDetail {
  id: string
  lineId: string | null
  lineName: string
  color: string
  stops: TrainStop[]
}

export type DataSource = 'krl' | 'simulasi'

export const LINES: Line[] = [
  {
    id: 'bogor', name: 'Bogor Line', short: 'Bogor', route: 'Jakarta Kota – Bogor', apiKey: 'BOGOR', code: 'B',
    color: '#E30A16', prefix: 1, headwayPeak: 6, headwayOff: 12,
    shortTurn: { at: 'DP', every: 3 },
    stations: ['JAKK', 'JAY', 'MGB', 'SW', 'JUA', 'GDD', 'CKI', 'MRI', 'TEB', 'CW', 'DRN', 'PSMB', 'PSM', 'TNT', 'LNA', 'UP', 'UI', 'POC', 'DPB', 'DP', 'CTA', 'BJD', 'CLT', 'BOO'],
  },
  {
    id: 'cikarang', name: 'Cikarang Line', short: 'Cikarang', route: 'Kampung Bandan – Cikarang', apiKey: 'CIKARANG', code: 'C', ink: '#ffffff',
    color: '#0084D8', prefix: 2, headwayPeak: 8, headwayOff: 15,
    shortTurn: { at: 'BKS', every: 4 },
    stations: ['KPB', 'AK', 'DU', 'THB', 'SUD', 'MRI', 'MTR', 'JNG', 'KLD', 'BUA', 'KLDB', 'CUK', 'KRI', 'BKS', 'BKST', 'TB', 'CIT', 'TLM', 'CKR'],
    // The line is a loop: Kampung Bandan also runs east via Pasar Senen to Jatinegara.
    branches: [{
      name: 'via Pasar Senen',
      stations: ['KPB', 'RJW', 'KMO', 'PSE', 'GST', 'KMT', 'POK', 'JNG', 'KLD', 'BUA', 'KLDB', 'CUK', 'KRI', 'BKS', 'BKST', 'TB', 'CIT', 'TLM', 'CKR'],
      own: ['KPB', 'RJW', 'KMO', 'PSE', 'GST', 'KMT', 'POK', 'JNG'],
      headwayPeak: 15,
      headwayOff: 30,
    }],
  },
  {
    id: 'rangkasbitung', name: 'Rangkasbitung Line', short: 'Rangkasbitung', route: 'Tanah Abang – Rangkasbitung', apiKey: 'RANGKASBITUNG', code: 'R',
    color: '#16812B', prefix: 3, headwayPeak: 8, headwayOff: 15,
    shortTurn: { at: 'PRP', every: 2 },
    stations: ['THB', 'PLM', 'KBY', 'PDJ', 'JMU', 'SDM', 'RU', 'SRP', 'CSK', 'CC', 'JTK', 'PRP', 'CJT', 'DAR', 'TEJ', 'TGS', 'CKY', 'MJ', 'CTR', 'RK'],
  },
  {
    id: 'tangerang', name: 'Tangerang Line', short: 'Tangerang', route: 'Duri – Tangerang', apiKey: 'TANGERANG', code: 'T',
    color: '#8A5A2B', prefix: 4, headwayPeak: 10, headwayOff: 15,
    stations: ['DU', 'GGL', 'PSG', 'TKO', 'BOI', 'RW', 'KDS', 'PI', 'BPR', 'THI', 'TNG'],
  },
  {
    id: 'tanjung-priok', name: 'Tanjung Priok Line', short: 'Tj. Priok', route: 'Jakarta Kota – Tanjung Priok', apiKey: 'TANJUNGPRIOK', code: 'TP',
    color: '#DD0067', prefix: 5, headwayPeak: 15, headwayOff: 20,
    stations: ['JAKK', 'KPB', 'AC', 'JIS', 'TPK'],
  },
]

export const LINE_BY_ID: Record<string, Line> = Object.fromEntries(LINES.map(l => [l.id, l]))

/** Every station a line serves, main route first, then stations only its branches reach. */
export function lineStations(line: Line): string[] {
  return [...new Set([...line.stations, ...(line.branches ?? []).flatMap(b => b.stations)])]
}

export const STATION_BY_ID: Record<string, Station> = Object.fromEntries(
  Object.entries(STATION_CATALOG).map(([id, s]) => [id, { id, ...s, lines: LINES.filter(l => lineStations(l).includes(id)).map(l => l.id) }]),
)

export const STATIONS: Station[] = Object.values(STATION_BY_ID).sort((a, b) => a.name.localeCompare(b.name))

const normName = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '')
const STATION_BY_NAME = new Map(STATIONS.map(s => [normName(s.name), s.id]))
for (const [id, alias] of [['UI', 'UNIVINDONESIA'], ['UP', 'UNIVPANCASILA']] as const) STATION_BY_NAME.set(alias, id)

/** Resolve an API station name ("KAMPUNGBANDAN", "UNIV. INDONESIA") to a station code. */
export const stationIdByName = (name: string) => STATION_BY_NAME.get(normName(name)) ?? null

/** Resolve an API `ka_name` ("COMMUTER LINE CIKARANG") to a known line id. */
export function lineIdByApiName(kaName: string): string | null {
  const n = normName(kaName)
  return LINES.find(l => n.endsWith(l.apiKey))?.id ?? null
}

/** Display name for a line: our short name when known, else the API's name without the prefix. */
export function lineLabel(lineId: string | null, apiName = ''): string {
  if (lineId) return LINE_BY_ID[lineId]!.short
  const s = apiName.replace(/^COMMUTER LINE\s*/i, '').toLowerCase()
  return s.replace(/\b[a-z]/g, c => c.toUpperCase()) || 'KRL'
}

/** Roundel code: our line code when known, else the first letter of the API's line name. */
export function lineCode(lineId: string | null, apiName = ''): string {
  if (lineId) return LINE_BY_ID[lineId]!.code
  return lineLabel(null, apiName).charAt(0).toUpperCase() || '?'
}

/** Black or white, whichever reads better on a `#rrggbb` background (WCAG contrast). */
export function textOn(hex: string): '#111111' | '#ffffff' {
  const c = hex.replace('#', '').match(/../g)?.map(h => parseInt(h, 16) / 255) ?? [0, 0, 0]
  const [r, g, b] = c.map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)) as [number, number, number]
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return (lum + 0.05) / 0.05 >= 1.05 / (lum + 0.05) ? '#111111' : '#ffffff'
}

/** Text colour for a line tag: the line's own setting, else whichever of black/white reads better. */
export function lineInk(lineId: string | null, color: string): '#111111' | '#ffffff' {
  return (lineId && LINE_BY_ID[lineId]!.ink) || textOn(color)
}

// ---- time helpers (all times are WIB minutes since midnight) ----

const wibFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Jakarta', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
})

export function wibMinutes(date = new Date()): number {
  const p = Object.fromEntries(wibFormat.formatToParts(date).map(x => [x.type, x.value]))
  return Number(p.hour) * 60 + Number(p.minute) + Number(p.second) / 60
}

/** "20:03:00" → 1203 */
export function parseClock(s: string): number {
  const [h = 0, m = 0] = s.split(':').map(Number)
  return h * 60 + m
}

/** Signed minutes from `now` until `time`, wrapped to the nearest day (−720, 720]. */
export function minutesUntil(time: number, now: number): number {
  let d = (((time - now) % 1440) + 1440) % 1440
  if (d > 720) d -= 1440
  return d
}

export function fmtTime(min: number): string {
  const m = ((Math.floor(min) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export function fmtCountdown(d: number): string {
  if (d < 1) return 'Sekarang'
  const mins = Math.ceil(d)
  if (mins < 60) return `${mins} mnt`
  return `${Math.floor(mins / 60)} j ${mins % 60} mnt`
}
