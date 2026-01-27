import { useState } from 'react';
import { EXPLORATIONS } from './config/explorations';
import { useExplorationData } from './hooks/useExplorationData';
import { usePWAInstall } from './hooks/usePWAInstall';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from './components/Toast';
import { ExplorationView } from './components/ExplorationView';
import { Dashboard } from './components/Dashboard';
import { Statistics } from './components/Statistics';
import { SettingsPage } from './components/SettingsPage';

type View =
  | { type: 'dashboard' }
  | { type: 'exploration'; index: number }
  | { type: 'statistics' }
  | { type: 'settings' };

function AppContent() {
  const [view, setView] = useState<View>({ type: 'dashboard' });
  const explorationData = useExplorationData();
  const pwa = usePWAInstall();
  const [installDismissed, setInstallDismissed] = useState(false);

  const isTab = (v: View, tab: string, index?: number): boolean => {
    if (v.type === tab) {
      if (index !== undefined && v.type === 'exploration') {
        return (v as { type: 'exploration'; index: number }).index === index;
      }
      return true;
    }
    return false;
  };

  return (
    <>
      <header className="app-header">
        <h1>
          <span role="img" aria-label="globe">
            {'\u{1F30D}'}
          </span>
          Exploration Tracker
        </h1>
        <div className="header-actions">
          <button
            className="btn-icon"
            title="Settings"
            onClick={() =>
              setView(
                view.type === 'settings'
                  ? { type: 'dashboard' }
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
            <button
              className={`tab-button ${isTab(view, 'dashboard') ? 'active' : ''}`}
              onClick={() => setView({ type: 'dashboard' })}
            >
              {'\u{1F4CA}'} Overview
            </button>
            {EXPLORATIONS.map((exploration, i) => {
              const count = explorationData.getVisitedCount(exploration.id);
              return (
                <button
                  key={exploration.id}
                  className={`tab-button ${
                    isTab(view, 'exploration', i) ? 'active' : ''
                  }`}
                  onClick={() => setView({ type: 'exploration', index: i })}
                >
                  <span>{exploration.icon}</span>
                  {exploration.name}
                  {count > 0 && <span className="tab-badge">{count}</span>}
                </button>
              );
            })}
            <button
              className={`tab-button ${isTab(view, 'statistics') ? 'active' : ''}`}
              onClick={() => setView({ type: 'statistics' })}
            >
              {'\u{1F4C8}'} Stats
            </button>
          </nav>

          <div className="app-content">
            {explorationData.loading ? (
              <div className="loading">Loading exploration data...</div>
            ) : explorationData.error ? (
              <div className="error-banner">{explorationData.error}</div>
            ) : view.type === 'dashboard' ? (
              <Dashboard
                explorationData={explorationData}
                onNavigate={(i) => setView({ type: 'exploration', index: i })}
              />
            ) : view.type === 'statistics' ? (
              <Statistics explorationData={explorationData} />
            ) : view.type === 'exploration' ? (
              <ExplorationView
                config={EXPLORATIONS[view.index]}
                explorationData={explorationData}
              />
            ) : null}
          </div>
        </>
      )}

      {pwa.canInstall && !installDismissed && (
        <div className="pwa-install-banner">
          <span className="pwa-install-text">
            Install Exploration Tracker as an app for a better experience
          </span>
          <button className="btn btn-primary btn-sm" onClick={pwa.install}>
            Install
          </button>
          <button
            className="pwa-install-dismiss"
            onClick={() => setInstallDismissed(true)}
            aria-label="Dismiss"
          >
            {'\u00D7'}
          </button>
        </div>
      )}

      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
