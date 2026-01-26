# Adding New Exploration Modes

This guide walks you through adding a custom exploration mode to the Exploration Tracker. The app supports two types of explorations:

1. **Region-based** - Clickable geographic areas (like countries or states)
2. **Marker-based** - Point markers on a map (like parks, landmarks, or cities)

## Quick Overview

Every exploration mode needs two things:

1. A **location list** file in `src/config/` that defines all the locations
2. An **entry** in the `EXPLORATIONS` array in `src/config/explorations.ts`

That's it. The app handles everything else automatically: tabs, map rendering, the side panel, data persistence, and the detail modal.

---

## Option A: Region-Based Exploration

Use this when your locations are geographic areas that appear as polygons in a TopoJSON file (countries, states, provinces, counties, etc.).

### Step 1: Get a TopoJSON file

You need a TopoJSON file that contains the geographic boundaries for your regions. Common sources:

- [world-atlas](https://github.com/topojson/world-atlas) - Countries of the world
- [us-atlas](https://github.com/topojson/us-atlas) - US states and counties
- [Natural Earth](https://www.naturalearthdata.com/) - Various administrative boundaries
- [mapshaper.org](https://mapshaper.org/) - Convert Shapefiles or GeoJSON to TopoJSON

Place the file in `public/geo/`. For example: `public/geo/european-countries.json`.

### Step 2: Inspect the TopoJSON

Open the file and note:

- **The object key** - The top-level key inside `objects`. For example, in `us-states-10m.json`, the key is `"states"`.
- **The match property** - A property on each geometry that you can use to identify regions. Usually `"name"` or an ID code. Look inside `objects.<key>.geometries[0].properties` to see what's available.

You can inspect a file with Node.js:

```bash
node -e "
const data = require('./public/geo/your-file.json');
console.log('Object keys:', Object.keys(data.objects));
const key = Object.keys(data.objects)[0];
const first = data.objects[key].geometries[0];
console.log('Properties:', first.properties);
console.log('ID:', first.id);
"
```

### Step 3: Create the location list

Create a new file in `src/config/`. Each entry needs an `id` that matches the value of the match property in the TopoJSON data:

```typescript
// src/config/european-countries.ts
import type { LocationConfig } from '../types';

export const EUROPEAN_COUNTRIES: LocationConfig[] = [
  { id: 'France', name: 'France' },
  { id: 'Germany', name: 'Germany' },
  { id: 'Spain', name: 'Spain' },
  // ... add all your locations
  // The `id` must match the value of the match property in the geo data
  // The `name` is the human-readable display name
];
```

> **Tip:** If the TopoJSON uses abbreviated names (like `"Bosnia and Herz."`), use the abbreviated form as the `id` and the full name as `name`. The app will display the friendly `name` everywhere.

### Step 4: Add the exploration config

In `src/config/explorations.ts`, import your locations and add an entry:

```typescript
import { EUROPEAN_COUNTRIES } from './european-countries';

// Add to the EXPLORATIONS array:
{
  id: 'europe',
  name: 'Europe',
  icon: '\u{1F1EA}\u{1F1FA}',  // EU flag emoji (or any emoji/text)
  description: 'Track European countries you have visited',
  mapType: 'custom',
  geoUrl: '/geo/european-countries.json',
  locations: EUROPEAN_COUNTRIES,
  topoKey: 'countries',         // key inside TopoJSON objects
  matchProperty: 'name',        // property in geo data to match location IDs
  projection: 'geoMercator',    // D3 projection name
  projectionConfig: {
    scale: 600,
    center: [15, 52],           // [longitude, latitude] center of the map
  },
},
```

### Step 5: (Optional) Filter the background map

If your TopoJSON file contains more regions than you want to show, use `geoFilter` to display only a subset. For example, to show only Texas from the full US states file:

```typescript
geoFilter: {
  property: 'name',          // which geo property to check
  values: ['Texas'],          // which values to include
},
```

This renders only matching geographies, hiding the rest.

---

## Option B: Marker-Based Exploration

Use this when your locations are specific points (parks, restaurants, landmarks, airports, etc.) that should appear as dots on a background map.

### Step 1: Get a background map

You need a TopoJSON file for the geographic background. This could be a country outline, state boundary, or any other map that provides context. You can reuse an existing file from `public/geo/`.

### Step 2: Create the location list with coordinates

Each location needs `coordinates` as `[longitude, latitude]`:

```typescript
// src/config/national-parks.ts
import type { LocationConfig } from '../types';

export const NATIONAL_PARKS: LocationConfig[] = [
  {
    id: 'yellowstone',
    name: 'Yellowstone National Park',
    coordinates: [-110.588, 44.428],  // [longitude, latitude]
  },
  {
    id: 'grand-canyon',
    name: 'Grand Canyon National Park',
    coordinates: [-112.113, 36.107],
  },
  {
    id: 'yosemite',
    name: 'Yosemite National Park',
    coordinates: [-119.538, 37.865],
  },
  // ... more parks
];
```

> **Important:** Coordinates must be `[longitude, latitude]`, NOT `[latitude, longitude]`. This is the format used by D3/GeoJSON. For example, Austin TX is `[-97.74, 30.27]`.

You can find coordinates on Google Maps by right-clicking a location and copying the values, then swap the order (Google shows lat,lng but we need lng,lat).

### Step 3: Add the exploration config

```typescript
import { NATIONAL_PARKS } from './national-parks';

{
  id: 'national-parks',
  name: 'National Parks',
  icon: '\u{1F3D4}',
  description: 'Track US National Parks you have visited',
  mapType: 'custom',
  geoUrl: '/geo/us-states-10m.json',   // background map
  locations: NATIONAL_PARKS,
  topoKey: 'states',                    // key in background TopoJSON
  matchProperty: 'name',                // (required but not used for matching in marker mode)
  useMarkers: true,                     // enables marker mode
  projection: 'geoAlbersUsa',
  projectionConfig: {
    scale: 1000,
  },
},
```

The key difference is `useMarkers: true`. This tells the map to:
- Render geographies as a non-interactive background
- Render each location as a clickable circle marker at its coordinates
- Color markers green when visited, gray when not

### Step 4: (Optional) Filter the background

Combine `useMarkers` with `geoFilter` to zoom into a specific area. The Texas State Parks exploration does this: it uses the US states TopoJSON but only shows Texas:

```typescript
{
  id: 'texas-state-parks',
  name: 'TX State Parks',
  icon: '\u{1F332}',
  mapType: 'custom',
  geoUrl: '/geo/us-states-10m.json',
  locations: TEXAS_STATE_PARKS,
  topoKey: 'states',
  matchProperty: 'name',
  useMarkers: true,
  geoFilter: {
    property: 'name',
    values: ['Texas'],
  },
  projection: 'geoMercator',
  projectionConfig: {
    scale: 2400,
    center: [-99.5, 31.5],    // center of Texas
  },
},
```

---

## Configuration Reference

### ExplorationConfig

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for this exploration. Used as the key in the data file. |
| `name` | `string` | Yes | Display name shown in the tab. |
| `icon` | `string` | Yes | Emoji or text shown next to the tab name. |
| `description` | `string` | No | Description shown on hover (future use). |
| `mapType` | `'world' \| 'us-states' \| 'custom'` | Yes | Use `'custom'` for new explorations. |
| `geoUrl` | `string` | Yes | Path to the TopoJSON file in `public/geo/`. |
| `locations` | `LocationConfig[]` | Yes | Array of all locations in this exploration. |
| `topoKey` | `string` | Yes | Key inside the TopoJSON `objects` to use. |
| `matchProperty` | `string` | Yes | Property name in `geometry.properties` to match against location IDs. |
| `useMarkers` | `boolean` | No | Set `true` for point-based markers instead of region fills. |
| `geoFilter` | `{ property, values }` | No | Filter which geographies to render. |
| `projection` | `string` | No | D3 projection name (default: `'geoEqualEarth'`). |
| `projectionConfig` | `object` | No | Projection settings like `scale`, `center`, `rotate`. |

### LocationConfig

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique ID. For region mode, must match the geo data's match property value. |
| `name` | `string` | Yes | Human-readable display name. |
| `coordinates` | `[number, number]` | Marker mode | `[longitude, latitude]`. Required when `useMarkers: true`. |

### Common Projections

| Projection | Use Case |
|-----------|----------|
| `geoEqualEarth` | World maps (default) |
| `geoAlbersUsa` | US maps (includes Alaska & Hawaii insets) |
| `geoMercator` | Zoomed-in regional maps |
| `geoOrthographic` | Globe view |
| `geoConicEqualArea` | Regional/continental maps |

See the [D3 projections documentation](https://d3js.org/d3-geo/projection) for the full list.

---

## Tips

- **Finding coordinates:** Right-click on Google Maps, copy coordinates, then swap to `[lng, lat]` order.
- **Choosing scale:** Start with `scale: 1000` and adjust. Larger = more zoomed in.
- **Choosing center:** Set `center: [lng, lat]` to the geographic center of your area of interest.
- **Icon ideas:** Use emoji for icons. Browse options at [emojipedia.org](https://emojipedia.org).
- **Data files:** All exploration data is automatically persisted to the JSON data file. No additional setup needed.
- **Hot reload:** When using `npm run dev`, changes to config files are reflected immediately.
