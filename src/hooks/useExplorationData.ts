import { useState, useEffect, useCallback } from 'react';
import type { ExplorationData, LocationVisitData } from '../types';
import { dataService } from '../api/dataService';

export function useExplorationData() {
  const [data, setData] = useState<ExplorationData>({ explorations: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dataService.getData();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleLocation = useCallback(
    async (explorationId: string, locationId: string) => {
      try {
        const result = await dataService.toggleLocation(explorationId, locationId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to toggle location');
      }
    },
    []
  );

  const updateLocation = useCallback(
    async (
      explorationId: string,
      locationId: string,
      details: Partial<LocationVisitData>
    ) => {
      try {
        const result = await dataService.updateLocation(
          explorationId,
          locationId,
          details
        );
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update location'
        );
      }
    },
    []
  );

  const isVisited = useCallback(
    (explorationId: string, locationId: string): boolean => {
      return (
        data.explorations[explorationId]?.[locationId]?.visited ?? false
      );
    },
    [data]
  );

  const getLocationData = useCallback(
    (explorationId: string, locationId: string): LocationVisitData | null => {
      return data.explorations[explorationId]?.[locationId] ?? null;
    },
    [data]
  );

  const getVisitedCount = useCallback(
    (explorationId: string): number => {
      const exploration = data.explorations[explorationId];
      if (!exploration) return 0;
      return Object.values(exploration).filter((loc) => loc.visited).length;
    },
    [data]
  );

  return {
    data,
    loading,
    error,
    toggleLocation,
    updateLocation,
    isVisited,
    getLocationData,
    getVisitedCount,
    refetch: fetchData,
  };
}
