import type { ExplorationConfig } from '../types';
import { WORLD_COUNTRIES } from './world-countries';
import { US_STATES } from './us-states';
import { TEXAS_STATE_PARKS } from './texas-state-parks';

/**
 * Exploration configurations.
 *
 * To add a new exploration:
 * 1. Create a new file with location definitions (like world-countries.ts or us-states.ts)
 * 2. Add a new ExplorationConfig entry to this array
 * 3. The app will automatically create a new tab for it
 *
 * See ADDING_EXPLORATIONS.md for a full walkthrough.
 */
export const EXPLORATIONS: ExplorationConfig[] = [
  {
    id: 'world',
    name: 'World',
    icon: '\u{1F30D}',
    description: 'Track countries you have visited around the world',
    mapType: 'world',
    geoUrl: '/geo/world-countries-110m.json',
    locations: WORLD_COUNTRIES,
    topoKey: 'countries',
    matchProperty: 'name',
    projection: 'geoEqualEarth',
    projectionConfig: {
      scale: 160,
      center: [0, 0],
    },
  },
  {
    id: 'us-states',
    name: 'US States',
    icon: '\u{1F1FA}\u{1F1F8}',
    description: 'Track US states you have visited',
    mapType: 'us-states',
    geoUrl: '/geo/us-states-10m.json',
    locations: US_STATES,
    topoKey: 'states',
    matchProperty: 'name',
    projection: 'geoAlbersUsa',
    projectionConfig: {
      scale: 1000,
    },
  },
  {
    id: 'texas-state-parks',
    name: 'TX State Parks',
    icon: '\u{1F332}',
    description: 'Track Texas state parks, natural areas, and historic sites you have visited',
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
      center: [-99.5, 31.5],
    },
  },
];
