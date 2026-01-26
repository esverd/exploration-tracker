import { useState, useEffect } from 'react';
import { dataService } from '../api/dataService';
import type { AppSettings } from '../types';

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [dataFilePath, setDataFilePath] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  if (!settings) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <div className="settings-card">
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
          is stored in the <code>data/</code> directory within the project. You
          can change this to any path on your system (e.g.,{' '}
          <code>~/Desktop/my-explorations.json</code>).
        </p>
        <p className="settings-info">
          If the file does not exist at the specified path, a new empty data
          file will be created automatically. If you change the path and data
          already exists at the old location, it will be copied to the new
          location.
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
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
