import { EXPLORATIONS } from '../config/explorations';
import type { useExplorationData } from '../hooks/useExplorationData';
import { CONTINENT_MAP, CONTINENTS } from '../config/continents';

interface Props {
  explorationData: ReturnType<typeof useExplorationData>;
  onNavigate: (index: number) => void;
}

export function Dashboard({ explorationData, onNavigate }: Props) {
  const totalLocations = EXPLORATIONS.reduce(
    (sum, e) => sum + e.locations.length,
    0
  );
  const totalVisited = EXPLORATIONS.reduce(
    (sum, e) => sum + explorationData.getVisitedCount(e.id),
    0
  );
  const totalPct =
    totalLocations > 0 ? Math.round((totalVisited / totalLocations) * 100) : 0;

  // Continent breakdown for world exploration
  const worldConfig = EXPLORATIONS.find((e) => e.id === 'world');
  const continentStats = CONTINENTS.filter((c) => c !== 'Antarctica').map(
    (continent) => {
      const locs = worldConfig
        ? worldConfig.locations.filter(
            (l) => CONTINENT_MAP[l.id] === continent
          )
        : [];
      const visited = locs.filter((l) =>
        explorationData.isVisited('world', l.id)
      ).length;
      return { continent, total: locs.length, visited };
    }
  );

  // Recent visits (locations with dates, sorted by most recent)
  const recentVisits: { exploration: string; name: string; date: string }[] = [];
  for (const exp of EXPLORATIONS) {
    for (const loc of exp.locations) {
      const data = explorationData.getLocationData(exp.id, loc.id);
      if (data?.visitDates) {
        for (const date of data.visitDates) {
          if (date) {
            recentVisits.push({
              exploration: exp.name,
              name: loc.name,
              date,
            });
          }
        }
      }
    }
  }
  recentVisits.sort((a, b) => b.date.localeCompare(a.date));
  const topRecent = recentVisits.slice(0, 8);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Overview</h2>
        <p className="dashboard-subtitle">
          Your exploration progress at a glance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-cards">
        <div className="dash-card dash-card-total">
          <div className="dash-card-value">{totalVisited}</div>
          <div className="dash-card-label">
            Total Explored
          </div>
          <div className="dash-card-sub">
            out of {totalLocations} locations ({totalPct}%)
          </div>
        </div>
        {EXPLORATIONS.map((exp, i) => {
          const visited = explorationData.getVisitedCount(exp.id);
          const total = exp.locations.length;
          const pct = total > 0 ? Math.round((visited / total) * 100) : 0;
          return (
            <div
              key={exp.id}
              className="dash-card dash-card-link"
              onClick={() => onNavigate(i)}
            >
              <div className="dash-card-icon">{exp.icon}</div>
              <div className="dash-card-value">{visited}</div>
              <div className="dash-card-label">{exp.name}</div>
              <div className="dash-card-bar">
                <div
                  className="dash-card-bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="dash-card-sub">
                {visited}/{total} ({pct}%)
              </div>
            </div>
          );
        })}
      </div>

      {/* Continent Breakdown */}
      {worldConfig && (
        <div className="dashboard-section">
          <h3>World: Continent Breakdown</h3>
          <div className="continent-bars">
            {continentStats.map((cs) => {
              const pct =
                cs.total > 0
                  ? Math.round((cs.visited / cs.total) * 100)
                  : 0;
              return (
                <div key={cs.continent} className="continent-row">
                  <span className="continent-name">{cs.continent}</span>
                  <div className="continent-bar">
                    <div
                      className="continent-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="continent-stat">
                    {cs.visited}/{cs.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Visits */}
      {topRecent.length > 0 && (
        <div className="dashboard-section">
          <h3>Recent Visits</h3>
          <div className="recent-list">
            {topRecent.map((r, i) => (
              <div key={i} className="recent-item">
                <span className="recent-date">{r.date}</span>
                <span className="recent-name">{r.name}</span>
                <span className="recent-exp">{r.exploration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {topRecent.length === 0 && (
        <div className="dashboard-section">
          <h3>Getting Started</h3>
          <p className="dashboard-hint">
            Click on any exploration tab above to start tracking your visits.
            You can click locations on the map or use the side panel list.
            Use the gear icon on visited locations to add dates and notes.
          </p>
        </div>
      )}
    </div>
  );
}
