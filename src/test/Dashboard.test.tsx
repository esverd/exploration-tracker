import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../components/Dashboard';
import type { LocationVisitData, ExplorationData } from '../types';
import type { useExplorationData } from '../hooks/useExplorationData';

// Mock exploration data with proper typing
const mockData: ExplorationData = {
  explorations: {
    world: {
      France: { visited: true, visitCount: 3, visitDates: ['2024-06-15'] },
      Germany: { visited: true },
      Japan: { visited: true },
    },
    'us-states': {
      Texas: { visited: true },
      California: { visited: true },
    },
    'texas-state-parks': {
      'big-bend-ranch': { visited: true },
    },
  },
};

const mockExplorationData: ReturnType<typeof useExplorationData> = {
  data: mockData,
  loading: false,
  error: null,
  isVisited: (expId: string, locId: string) => {
    return !!mockData.explorations[expId]?.[locId]?.visited;
  },
  getVisitedCount: (expId: string) => {
    const exp = mockData.explorations[expId];
    return exp ? Object.keys(exp).length : 0;
  },
  getLocationData: (expId: string, locId: string): LocationVisitData | null => {
    return mockData.explorations[expId]?.[locId] || null;
  },
  toggleLocation: vi.fn(),
  updateLocation: vi.fn(),
  refetch: vi.fn(),
};

describe('Dashboard Component', () => {
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard header', () => {
    render(
      <Dashboard explorationData={mockExplorationData} onNavigate={mockOnNavigate} />
    );

    // The component shows "Overview" as the header
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Your exploration progress at a glance')).toBeInTheDocument();
  });

  it('displays total explored count', () => {
    render(
      <Dashboard explorationData={mockExplorationData} onNavigate={mockOnNavigate} />
    );

    // Total is 3 (world) + 2 (us-states) + 1 (texas-parks) = 6
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('Total Explored')).toBeInTheDocument();
  });

  it('shows exploration cards with correct counts', () => {
    render(
      <Dashboard explorationData={mockExplorationData} onNavigate={mockOnNavigate} />
    );

    // Check that exploration cards exist by looking for dash-card-link elements
    const cards = document.querySelectorAll('.dash-card-link');
    expect(cards.length).toBe(3); // World, US States, TX State Parks

    // Check that the card labels contain the exploration names
    const labels = document.querySelectorAll('.dash-card-label');
    const labelTexts = Array.from(labels).map((l) => l.textContent);
    expect(labelTexts).toContain('World');
    expect(labelTexts).toContain('US States');
    expect(labelTexts).toContain('TX State Parks');
  });

  it('calls onNavigate when clicking an exploration card', async () => {
    const user = userEvent.setup();
    render(
      <Dashboard explorationData={mockExplorationData} onNavigate={mockOnNavigate} />
    );

    // Find and click the first exploration card (World)
    const cards = document.querySelectorAll('.dash-card-link');
    expect(cards.length).toBeGreaterThan(0);
    await user.click(cards[0]);
    expect(mockOnNavigate).toHaveBeenCalledWith(0); // World is index 0
  });

  it('shows continent breakdown for world exploration', () => {
    render(
      <Dashboard explorationData={mockExplorationData} onNavigate={mockOnNavigate} />
    );

    // The component shows "World: Continent Breakdown" as the header
    expect(screen.getByText('World: Continent Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Europe')).toBeInTheDocument();
    expect(screen.getByText('Asia')).toBeInTheDocument();
  });

  it('displays recent visits when there are visit dates', () => {
    render(
      <Dashboard explorationData={mockExplorationData} onNavigate={mockOnNavigate} />
    );

    expect(screen.getByText('Recent Visits')).toBeInTheDocument();
    // France has a visit date, so it should appear in recent visits
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('shows getting started message when no recent visits', () => {
    const emptyExplorationData = {
      ...mockExplorationData,
      data: { explorations: {} },
      isVisited: () => false,
      getVisitedCount: () => 0,
      getLocationData: () => null,
    };

    render(
      <Dashboard explorationData={emptyExplorationData} onNavigate={mockOnNavigate} />
    );

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });
});
