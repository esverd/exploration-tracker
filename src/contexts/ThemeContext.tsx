import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

export interface ThemeColors {
  visited: string;
  visitedHover: string;
  notVisited: string;
  notVisitedHover: string;
}

const DEFAULT_COLORS: ThemeColors = {
  visited: '#22c55e',
  visitedHover: '#16a34a',
  notVisited: '#334155',
  notVisitedHover: '#475569',
};

const STORAGE_KEY = 'exploration-tracker-theme';

interface ThemeContextValue {
  colors: ThemeColors;
  setColors: (colors: ThemeColors) => void;
  resetColors: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function loadColors(): ThemeColors {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_COLORS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_COLORS;
}

function applyColors(colors: ThemeColors) {
  const root = document.documentElement;
  root.style.setProperty('--color-visited', colors.visited);
  root.style.setProperty('--color-visited-hover', colors.visitedHover);
  root.style.setProperty('--color-not-visited', colors.notVisited);
  root.style.setProperty('--color-not-visited-hover', colors.notVisitedHover);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColorsState] = useState<ThemeColors>(loadColors);

  useEffect(() => {
    applyColors(colors);
  }, [colors]);

  const setColors = useCallback((c: ThemeColors) => {
    setColorsState(c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  }, []);

  const resetColors = useCallback(() => {
    setColorsState(DEFAULT_COLORS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ThemeContext.Provider value={{ colors, setColors, resetColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export { DEFAULT_COLORS };
