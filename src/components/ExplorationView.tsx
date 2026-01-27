import { useState, useMemo, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { ExplorationConfig, LocationVisitData } from '../types';
import type { useExplorationData } from '../hooks/useExplorationData';
import { useToast } from '../contexts/ToastContext';
import { MapView } from './MapView';
import { LocationList } from './LocationList';
import { LocationDetailModal } from './LocationDetailModal';

interface Props {
  config: ExplorationConfig;
  explorationData: ReturnType<typeof useExplorationData>;
}

export function ExplorationView({ config, explorationData }: Props) {
  const [detailLocationId, setDetailLocationId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const visitedCount = explorationData.getVisitedCount(config.id);
  const totalCount = config.locations.length;
  const percentage =
    totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  const visitedSet = useMemo(() => {
    const set = new Set<string>();
    for (const loc of config.locations) {
      if (explorationData.isVisited(config.id, loc.id)) {
        set.add(loc.id);
      }
    }
    return set;
  }, [config, explorationData]);

  const handleToggle = useCallback(
    (locationId: string) => {
      const wasVisited = visitedSet.has(locationId);
      const locationName =
        config.locations.find((l) => l.id === locationId)?.name || locationId;

      explorationData.toggleLocation(config.id, locationId);

      showToast({
        message: wasVisited
          ? `Unmarked ${locationName}`
          : `Marked ${locationName} as visited`,
        action: {
          label: 'Undo',
          onClick: () => {
            explorationData.toggleLocation(config.id, locationId);
          },
        },
      });
    },
    [config, visitedSet, explorationData, showToast]
  );

  const handleOpenDetail = (locationId: string) => {
    setDetailLocationId(locationId);
  };

  const handleSaveDetail = (
    locationId: string,
    details: Partial<LocationVisitData>
  ) => {
    explorationData.updateLocation(config.id, locationId, details);
    setDetailLocationId(null);
  };

  const handleScreenshot = async () => {
    if (!mapRef.current) return;
    try {
      const dataUrl = await toPng(mapRef.current, {
        backgroundColor: '#0c1425',
      });
      const link = document.createElement('a');
      link.download = `${config.name}-map-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      showToast({ message: 'Map screenshot saved!' });
    } catch {
      showToast({ message: 'Failed to capture screenshot' });
    }
  };

  const detailLocation = detailLocationId
    ? config.locations.find((l) => l.id === detailLocationId)
    : null;

  const detailData = detailLocationId
    ? explorationData.getLocationData(config.id, detailLocationId)
    : null;

  return (
    <>
      <div className="exploration-view">
        <div className="map-panel">
          <div className="map-container">
            <MapView
              ref={mapRef}
              config={config}
              visitedSet={visitedSet}
              onToggle={handleToggle}
            />
            {/* Mobile drawer toggle */}
            <button
              className="drawer-toggle"
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Toggle location list"
            >
              {'\u2630'}
            </button>
          </div>
          <div className="map-progress">
            <div className="progress-stats">
              <span className="progress-count">
                {visitedCount}
                <span className="progress-separator">/</span>
                {totalCount}
              </span>
              <span className="progress-label">explored</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="progress-pct">{percentage}%</span>
            <button
              className="btn-icon screenshot-btn"
              onClick={handleScreenshot}
              title="Save map screenshot"
              aria-label="Save map screenshot"
            >
              {'\u{1F4F7}'}
            </button>
          </div>
        </div>

        <div className={`side-panel-wrapper ${drawerOpen ? 'drawer-open' : ''}`}>
          {drawerOpen && (
            <div
              className="drawer-backdrop"
              onClick={() => setDrawerOpen(false)}
            />
          )}
          <LocationList
            config={config}
            visitedSet={visitedSet}
            explorationData={explorationData}
            onToggle={handleToggle}
            onOpenDetail={handleOpenDetail}
          />
        </div>
      </div>

      {detailLocation && (
        <LocationDetailModal
          location={detailLocation}
          data={detailData}
          onSave={(details) => handleSaveDetail(detailLocation.id, details)}
          onClose={() => setDetailLocationId(null)}
        />
      )}
    </>
  );
}
