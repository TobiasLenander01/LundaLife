// Kept separate from theme.ts so the server-rendered layout can import it without client hooks

export const THEME_STORAGE_KEY = 'theme';
export const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Runs before the page is shown (inlined in the layout) to apply the saved theme, or the system theme,
 * so the page never flashes in the wrong colors.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var d=t?t==='dark':matchMedia('${DARK_QUERY}').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;
