// Light / dark / follow-the-phone theme, applied as a `dark` class on <html>.

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'book_in_lebanon_theme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

export function getThemeMode(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(mode: ThemeMode) {
  const dark = mode === 'dark' || (mode === 'system' && media().matches);
  document.documentElement.classList.toggle('dark', dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0c0a09' : '#065f46');
}

export function setThemeMode(mode: ThemeMode) {
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    // Storage blocked: the choice lasts for this visit only.
  }
  applyTheme(mode);
}

/** Re-applies "system" mode when the phone switches between light and dark. */
export function watchSystemTheme() {
  media().addEventListener('change', () => {
    if (getThemeMode() === 'system') applyTheme('system');
  });
}
