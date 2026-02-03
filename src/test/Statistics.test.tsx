import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Statistics } from '../components/Statistics';
import type { LocationVisitData, ExplorationData } from '../types';
import type { useExplorationData } from '../hooks/useExplorationData';

const createMockExplorationData = (
  data: { [explorationId: string]: { [locationId: string]: LocationVisitData } } = {}
): ReturnType<typeof useExplorationData> => ({
  data: { explorations: data } as ExplorationData,
  loading: false,
  error: null,
  isVisited: (expId: string, locId: string) => !!data[expId]?.[locId]?.visited,
  getVisitedCount: (expId: string) => {
    return data[expId] ? Object.keys(data[expId]).length : 0;
  },
  getLocationData: (expId: string, locId: string): LocationVisitData | null => data[expId]?.[locId] || null,
  toggleLocation: vi.fn(),
  updateLocation: vi.fn(),
  refetch: vi.fn(),
});

describe('Statistics Component', () => {
  describe('Progress Bars', () => {
    it('renders progress bars for each exploration', () => {
      const explorationData = createMockExplorationData({
        world: {
          France: { visited: true },
          Germany: { visited: true },
        },
        'us-states': {
          Texas: { visited: true },
        },
      });

      render(<Statistics explorationData={explorationData} />);

      expect(screen.getByText('Progress by Exploration')).toBeInTheDocument();
      // Check for progress bar rows
      const statBarLabels = document.querySelectorAll('.stat-bar-label');
      const labelTexts = Array.from(statBarLabels).map((l) => l.textContent);
      // Should include exploration names (with emoji prefix)
      expect(labelTexts.some((t) => t?.includes('World'))).toBe(true);
      expect(labelTexts.some((t) => t?.includes('US States'))).toBe(true);
      expect(labelTexts.some((t) => t?.includes('TX State Parks'))).toBe(true);
    });

    it('shows correct counts in progress bars', () => {
      const explorationData = createMockExplorationData({
        world: {
          France: { visited: true },
          Germany: { visited: true },
        },
      });

      render(<Statistics explorationData={explorationData} />);

      // 2 countries visited out of total
      expect(screen.getByText(/2\/206/)).toBeInTheDocument();
    });

    it('handles empty data gracefully', () => {
      const explorationData = createMockExplorationData({});

      render(<Statistics explorationData={explorationData} />);

      // Should still render without crashing
      expect(screen.getByText('Progress by Exploration')).toBeInTheDocument();
      // All counts should be 0
      expect(screen.getByText(/0\/206/)).toBeInTheDocument();
    });
  });

  describe('Timeline Chart', () => {
    it('renders visits by year section when there are dates', () => {
      const explorationData = createMockExplorationData({
        world: {
          France: {
            visited: true,
            visitDates: ['2024-06-15', '2023-12-01'],
          },
        },
      });

      render(<Statistics explorationData={explorationData} />);

      expect(screen.getByText('Visits by Year')).toBeInTheDocument();
    });

    it('shows years with visit dates', () => {
      const explorationData = createMockExplorationData({
        world: {
          France: {
            visited: true,
            visitDates: ['2024-06-15'],
          },
          Germany: {
            visited: true,
            visitDates: ['2023-05-20'],
          },
        },
      });

      render(<Statistics explorationData={explorationData} />);

      expect(screen.getByText('2024')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();
    });

    it('does not show visits by year section when no dated visits', () => {
      const explorationData = createMockExplorationData({
        world: {
          France: { visited: true }, // No dates
        },
      });

      render(<Statistics explorationData={explorationData} />);

      // The timeline section doesn't render when there are no dates
      expect(screen.queryByText('Visits by Year')).not.toBeInTheDocument();
    });
  });

  describe('Most Visited', () => {
    it('renders most visited section when locations have visitCount > 1', () => {
      const explorationData = createMockExplorationData({
        world: {
          France: { visited: true, visitCount: 5 },
          Germany: { visited: true, visitCount: 3 },
        },
      });

      render(<Statistics explorationData={explorationData} />);

      expect(screen.getByText('Most Visited Locations')).toBeInTheDocument();
    });

    it('shows visit count for locations with more than 1 visit', () => {
      const explorationData = createMockExplorationData({
        world: {
          France: { visited: true, visitCount: 5 },
        },
      });

      render(<Statistics explorationData={explorationData} />);

      expect(screen.getByText('5 visits')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
    });

    it('does not show most visited section when no locations have visitCount > 1', () => {
      const explorationData = createMockExplorationData({
        world: {
          France: { visited: true, visitCount: 1 },
        },
      });

      render(<Statistics explorationData={explorationData} />);

      // The component only shows locations with visitCount > 1
      expect(screen.queryByText('Most Visited Locations')).not.toBeInTheDocument();
    });

    it('groups by exploration', () => {
      const explorationData = createMockExplorationData({
        world: {
          France: { visited: true, visitCount: 5 },
        },
        'us-states': {
          Texas: { visited: true, visitCount: 3 },
        },
      });

      render(<Statistics explorationData={explorationData} />);

      // Should show exploration headers as h4
      const headings = screen.getAllByRole('heading', { level: 4 });
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Continent Statistics', () => {
    it('shows world continents section', () => {
      const explorationData = createMockExplorationData({
        world: {
          France: { visited: true },
        },
      });

      render(<Statistics explorationData={explorationData} />);

      expect(screen.getByText('World: Continents')).toBeInTheDocument();
      expect(screen.getByText('Europe')).toBeInTheDocument();
      expect(screen.getByText('Asia')).toBeInTheDocument();
    });
  });

  describe('Header', () => {
    it('renders statistics header', () => {
      const explorationData = createMockExplorationData({});

      render(<Statistics explorationData={explorationData} />);

      expect(screen.getByText('Statistics')).toBeInTheDocument();
      expect(screen.getByText('Detailed breakdown of your explorations')).toBeInTheDocument();
    });
  });
});
