import { useMemo } from 'react';
import { EXPLORATIONS } from '../config/explorations';
import { CONTINENT_MAP, CONTINENTS } from '../config/continents';
import type { useExplorationData } from '../hooks/useExplorationData';

interface Props {
  explorationData: ReturnType<typeof useExplorationData>;
}

export function Statistics({ explorationData }: Props) {
  const stats = useMemo(() => {
    // Per-exploration stats
    const perExploration = EXPLORATIONS.map((exp) => {
      const visited = explorationData.getVisitedCount(exp.id);
      const total = exp.locations.length;
      const pct = total > 0 ? Math.round((visited / total) * 100) : 0;

      // Most visited locations (by visit count)
      const mostVisited: { name: string; count: number }[] = [];
      for (const loc of exp.locations) {
        const data = explorationData.getLocationData(exp.id, loc.id);
        if (data?.visited && data.visitCount && data.visitCount > 1) {
          mostVisited.push({ name: loc.name, count: data.visitCount });
        }
      }
      mostVisited.sort((a, b) => b.count - a.count);

      return { exp, visited, total, pct, mostVisited: mostVisited.slice(0, 5) };
    });

    // Visit timeline (all dates across all explorations)
    const dateMap = new Map<string, number>();
    for (const exp of EXPLORATIONS) {
      for (const loc of exp.locations) {
        const data = explorationData.getLocationData(exp.id, loc.id);
        if (data?.visitDates) {
          for (const date of data.visitDates) {
            if (date) {
              const year = date.substring(0, 4);
              dateMap.set(year, (dateMap.get(year) || 0) + 1);
            }
          }
        }
      }
    }
    const timeline = Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));
    const maxTimelineVal = Math.max(1, ...timeline.map((t) => t[1]));

    // Continent stats
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

    return { perExploration, timeline, maxTimelineVal, continentStats };
  }, [explorationData]);

  return (
    <div className="statistics">
      <div className="dashboard-header">
        <h2>Statistics</h2>
        <p className="dashboard-subtitle">
          Detailed breakdown of your explorations
        </p>
      </div>

      {/* Progress per exploration */}
      <div className="dashboard-section">
        <h3>Progress by Exploration</h3>
        <div className="stat-bars">
          {stats.perExploration.map((s) => (
            <div key={s.exp.id} className="stat-bar-row">
              <span className="stat-bar-label">
                {s.exp.icon} {s.exp.name}
              </span>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill"
                  style={{ width: `${s.pct}%` }}
                />
              </div>
              <span className="stat-bar-value">
                {s.visited}/{s.total} ({s.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Visit Timeline */}
      {stats.timeline.length > 0 && (
        <div className="dashboard-section">
          <h3>Visits by Year</h3>
          <div className="timeline-chart">
            {stats.timeline.map(([year, count]) => (
              <div key={year} className="timeline-bar-col">
                <div className="timeline-bar-wrapper">
                  <div
                    className="timeline-bar"
                    style={{
                      height: `${(count / stats.maxTimelineVal) * 100}%`,
                    }}
                  />
                </div>
                <span className="timeline-count">{count}</span>
                <span className="timeline-year">{year}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continent breakdown */}
      <div className="dashboard-section">
        <h3>World: Continents</h3>
        <div className="stat-bars">
          {stats.continentStats.map((cs) => {
            const pct =
              cs.total > 0
                ? Math.round((cs.visited / cs.total) * 100)
                : 0;
            return (
              <div key={cs.continent} className="stat-bar-row">
                <span className="stat-bar-label">{cs.continent}</span>
                <div className="stat-bar">
                  <div
                    className="stat-bar-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="stat-bar-value">
                  {cs.visited}/{cs.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Visited */}
      {stats.perExploration.some((s) => s.mostVisited.length > 0) && (
        <div className="dashboard-section">
          <h3>Most Visited Locations</h3>
          {stats.perExploration
            .filter((s) => s.mostVisited.length > 0)
            .map((s) => (
              <div key={s.exp.id} className="most-visited-group">
                <h4>
                  {s.exp.icon} {s.exp.name}
                </h4>
                <div className="most-visited-list">
                  {s.mostVisited.map((mv) => (
                    <div key={mv.name} className="most-visited-item">
                      <span className="most-visited-name">{mv.name}</span>
                      <span className="most-visited-count">
                        {mv.count} visits
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
