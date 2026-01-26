/** Configuration for a single exploration map/tab */
export interface ExplorationConfig {
  id: string;
  name: string;
  icon: string;
  description?: string;
  mapType: 'world' | 'us-states' | 'custom';
  geoUrl: string;
  locations: LocationConfig[];
  projection?: string;
  projectionConfig?: Record<string, unknown>;
  /** Property name in TopoJSON objects to use */
  topoKey: string;
  /** Property in geography.properties to match location IDs */
  matchProperty: string;

  /**
   * When true, locations are rendered as point markers on the map
   * instead of filled geographic regions. Each location must have
   * a `coordinates` field ([longitude, latitude]).
   */
  useMarkers?: boolean;

  /**
   * Optional filter to control which geographies from the TopoJSON
   * are rendered as the background map. Useful when a broad TopoJSON
   * file is used but only a subset should be shown (e.g. show only
   * Texas from the full US states file).
   *
   * If omitted, all geographies are rendered.
   */
  geoFilter?: {
    /** Property name in geography.properties to test */
    property: string;
    /** Values that should be included */
    values: string[];
  };
}

/** Definition of a single location within an exploration */
export interface LocationConfig {
  id: string;
  name: string;
  /**
   * Coordinates as [longitude, latitude]. Required when the
   * exploration uses `useMarkers: true`.
   */
  coordinates?: [number, number];
}

/** User's visit data for a single location */
export interface LocationVisitData {
  visited: boolean;
  visitCount?: number;
  visitDates?: string[];
  notes?: string;
}

/** All user data stored in the JSON file */
export interface ExplorationData {
  explorations: {
    [explorationId: string]: {
      [locationId: string]: LocationVisitData;
    };
  };
}

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Settings stored in a separate config */
export interface AppSettings {
  dataFilePath: string;
}
