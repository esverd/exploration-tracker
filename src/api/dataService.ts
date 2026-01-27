import type { ExplorationData, LocationVisitData, AppSettings } from '../types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'API request failed');
  }
  return json.data;
}

export const dataService = {
  /** Fetch all exploration data */
  async getData(): Promise<ExplorationData> {
    return request<ExplorationData>('/data');
  },

  /** Save all exploration data */
  async saveData(data: ExplorationData): Promise<void> {
    await request('/data', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** Toggle a location's visited status */
  async toggleLocation(
    explorationId: string,
    locationId: string
  ): Promise<ExplorationData> {
    return request<ExplorationData>(
      `/data/${explorationId}/${locationId}/toggle`,
      { method: 'POST' }
    );
  },

  /** Update location details */
  async updateLocation(
    explorationId: string,
    locationId: string,
    details: Partial<LocationVisitData>
  ): Promise<ExplorationData> {
    return request<ExplorationData>(
      `/data/${explorationId}/${locationId}`,
      {
        method: 'PUT',
        body: JSON.stringify(details),
      }
    );
  },

  /** Get app settings */
  async getSettings(): Promise<AppSettings> {
    return request<AppSettings>('/settings');
  },

  /** Update app settings */
  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    return request<AppSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  /** Export data as a downloadable JSON file */
  async exportData(): Promise<void> {
    const data = await this.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exploration-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /** Import data from a JSON file */
  async importData(file: File): Promise<ExplorationData> {
    const text = await file.text();
    const data = JSON.parse(text) as ExplorationData;
    if (!data.explorations || typeof data.explorations !== 'object') {
      throw new Error('Invalid data file: missing "explorations" object');
    }
    await request('/data', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return data;
  },
};
