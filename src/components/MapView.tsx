import { useState, useCallback, memo, forwardRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
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
  const name =
    geo.properties['NAME'] ||
    geo.properties['name'] ||
    geo.properties['NAME_LONG'] ||
    geo.properties[config.matchProperty];
  return String(name || 'Unknown');
}

function shouldShowGeo(
  geo: { properties: Record<string, unknown> },
  config: ExplorationConfig
): boolean {
  if (!config.geoFilter) return true;
  const val = geo.properties[config.geoFilter.property];
  return config.geoFilter.values.includes(String(val));
}

export const MapView = memo(
  forwardRef<HTMLDivElement, Props>(function MapView(
    { config, visitedSet, onToggle },
    ref
  ) {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const [zoom, setZoom] = useState(1);
    const [center, setCenter] = useState<[number, number]>([0, 0]);

    const handleZoomIn = useCallback(() => {
      setZoom((z) => Math.min(z * 1.5, 8));
    }, []);

    const handleZoomOut = useCallback(() => {
      setZoom((z) => Math.max(z / 1.5, 1));
    }, []);

    const handleMoveEnd = useCallback(
      (position: { coordinates: [number, number]; zoom: number }) => {
        setCenter(position.coordinates);
        setZoom(position.zoom);
      },
      []
    );

    const showTooltip = useCallback(
      (name: string, visited: boolean, evt: React.MouseEvent) => {
        setTooltip({
          content: `${name}${visited ? ' \u2713' : ''}`,
          x: evt.clientX + 12,
          y: evt.clientY - 28,
        });
      },
      []
    );

    const hideTooltip = useCallback(() => setTooltip(null), []);

    /* ---------- Region (polygon) handlers ---------- */
    const handleGeoMouseMove = useCallback(
      (
        geo: { properties: Record<string, unknown> },
        evt: React.MouseEvent
      ) => {
        const id = getLocationId(geo, config);
        const loc = id ? config.locations.find((l) => l.id === id) : null;
        const displayName = loc ? loc.name : getLocationName(geo, config);
        const visited = id ? visitedSet.has(id) : false;
        showTooltip(displayName, visited, evt);
      },
      [config, visitedSet, showTooltip]
    );

    const handleGeoClick = useCallback(
      (geo: { properties: Record<string, unknown> }) => {
        const id = getLocationId(geo, config);
        if (id && config.locations.some((loc) => loc.id === id)) {
          onToggle(id);
        }
      },
      [config, onToggle]
    );

    /* ---------- Marker (point) handlers ---------- */
    const handleMarkerMouseMove = useCallback(
      (locationId: string, name: string, evt: React.MouseEvent) => {
        showTooltip(name, visitedSet.has(locationId), evt);
      },
      [visitedSet, showTooltip]
    );

    const handleMarkerClick = useCallback(
      (locationId: string) => {
        onToggle(locationId);
      },
      [onToggle]
    );

    const projectionConfig = (config.projectionConfig || {}) as {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
    };

    const isMarkerMode = config.useMarkers === true;

    return (
      <div ref={ref} className="map-wrapper">
        <ComposableMap
          projection={config.projection || 'geoEqualEarth'}
          projectionConfig={projectionConfig}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            onMoveEnd={handleMoveEnd}
            minZoom={1}
            maxZoom={8}
          >
            {/* Background geographies */}
            <Geographies geography={config.geoUrl}>
              {({ geographies }) =>
                geographies
                  .filter((geo) => shouldShowGeo(geo, config))
                  .map((geo) => {
                    if (isMarkerMode) {
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          style={{
                            default: {
                              fill: '#1e293b',
                              stroke: '#334155',
                              strokeWidth: 0.5,
                              outline: 'none',
                            },
                            hover: {
                              fill: '#1e293b',
                              stroke: '#334155',
                              strokeWidth: 0.5,
                              outline: 'none',
                            },
                            pressed: {
                              fill: '#1e293b',
                              stroke: '#334155',
                              strokeWidth: 0.5,
                              outline: 'none',
                            },
                          }}
                        />
                      );
                    }

                    const id = getLocationId(geo, config);
                    const isVisited = id ? visitedSet.has(id) : false;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleGeoClick(geo)}
                        onMouseMove={(evt) => handleGeoMouseMove(geo, evt)}
                        onMouseLeave={hideTooltip}
                        style={{
                          default: {
                            fill: isVisited
                              ? 'var(--color-visited)'
                              : 'var(--color-not-visited)',
                            stroke: '#1e293b',
                            strokeWidth: 0.5,
                            outline: 'none',
                          },
                          hover: {
                            fill: isVisited
                              ? 'var(--color-visited-hover)'
                              : 'var(--color-not-visited-hover)',
                            stroke: '#1e293b',
                            strokeWidth: 0.5,
                            outline: 'none',
                            cursor: 'pointer',
                          },
                          pressed: {
                            fill: isVisited
                              ? 'var(--color-visited-hover)'
                              : 'var(--color-not-visited-hover)',
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

            {/* Point markers (only in marker mode) */}
            {isMarkerMode &&
              config.locations.map((loc) => {
                if (!loc.coordinates) return null;
                const isVisited = visitedSet.has(loc.id);
                return (
                  <Marker
                    key={loc.id}
                    coordinates={loc.coordinates}
                    onClick={() => handleMarkerClick(loc.id)}
                    onMouseMove={(evt) =>
                      handleMarkerMouseMove(loc.id, loc.name, evt)
                    }
                    onMouseLeave={hideTooltip}
                  >
                    <circle
                      r={4}
                      fill={isVisited ? 'var(--color-visited)' : '#94a3b8'}
                      stroke={
                        isVisited ? 'var(--color-visited-hover)' : '#64748b'
                      }
                      strokeWidth={1.5}
                      style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
                    />
                  </Marker>
                );
              })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Zoom Controls */}
        <div className="map-zoom-controls">
          <button
            className="map-zoom-btn"
            onClick={handleZoomIn}
            title="Zoom in"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            className="map-zoom-btn"
            onClick={handleZoomOut}
            title="Zoom out"
            aria-label="Zoom out"
          >
            {'\u2212'}
          </button>
        </div>

        {/* Map Legend */}
        <div className="map-legend">
          <div className="map-legend-item">
            <span
              className="map-legend-swatch"
              style={{ background: 'var(--color-visited)' }}
            />
            Visited
          </div>
          <div className="map-legend-item">
            <span
              className="map-legend-swatch"
              style={{
                background: isMarkerMode
                  ? '#94a3b8'
                  : 'var(--color-not-visited)',
              }}
            />
            Not visited
          </div>
        </div>

        {tooltip && (
          <div
            className="map-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    );
  })
);
