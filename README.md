# Peron

Peron: web responsif (Nuxt 4) untuk melihat jadwal keberangkatan KRL Commuter Line Jabodetabek.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && node .output/server/index.mjs
```

## Sumber data

Server memanggil **API partner KRL** bila dua env ini diisi (lihat `.env.example`):

```bash
NUXT_KRL_API_BASE=https://<host-partner>/<prefix-versi>   # dari dokumentasi partner
NUXT_KRL_API_TOKEN=<token partner>                        # dikirim sebagai Bearer
```

Path endpoint (`/schedule`, `/schedule-train`) ada di `PATHS` pada `server/utils/krlApi.ts`.
Format respons mengikuti `www.kci.id/api/krl/*` (`sta_id`, `train_id`, `time_est`, `dest_time`, …).
Bila env kosong, app memakai **jadwal simulasi** dan menampilkan label "Jadwal simulasi".
Bila env diisi tapi API gagal, app menampilkan error (tidak diam-diam jatuh ke simulasi).

Catatan: endpoint publik `www.kci.id/api/krl/*` tidak bisa dipakai dari server/aplikasi lain —
diblokir Cloudflare (403) dan tidak mengirim header CORS.

## Struktur

| Path | Isi |
| --- | --- |
| `shared/stations.ts` | Katalog stasiun KCI (kode `sta_id` → nama), dari endpoint stasiun |
| `shared/krl.ts` | Data jalur, tipe data, pencocokan nama API, helper waktu WIB |
| `server/utils/krlApi.ts` | Klien API partner (+ cache 60 dtk / 5 mnt) |
| `server/utils/schedule.ts` | Jadwal simulasi (fallback saat API tidak dikonfigurasi) |
| `server/api/stations/[id]/departures.get.ts` | Keberangkatan dari satu stasiun |
| `server/api/trains/[id].get.ts` | Perjalanan satu kereta (urutan stasiun) |
| `app/pages/` | Beranda, `/stasiun/:kode`, `/kereta/:id`, `/jalur`, `/jalur/:id` |

## Ide lanjutan

- Info gangguan/keterlambatan dari API
- Perencana rute A → B dengan transit (Manggarai, Tanah Abang, Duri, Jakarta Kota)
- PWA: offline, "tambah ke layar utama", notifikasi "kereta 5 menit lagi"
- Perkiraan kepadatan per jam, fasilitas stasiun, stasiun terdekat via geolokasi
- Tarif perjalanan, integrasi MRT/LRT/TransJakarta
