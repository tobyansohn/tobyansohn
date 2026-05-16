# tobyansohn.com

Personal portfolio site for Toby Ansohn — software developer, photographer, and videographer based in Austin, TX.

Live at [tobyansohn.com](https://tobyansohn.com)

## Stack

- **React 18** + React Router v6
- **Tailwind CSS** v3
- **Vite** v5
- **Vercel** (hosting + serverless functions)
- **Upstash Redis** (price snapshot storage)
- **Fonts**: Cormorant Garamond (display) + DM Sans (body)

## Pages

| Page | Description |
|---|---|
| Home | Hero, about, randomized photo strip, video grid |
| Developer | Water ripple canvas, travel map, Pokémon card tracker |
| Photography | Masonry gallery with lightbox, category/subcategory filters |
| Videography | YouTube video grid |
| Contact | Email + social links |

## Features

- **Pokémon TCG tracker** — `/api/trending-cards` serverless function fetches Special Illustration Rare and Illustration Rare cards every 12 hours, stores two price snapshots in Redis, and surfaces the top movers by % change
- **Travel map** — interactive Leaflet map with clickable pins linking to photo subcategories
- **Water ripple cursor** — canvas-based effect on the Developer page (desktop only)
- **Lightbox** — portal-rendered so it stays centered regardless of scroll position
- **Dark/light mode** — theme persisted via context
- **Photo auto-count** — `import.meta.glob` counts all photos in the library at build time

## Dev

```bash
npm install
npm run dev
npm run build
```

## Environment Variables (Vercel)

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```
