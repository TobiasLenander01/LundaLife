## About

Text

## How it works

LundaLife is a static Next.js app in [`frontend/`](frontend) with no backend or database.
When the site is visited, the browser loads each nation's upcoming events directly from the
[Stuk](https://studentkortet.se) API (which allows cross-origin requests) and shows them on a Google Map.

- `src/data/organizations.ts` – the nations shown on the map, with their Stuk ids and coordinates
- `src/lib/stuk.ts` – loads and parses events from Stuk
- `src/app/client.tsx` – the map, filters and event list

Stuk's dates end with `Z` but are actually Swedish local time; they are converted accordingly.
All times are shown in Swedish time (`Europe/Stockholm`).

The [`facebook`](../../tree/facebook) branch has a version that also scrapes Facebook events,
using a PostgreSQL database and a daily scrape job (Vercel Cron).

## Environment variables

Put these in `frontend/.env.local` (and in the hosting provider's settings):

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps in the browser |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Google Maps map style |

## Development

```bash
cd frontend
npm install
npm run dev
```

## License

[![License: Custom](https://img.shields.io/badge/License-Custom-lightgrey.svg)](LICENSE)

This code is published as the final project for CS50 at Harvard University.
For educational and portfolio purposes only. See the [LICENSE](LICENSE) file for usage restrictions.
