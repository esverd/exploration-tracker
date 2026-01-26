import { useState, useCallback, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import type { ExplorationConfig } from '../types';

interface Props {
  config: ExplorationConfig;
  visitedSet: Set<string>;
  onToggle: (locationId: string) => void;
}

interface TooltipState {
  content: string;
  x: number;
  y: number;
}

function getLocationId(
  geo: { properties: Record<string, unknown> },
  config: ExplorationConfig
): string | null {
  const val = geo.properties[config.matchProperty];
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return null;
}

function getLocationName(
  geo: { properties: Record<string, unknown> },
  config: ExplorationConfig
): string {
  // Try to get a human-readable name from properties
  const name =
    geo.properties['NAME'] ||
    geo.properties['name'] ||
    geo.properties['NAME_LONG'] ||
    geo.properties[config.matchProperty];
  return String(name || 'Unknown');
}

export const MapView = memo(function MapView({
  config,
  visitedSet,
  onToggle,
}: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const handleMouseMove = useCallback(
    (
      geo: { properties: Record<string, unknown> },
      evt: React.MouseEvent
    ) => {
      const id = getLocationId(geo, config);
      // Show the friendly display name from our config if we have a match
      const loc = id ? config.locations.find((l) => l.id === id) : null;
      const displayName = loc ? loc.name : getLocationName(geo, config);
      const visited = id ? visitedSet.has(id) : false;
      setTooltip({
        content: `${displayName}${visited ? ' \u2713' : ''}`,
        x: evt.clientX + 12,
        y: evt.clientY - 28,
      });
    },
    [config, visitedSet]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleClick = useCallback(
    (geo: { properties: Record<string, unknown> }) => {
      const id = getLocationId(geo, config);
      if (id) {
        // Check if this ID exists in our location config
        const exists = config.locations.some((loc) => loc.id === id);
        if (exists) {
          onToggle(id);
        }
      }
    },
    [config, onToggle]
  );

  const projectionConfig = (config.projectionConfig || {}) as {
    scale?: number;
    center?: [number, number];
    rotate?: [number, number, number];
  };

  return (
    <>
      <ComposableMap
        projection={config.projection || 'geoEqualEarth'}
        projectionConfig={projectionConfig}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={config.geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const id = getLocationId(geo, config);
                const isVisited = id ? visitedSet.has(id) : false;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleClick(geo)}
                    onMouseMove={(evt) => handleMouseMove(geo, evt)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: isVisited ? '#22c55e' : '#334155',
                        stroke: '#1e293b',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                      hover: {
                        fill: isVisited ? '#16a34a' : '#475569',
                        stroke: '#1e293b',
                        strokeWidth: 0.5,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: isVisited ? '#15803d' : '#64748b',
                        stroke: '#1e293b',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div
          className="map-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  );
});
