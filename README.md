## About

Text

## Project structure

Everything lives in [`frontend/`](frontend), a Next.js app:

- `src/app/page.tsx` – the map, which reads upcoming events from PostgreSQL on every request
- `src/app/api/scrape/route.ts` – scrapes events from Stuk and Facebook and saves them to the database
- `src/scraper/` – the Stuk and Facebook scrapers
- `db/initialize_database.sql` – the database schema (**drops existing tables**)

## Environment variables

Put these in `frontend/.env.local` (and in the Vercel project settings):

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps in the browser |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Google Maps map style |
| `GEOCODE_API_KEY` | Google Geocoding API, for Stuk events with their own address |
| `CRON_SECRET` | Protects `/api/scrape`; any long random string |

## Development

```bash
cd frontend
npm install
npm run dev
```

## Scraping events

Vercel Cron calls `/api/scrape` every day at 04:00 UTC (see [`frontend/vercel.json`](frontend/vercel.json)) and sends `CRON_SECRET` automatically.
To run it yourself, call the endpoint with the secret. Add `?dryRun` to see the scraped events without saving them:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/scrape?dryRun"
```

All times are stored as `TIMESTAMPTZ` and shown in Swedish time (`Europe/Stockholm`).

## License

[![License: Custom](https://img.shields.io/badge/License-Custom-lightgrey.svg)](LICENSE)

This code is published as the final project for CS50 at Harvard University.
For educational and portfolio purposes only. See the [LICENSE](LICENSE) file for usage restrictions.
