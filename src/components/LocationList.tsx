import { useState, useMemo } from 'react';
import type { ExplorationConfig } from '../types';
import type { useExplorationData } from '../hooks/useExplorationData';

interface Props {
  config: ExplorationConfig;
  visitedSet: Set<string>;
  explorationData: ReturnType<typeof useExplorationData>;
  onToggle: (locationId: string) => void;
  onOpenDetail: (locationId: string) => void;
}

export function LocationList({
  config,
  visitedSet,
  explorationData,
  onToggle,
  onOpenDetail,
}: Props) {
  const [search, setSearch] = useState('');

  const { visited, notVisited } = useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered = config.locations.filter((loc) =>
      loc.name.toLowerCase().includes(searchLower)
    );

    const v: typeof filtered = [];
    const nv: typeof filtered = [];

    for (const loc of filtered) {
      if (visitedSet.has(loc.id)) {
        v.push(loc);
      } else {
        nv.push(loc);
      }
    }

    v.sort((a, b) => a.name.localeCompare(b.name));
    nv.sort((a, b) => a.name.localeCompare(b.name));

    return { visited: v, notVisited: nv };
  }, [config.locations, visitedSet, search]);

  const formatMeta = (locationId: string): string | null => {
    const data = explorationData.getLocationData(config.id, locationId);
    if (!data) return null;

    const parts: string[] = [];
    if (data.visitCount && data.visitCount > 1) {
      parts.push(`${data.visitCount}x`);
    }
    if (data.visitDates && data.visitDates.length > 0) {
      const latest = [...data.visitDates].sort().reverse()[0];
      parts.push(latest);
    }
    return parts.length > 0 ? parts.join(' \u00B7 ') : null;
  };

  const noResults = visited.length === 0 && notVisited.length === 0 && search.length > 0;

  return (
    <aside className="side-panel">
      <div className="side-panel-header">
        <input
          type="text"
          className="search-input"
          placeholder={`Search ${config.locations.length} ${config.name.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="side-panel-content">
        {noResults && (
          <div className="empty-search">
            No results for &ldquo;{search}&rdquo;
          </div>
        )}

        {visited.length > 0 && (
          <>
            <div className="list-section-header">
              Visited ({visited.length})
            </div>
            {visited.map((loc) => {
              const meta = formatMeta(loc.id);
              return (
                <div
                  key={loc.id}
                  className="location-item"
                  onClick={() => onToggle(loc.id)}
                >
                  <div className="location-checkbox checked" />
                  <span className="location-name">{loc.name}</span>
                  {meta && <span className="location-meta">{meta}</span>}
                  <button
                    className="location-settings-btn"
                    title="Edit visit details"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(loc.id);
                    }}
                  >
                    {'\u2699'}
                  </button>
                </div>
              );
            })}
          </>
        )}

        {notVisited.length > 0 && (
          <>
            <div className="list-section-header">
              Not Visited ({notVisited.length})
            </div>
            {notVisited.map((loc) => (
              <div
                key={loc.id}
                className="location-item"
                onClick={() => onToggle(loc.id)}
              >
                <div className="location-checkbox" />
                <span className="location-name">{loc.name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
