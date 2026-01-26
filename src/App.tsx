import { useState } from 'react';
import { EXPLORATIONS } from './config/explorations';
import { useExplorationData } from './hooks/useExplorationData';
import { ExplorationView } from './components/ExplorationView';
import { SettingsPage } from './components/SettingsPage';

type View = { type: 'exploration'; index: number } | { type: 'settings' };

export default function App() {
  const [view, setView] = useState<View>({ type: 'exploration', index: 0 });
  const explorationData = useExplorationData();

  return (
    <>
      <header className="app-header">
        <h1>
          <span role="img" aria-label="globe">{'\u{1F30D}'}</span>
          Exploration Tracker
        </h1>
        <div className="header-actions">
          <button
            className="btn-icon"
            title="Settings"
            onClick={() =>
              setView(
                view.type === 'settings'
                  ? { type: 'exploration', index: 0 }
                  : { type: 'settings' }
              )
            }
          >
            {view.type === 'settings' ? '\u{2190}' : '\u{2699}\u{FE0F}'}
          </button>
        </div>
      </header>

      {view.type === 'settings' ? (
        <div className="app-content">
          <SettingsPage />
        </div>
      ) : (
        <>
          <nav className="tab-bar">
            {EXPLORATIONS.map((exploration, i) => {
              const count = explorationData.getVisitedCount(exploration.id);
              return (
                <button
                  key={exploration.id}
                  className={`tab-button ${
                    view.type === 'exploration' && view.index === i
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => setView({ type: 'exploration', index: i })}
                >
                  <span>{exploration.icon}</span>
                  {exploration.name}
                  {count > 0 && <span className="tab-badge">{count}</span>}
                </button>
              );
            })}
          </nav>

          <div className="app-content">
            {explorationData.loading ? (
              <div className="loading">Loading exploration data...</div>
            ) : explorationData.error ? (
              <div className="error-banner">{explorationData.error}</div>
            ) : (
              <ExplorationView
                config={EXPLORATIONS[view.index]}
                explorationData={explorationData}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}
