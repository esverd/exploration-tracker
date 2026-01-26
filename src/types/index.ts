/** Configuration for a single exploration map/tab */
export interface ExplorationConfig {
  id: string;
  name: string;
  icon: string;
  description?: string;
  mapType: 'world' | 'us-states';
  geoUrl: string;
  locations: LocationConfig[];
  projection?: string;
  projectionConfig?: Record<string, unknown>;
  /** Property name in TopoJSON objects to use */
  topoKey: string;
  /** Property in geography.properties to match location IDs */
  matchProperty: string;
}

/** Definition of a single location within an exploration */
export interface LocationConfig {
  id: string;
  name: string;
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
