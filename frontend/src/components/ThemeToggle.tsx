'use client';

import { MoonIcon, SunIcon } from '@/components/icons';
import { setTheme, useTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const theme = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-fg-soft transition-colors hover:bg-muted"
    >
      {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
    </button>
  );
}
