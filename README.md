# Peron

Peron is a responsive web app (Nuxt 4) for checking departures on the KRL Commuter Line, the
electric commuter rail network of Greater Jakarta (Jabodetabek). The interface is in Indonesian.

## Features

- **Departure board per station** with a live countdown, filterable by line and destination.
  The next train is drawn as a piece of map from your station to its destination.
- **Train detail** showing the full route as a horizontal line diagram, the stretch already
  travelled, and where the train is now.
- **Schematic network map** of the five KRL lines in a regional-rail-map style, including the
  Cikarang loop via Kampung Bandan and Pasar Senen. Station names link to their boards.
- **Line pages** with horizontal line diagrams, transfer tags and short-turn stations.
- **Favourite stations**, marked with a star everywhere a station appears (stored in the browser).
- **Light, dark and system themes**, applied before first paint so there is no flash.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && node .output/server/index.mjs
```

## Data source

The server calls the **KRL partner API** when both of these environment variables are set
(see `.env.example`):

```bash
NUXT_KRL_API_BASE=https://<partner-host>/<version-prefix>   # from the partner documentation
NUXT_KRL_API_TOKEN=<partner token>                          # sent as a Bearer token
```

- Endpoint paths (`/schedule`, `/schedule-train`) live in `PATHS` in `server/utils/krlApi.ts`.
- Responses are expected in the same shape as `www.kci.id/api/krl/*`
  (`sta_id`, `train_id`, `time_est`, `dest_time`, …).
- With the variables unset, the app uses a **simulated timetable** and labels every page that
  shows it as "Jadwal simulasi" (simulated schedule).
- With the variables set but the API failing, the app shows an error instead of silently falling
  back to simulated data.

Note: the public `www.kci.id/api/krl/*` endpoints can't be used from another server or site. They
sit behind Cloudflare bot protection (HTTP 403) and send no CORS headers.

## Project structure

| Path | Contents |
| --- | --- |
| `shared/stations.ts` | KCI station catalogue (`sta_id` code → name) |
| `shared/krl.ts` | Line data (including branches such as the Cikarang loop), types, API name matching, WIB time helpers |
| `server/utils/krlApi.ts` | Partner API client, with caching (60 s schedules, 5 min trains) |
| `server/utils/schedule.ts` | Simulated timetable, used when the API isn't configured |
| `server/api/stations/[id]/departures.get.ts` | Departures from one station |
| `server/api/trains/[id].get.ts` | One train's journey (stops and times) |
| `app/components/KrlMap.vue` | Schematic network map on the home page |
| `app/components/LineTrack.vue` | Horizontal line diagram used on line and train pages |
| `app/pages/` | Home, `/stasiun/:code`, `/kereta/:id`, `/jalur`, `/jalur/:id` |

## Ideas for later

- Disruption and delay notices from the API
- Journey planner from A to B with transfers (Manggarai, Tanah Abang, Duri, Jakarta Kota)
- PWA: offline support, install to home screen, "train in 5 minutes" notifications
- Crowding estimates by hour, station facilities, nearest station via geolocation
- Fares, and connections to MRT, LRT and TransJakarta

Peron is not affiliated with PT Kereta Commuter Indonesia (KAI Commuter).
