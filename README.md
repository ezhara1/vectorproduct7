# StatsCan Visualizer

A modern Vite + React single-page app to fetch and visualize Statistics Canada vectors via Netlify Functions.

## Features
- Browse `data.json` by product, drag vectors into chart area
- Fetch data via Netlify Function using getDataFromVectorsAndLatestNPeriods
- Charts: line, bar, scatter (Chart.js)
- Table view + CSV export
- Only numeric vector IDs are sent upstream (strips leading `v`)

## Development
```bash
npm install
npm run dev
```
Open http://localhost:5173

Netlify function is available under /api/statcan during dev via the redirect in `netlify.toml` (when running in Netlify dev) or via the same path after deploy.

## Build
```bash
npm run build
```

## Deploy to Netlify
- Push to a repo and connect on Netlify, or use `netlify deploy`.
- `netlify.toml` config publishes `dist` and functions from `netlify/functions`.
