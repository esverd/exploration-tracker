# Exploration Tracker

A web app to track your explorations around the world. Mark countries, US states, and more on interactive maps. See where you've been and where you still want to go.

## Features

- **Interactive World Map** - Click countries to mark them as visited
- **Interactive US States Map** - Click states to mark them as visited
- **Side Panel Lists** - See visited / not visited locations at a glance with search
- **Visit Details** - Record how many times you've been, specific dates, and notes
- **Progress Tracking** - Visual progress bar showing your exploration percentage
- **Configurable** - Easy to add new exploration types (see below)
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

The app is designed to be extensible. To add a new exploration type (e.g., National Parks, European Countries, etc.):

1. Create a new location list file in `src/config/` (follow the pattern of `us-states.ts`):

```typescript
import type { LocationConfig } from '../types';

export const MY_LOCATIONS: LocationConfig[] = [
  { id: 'location-1', name: 'Location 1' },
  { id: 'location-2', name: 'Location 2' },
  // ...
];
```

2. Add the exploration to `src/config/explorations.ts`:

```typescript
import { MY_LOCATIONS } from './my-locations';

// Add to the EXPLORATIONS array:
{
  id: 'my-exploration',
  name: 'My Exploration',
  icon: '\u{1F3D4}',
  mapType: 'world', // or 'us-states' for US-based maps
  geoUrl: '/geo/my-map-data.json', // TopoJSON file in public/geo/
  locations: MY_LOCATIONS,
  topoKey: 'objects-key', // key in TopoJSON objects
  matchProperty: 'name', // property in geo data to match location IDs
  projection: 'geoEqualEarth',
  projectionConfig: { scale: 160 },
}
```

3. Place your TopoJSON map data file in `public/geo/`

4. Restart the dev server - the new tab appears automatically

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
