import { useState, useMemo } from 'react';
import type { ExplorationConfig } from '../types';
import type { useExplorationData } from '../hooks/useExplorationData';
import { CONTINENT_MAP, CONTINENTS } from '../config/continents';

type SortOption = 'name-asc' | 'name-desc' | 'count-desc' | 'recent';

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
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [continentFilter, setContinentFilter] = useState<string>('all');

  const isWorldExploration = config.id === 'world';

  const { visited, notVisited } = useMemo(() => {
    const searchLower = search.toLowerCase();

    let filtered = config.locations.filter((loc) =>
      loc.name.toLowerCase().includes(searchLower)
    );

    // Apply continent filter for world exploration
    if (isWorldExploration && continentFilter !== 'all') {
      filtered = filtered.filter(
        (loc) => CONTINENT_MAP[loc.id] === continentFilter
      );
    }

    const v: typeof filtered = [];
    const nv: typeof filtered = [];

    for (const loc of filtered) {
      if (visitedSet.has(loc.id)) {
        v.push(loc);
      } else {
        nv.push(loc);
      }
    }

    // Sort function
    const sortFn = (a: (typeof filtered)[0], b: (typeof filtered)[0]) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'count-desc') {
        const aData = explorationData.getLocationData(config.id, a.id);
        const bData = explorationData.getLocationData(config.id, b.id);
        const aCount = aData?.visitCount ?? 0;
        const bCount = bData?.visitCount ?? 0;
        if (bCount !== aCount) return bCount - aCount;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'recent') {
        const aData = explorationData.getLocationData(config.id, a.id);
        const bData = explorationData.getLocationData(config.id, b.id);
        const aDate =
          aData?.visitDates && aData.visitDates.length > 0
            ? [...aData.visitDates].sort().reverse()[0]
            : '';
        const bDate =
          bData?.visitDates && bData.visitDates.length > 0
            ? [...bData.visitDates].sort().reverse()[0]
            : '';
        if (bDate !== aDate) return bDate.localeCompare(aDate);
        return a.name.localeCompare(b.name);
      }
      return 0;
    };

    v.sort(sortFn);
    nv.sort(sortFn);

    return { visited: v, notVisited: nv };
  }, [config, visitedSet, search, sortBy, continentFilter, isWorldExploration, explorationData]);

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

  const noResults =
    visited.length === 0 && notVisited.length === 0 && search.length > 0;

  return (
    <aside className="side-panel">
      <div className="side-panel-header">
        <input
          type="text"
          className="search-input"
          placeholder={`Search ${config.locations.length} ${config.name.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={`Search ${config.name}`}
        />
        <div className="list-controls">
          <select
            className="list-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort locations"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="count-desc">Most Visits</option>
            <option value="recent">Most Recent</option>
          </select>
          {isWorldExploration && (
            <select
              className="list-select"
              value={continentFilter}
              onChange={(e) => setContinentFilter(e.target.value)}
              aria-label="Filter by continent"
            >
              <option value="all">All Continents</option>
              {CONTINENTS.filter((c) => c !== 'Antarctica').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onToggle(loc.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed="true"
                  aria-label={`${loc.name}, visited. Press to unmark.`}
                >
                  <div className="location-checkbox checked" aria-hidden="true" />
                  <span className="location-name">{loc.name}</span>
                  {meta && <span className="location-meta">{meta}</span>}
                  <button
                    className="location-settings-btn"
                    title="Edit visit details"
                    aria-label={`Edit visit details for ${loc.name}`}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggle(loc.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed="false"
                aria-label={`${loc.name}, not visited. Press to mark as visited.`}
              >
                <div className="location-checkbox" aria-hidden="true" />
                <span className="location-name">{loc.name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
