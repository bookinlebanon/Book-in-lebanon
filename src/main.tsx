import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './dark.css';
import { Capacitor } from '@capacitor/core';
import { applyTheme, getThemeMode, watchSystemTheme } from './utils/theme';

applyTheme(getThemeMode());
watchSystemTheme();

createRoot(document.getElementById('root')!).render(<App />);

// The Android app bundles its files, so only the website needs the offline worker.
if (import.meta.env.PROD && !Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((e) => console.error('Service worker failed', e));
  });
}
