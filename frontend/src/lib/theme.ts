import { useSyncExternalStore } from 'react';
import { DARK_QUERY, THEME_STORAGE_KEY as STORAGE_KEY } from '@/lib/themeScript';

export type Theme = 'light' | 'dark';

const listeners = new Set<() => void>();

function getSavedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  listeners.forEach((listener) => listener());
}

// Saves and applies a theme chosen by the user
export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // The theme still applies for this visit
  }
  applyTheme(theme);
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Follow system changes until the user picks a theme
  const mediaQuery = window.matchMedia(DARK_QUERY);
  const onSystemChange = () => {
    if (!getSavedTheme()) applyTheme(mediaQuery.matches ? 'dark' : 'light');
  };
  mediaQuery.addEventListener('change', onSystemChange);

  return () => {
    listeners.delete(listener);
    mediaQuery.removeEventListener('change', onSystemChange);
  };
}

// Returns the current theme. Always "light" during server rendering.
export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
    () => 'light',
  );
}
