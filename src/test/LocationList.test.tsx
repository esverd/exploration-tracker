import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocationList } from '../components/LocationList';
import { EXPLORATIONS } from '../config/explorations';

// Mock exploration data
const createMockExplorationData = (visitedLocations: Record<string, Record<string, unknown>> = {}) => ({
  data: { explorations: { world: visitedLocations } },
  loading: false,
  error: null,
  isVisited: (_expId: string, locId: string) => !!(visitedLocations[locId] as { visited?: boolean } | undefined)?.visited,
  getVisitedCount: () => Object.keys(visitedLocations).length,
  getLocationData: (_expId: string, locId: string) => visitedLocations[locId] || null,
  toggleLocation: vi.fn(),
  updateLocation: vi.fn(),
  refetch: vi.fn(),
});

describe('LocationList Component', () => {
  const worldConfig = EXPLORATIONS.find((e) => e.id === 'world')!;
  const mockOnToggle = vi.fn();
  const mockOnOpenDetail = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Functionality', () => {
    it('filters locations by search term', () => {
      const visitedSet = new Set(['France']);
      const explorationData = createMockExplorationData({ France: { visited: true } });

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'Germany' } });

      // Germany should be visible, France should not
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.queryByText('France')).not.toBeInTheDocument();
    });

    it('shows empty state when no results found', () => {
      const visitedSet = new Set<string>();
      const explorationData = createMockExplorationData();

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });

      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });

    it('is case-insensitive', () => {
      const visitedSet = new Set<string>();
      const explorationData = createMockExplorationData();

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'FRANCE' } });

      expect(screen.getByText('France')).toBeInTheDocument();
    });
  });

  describe('Sort Functionality', () => {
    it('sorts by name A-Z by default', () => {
      const visitedSet = new Set<string>();
      const explorationData = createMockExplorationData();

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      // Check that sort dropdown exists and has correct default
      const sortSelect = screen.getByLabelText(/sort/i);
      expect(sortSelect).toHaveValue('name-asc');
    });

    it('changes sort order when selecting different option', () => {
      const visitedSet = new Set<string>();
      const explorationData = createMockExplorationData();

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      const sortSelect = screen.getByLabelText(/sort/i);
      fireEvent.change(sortSelect, { target: { value: 'name-desc' } });

      expect(sortSelect).toHaveValue('name-desc');
    });

    it('sorts by visit count when selected', () => {
      const visitedSet = new Set(['France', 'Germany']);
      const explorationData = createMockExplorationData({
        France: { visited: true, visitCount: 5 },
        Germany: { visited: true, visitCount: 2 },
      });

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      const sortSelect = screen.getByLabelText(/sort/i);
      fireEvent.change(sortSelect, { target: { value: 'count-desc' } });

      // Get all location items in the visited section
      const locationItems = document.querySelectorAll('.location-item');
      const visitedItems = Array.from(locationItems).filter(
        (item) => item.querySelector('.location-checkbox.checked')
      );

      // France (5 visits) should be first, Germany (2 visits) second
      expect(visitedItems.length).toBe(2);
      expect(visitedItems[0].textContent).toContain('France');
      expect(visitedItems[1].textContent).toContain('Germany');
    });
  });

  describe('Continent Filter (World Only)', () => {
    it('shows continent filter for world exploration', () => {
      const visitedSet = new Set<string>();
      const explorationData = createMockExplorationData();

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      const continentSelect = screen.getByLabelText(/filter by continent/i);
      expect(continentSelect).toBeInTheDocument();
    });

    it('filters by continent when selected', () => {
      const visitedSet = new Set<string>();
      const explorationData = createMockExplorationData();

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      const continentSelect = screen.getByLabelText(/filter by continent/i);
      fireEvent.change(continentSelect, { target: { value: 'Europe' } });

      // France (Europe) should be visible
      expect(screen.getByText('France')).toBeInTheDocument();
      // Japan (Asia) should not be visible
      expect(screen.queryByText('Japan')).not.toBeInTheDocument();
    });

    it('does not show continent filter for non-world explorations', () => {
      const usStatesConfig = EXPLORATIONS.find((e) => e.id === 'us-states')!;
      const visitedSet = new Set<string>();
      const explorationData = createMockExplorationData();

      render(
        <LocationList
          config={usStatesConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      expect(screen.queryByLabelText(/filter by continent/i)).not.toBeInTheDocument();
    });
  });

  describe('Toggle Functionality', () => {
    it('calls onToggle when clicking a location', () => {
      const visitedSet = new Set<string>();
      const explorationData = createMockExplorationData();

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      const franceItem = screen.getByText('France').closest('.location-item');
      expect(franceItem).toBeTruthy();
      fireEvent.click(franceItem!);
      expect(mockOnToggle).toHaveBeenCalledWith('France');
    });

    it('shows cogwheel button only for visited locations', () => {
      const visitedSet = new Set(['France']);
      const explorationData = createMockExplorationData({ France: { visited: true } });

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      // France is visited, should have cogwheel
      const franceItem = screen.getByText('France').closest('.location-item');
      expect(franceItem?.querySelector('.location-settings-btn')).toBeTruthy();

      // Germany is not visited, should not have cogwheel
      const germanyItem = screen.getByText('Germany').closest('.location-item');
      expect(germanyItem?.querySelector('.location-settings-btn')).toBeFalsy();
    });

    it('calls onOpenDetail when clicking cogwheel', () => {
      const visitedSet = new Set(['France']);
      const explorationData = createMockExplorationData({ France: { visited: true } });

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      const cogwheel = screen.getByTitle('Edit visit details');
      fireEvent.click(cogwheel);

      expect(mockOnOpenDetail).toHaveBeenCalledWith('France');
      // Should not trigger toggle
      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });

  describe('Display', () => {
    it('separates visited and not visited sections', () => {
      const visitedSet = new Set(['France']);
      const explorationData = createMockExplorationData({ France: { visited: true } });

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      expect(screen.getByText(/visited \(1\)/i)).toBeInTheDocument();
      expect(screen.getByText(/not visited/i)).toBeInTheDocument();
    });

    it('shows visit metadata for visited locations', () => {
      const visitedSet = new Set(['France']);
      const explorationData = createMockExplorationData({
        France: { visited: true, visitCount: 3, visitDates: ['2024-06-15'] },
      });

      render(
        <LocationList
          config={worldConfig}
          visitedSet={visitedSet}
          explorationData={explorationData}
          onToggle={mockOnToggle}
          onOpenDetail={mockOnOpenDetail}
        />
      );

      // Should show visit count and date
      expect(screen.getByText(/3x/)).toBeInTheDocument();
      expect(screen.getByText(/2024-06-15/)).toBeInTheDocument();
    });
  });
});
