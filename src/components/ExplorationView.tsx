import { useState, useMemo } from 'react';
import type { ExplorationConfig, LocationVisitData } from '../types';
import type { useExplorationData } from '../hooks/useExplorationData';
import { MapView } from './MapView';
import { LocationList } from './LocationList';
import { LocationDetailModal } from './LocationDetailModal';

interface Props {
  config: ExplorationConfig;
  explorationData: ReturnType<typeof useExplorationData>;
}

export function ExplorationView({ config, explorationData }: Props) {
  const [detailLocationId, setDetailLocationId] = useState<string | null>(null);

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

  const handleToggle = (locationId: string) => {
    explorationData.toggleLocation(config.id, locationId);
  };

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
              config={config}
              visitedSet={visitedSet}
              onToggle={handleToggle}
            />
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
          </div>
        </div>

        <LocationList
          config={config}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={handleToggle}
          onOpenDetail={handleOpenDetail}
        />
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
