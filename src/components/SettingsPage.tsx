import { useState, useEffect, useRef } from 'react';
import { dataService } from '../api/dataService';
import { useToast } from '../contexts/ToastContext';
import { useTheme, DEFAULT_COLORS } from '../contexts/ThemeContext';
import type { AppSettings } from '../types';

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [dataFilePath, setDataFilePath] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const { colors, setColors, resetColors } = useTheme();

  // Local color state for pickers
  const [localColors, setLocalColors] = useState(colors);

  useEffect(() => {
    dataService.getSettings().then((s) => {
      setSettings(s);
      setDataFilePath(s.dataFilePath);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const updated = await dataService.updateSettings({ dataFilePath });
      setSettings(updated);
      setMessage('Settings saved successfully.');
    } catch (err) {
      setMessage(
        'Failed to save settings: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      await dataService.exportData();
      showToast({ message: 'Data exported successfully!' });
    } catch {
      showToast({ message: 'Failed to export data' });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await dataService.importData(file);
      showToast({ message: 'Data imported successfully! Reloading...' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast({
        message:
          'Import failed: ' +
          (err instanceof Error ? err.message : 'Unknown error'),
      });
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleColorChange = (key: keyof typeof localColors, value: string) => {
    setLocalColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyColors = () => {
    setColors(localColors);
    showToast({ message: 'Theme colors applied!' });
  };

  const handleResetColors = () => {
    resetColors();
    setLocalColors(DEFAULT_COLORS);
    showToast({ message: 'Theme colors reset to defaults' });
  };

  if (!settings) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      {/* Data File Path */}
      <div className="settings-card">
        <h3 className="settings-card-title">Data Storage</h3>
        <div className="form-group">
          <label className="form-label">Data file path</label>
          <input
            type="text"
            className="form-input"
            value={dataFilePath}
            onChange={(e) => setDataFilePath(e.target.value)}
            placeholder="./data/exploration-data.json"
          />
        </div>

        <p className="settings-info">
          This is the path where your exploration data is stored. By default it
          is stored in the <code>data/</code> directory within the project.
        </p>

        {message && (
          <div
            className={
              message.includes('success') ? 'settings-info' : 'error-banner'
            }
            style={
              message.includes('success')
                ? { color: 'var(--color-visited)' }
                : undefined
            }
          >
            {message}
          </div>
        )}

        <div className="settings-actions">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Path'}
          </button>
        </div>
      </div>

      {/* Export / Import */}
      <div className="settings-card">
        <h3 className="settings-card-title">Export & Import</h3>
        <p className="settings-info">
          Export your exploration data as a JSON file for backup, or import a
          previously exported file. Importing will replace all current data.
        </p>
        <div className="settings-actions">
          <button className="btn btn-primary" onClick={handleExport}>
            Export Data
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Import Data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>
      </div>

      {/* Theme Colors */}
      <div className="settings-card">
        <h3 className="settings-card-title">Theme Colors</h3>
        <p className="settings-info">
          Customize the colors used for visited and not-visited locations on the
          map and throughout the app.
        </p>

        <div className="color-picker-grid">
          <div className="color-picker-item">
            <label className="form-label">Visited</label>
            <div className="color-picker-row">
              <input
                type="color"
                value={localColors.visited}
                onChange={(e) => handleColorChange('visited', e.target.value)}
              />
              <span className="color-picker-value">{localColors.visited}</span>
            </div>
          </div>
          <div className="color-picker-item">
            <label className="form-label">Visited Hover</label>
            <div className="color-picker-row">
              <input
                type="color"
                value={localColors.visitedHover}
                onChange={(e) =>
                  handleColorChange('visitedHover', e.target.value)
                }
              />
              <span className="color-picker-value">
                {localColors.visitedHover}
              </span>
            </div>
          </div>
          <div className="color-picker-item">
            <label className="form-label">Not Visited</label>
            <div className="color-picker-row">
              <input
                type="color"
                value={localColors.notVisited}
                onChange={(e) =>
                  handleColorChange('notVisited', e.target.value)
                }
              />
              <span className="color-picker-value">
                {localColors.notVisited}
              </span>
            </div>
          </div>
          <div className="color-picker-item">
            <label className="form-label">Not Visited Hover</label>
            <div className="color-picker-row">
              <input
                type="color"
                value={localColors.notVisitedHover}
                onChange={(e) =>
                  handleColorChange('notVisitedHover', e.target.value)
                }
              />
              <span className="color-picker-value">
                {localColors.notVisitedHover}
              </span>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn btn-primary" onClick={handleApplyColors}>
            Apply Colors
          </button>
          <button className="btn btn-secondary" onClick={handleResetColors}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
