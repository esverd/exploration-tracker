# Exploration Tracker

A web app to track your explorations around the world. Mark countries, US states, Texas state parks, and more on interactive maps. See where you've been and where you still want to go.

## Features

- **Interactive World Map** - Click countries to mark them as visited
- **Interactive US States Map** - Click states to mark them as visited
- **Texas State Parks** - Point markers for 80+ state parks, natural areas, and historic sites
- **Side Panel Lists** - See visited / not visited locations at a glance with search
- **Visit Details** - Record how many times you've been, specific dates, and notes
- **Progress Tracking** - Visual progress bar showing your exploration percentage
- **Two exploration modes** - Region-based (click polygons) and marker-based (click points)
- **Extensible** - Add your own exploration modes with minimal code (see guide below)
- **Private Data** - Your personal data file is gitignored by default
- **Configurable Storage** - Choose where your data file lives on your system

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (frontend + backend)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Production

```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

The production server runs on port 3001 by default and serves both the API and the built frontend.

## Data Storage

Your exploration data is stored in `data/exploration-data.json`. This file is **gitignored** so your personal data is never published to GitHub.

- If the file doesn't exist when the app starts, a new empty one is created automatically
- You can change the file location in the Settings page (gear icon in the header)
- You can also set the path via the `DATA_FILE_PATH` environment variable

```bash
# Example: store data on your Desktop
DATA_FILE_PATH=~/Desktop/my-explorations.json npm run dev
```

## Adding New Explorations

The app is designed to be extensible. There are two types of exploration modes:

1. **Region-based** - Clickable geographic polygons (countries, states, counties)
2. **Marker-based** - Point markers on a background map (parks, landmarks, cities)

For a **full step-by-step guide** with examples of both types, see **[ADDING_EXPLORATIONS.md](./ADDING_EXPLORATIONS.md)**.

### Quick example (region-based)

```typescript
// 1. Create src/config/my-locations.ts
import type { LocationConfig } from '../types';
export const MY_LOCATIONS: LocationConfig[] = [
  { id: 'France', name: 'France' },
  { id: 'Germany', name: 'Germany' },
];

// 2. Add to src/config/explorations.ts
{
  id: 'my-exploration',
  name: 'My Map',
  icon: '\u{1F5FA}',
  mapType: 'custom',
  geoUrl: '/geo/my-map-data.json',
  locations: MY_LOCATIONS,
  topoKey: 'countries',
  matchProperty: 'name',
  projection: 'geoMercator',
  projectionConfig: { scale: 600, center: [15, 52] },
}
```

### Quick example (marker-based)

```typescript
// 1. Create src/config/my-points.ts
import type { LocationConfig } from '../types';
export const MY_POINTS: LocationConfig[] = [
  { id: 'point-1', name: 'My Favorite Spot', coordinates: [-97.74, 30.27] },
];

// 2. Add to src/config/explorations.ts
{
  id: 'my-points',
  name: 'My Points',
  icon: '\u{1F4CD}',
  mapType: 'custom',
  geoUrl: '/geo/us-states-10m.json',
  locations: MY_POINTS,
  topoKey: 'states',
  matchProperty: 'name',
  useMarkers: true,
  projection: 'geoMercator',
  projectionConfig: { scale: 2400, center: [-99.5, 31.5] },
}
```

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Maps**: react-simple-maps (TopoJSON/D3-based)
- **Backend**: Express.js (for JSON file persistence)
- **Map Data**: Natural Earth (world-atlas) + US Census (us-atlas)

## Project Structure

```
exploration-tracker/
  src/
    config/          # Exploration definitions (add new ones here)
    components/      # React components
    hooks/           # Custom React hooks
    api/             # API service layer
    types/           # TypeScript type definitions
  server/            # Express backend
  public/geo/        # TopoJSON map data files
  data/              # User data (gitignored)
```
