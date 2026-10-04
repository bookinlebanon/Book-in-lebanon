import React, { useState } from 'react';
import { Sun, Moon, Smartphone } from 'lucide-react';
import { Language } from '../types';
import { ThemeMode, getThemeMode, setThemeMode } from '../utils/theme';

/** Segmented Light / Dark / Auto control for the profile menus. */
export const ThemeSwitcher: React.FC<{ lang: Language }> = ({ lang }) => {
  const [mode, setMode] = useState<ThemeMode>(getThemeMode);
  const tr = (ar: string, fr: string, en: string) => (lang === 'ar' ? ar : lang === 'fr' ? fr : en);

  const options: { key: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { key: 'light', label: tr('فاتح', 'Clair', 'Light'), icon: <Sun className="w-4 h-4" /> },
    { key: 'dark', label: tr('ليلي', 'Sombre', 'Dark'), icon: <Moon className="w-4 h-4" /> },
    { key: 'system', label: tr('تلقائي', 'Auto', 'Auto'), icon: <Smartphone className="w-4 h-4" /> },
  ];

  const choose = (m: ThemeMode) => {
    setMode(m);
    setThemeMode(m);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
        {tr('المظهر', 'Apparence', 'Appearance')}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => {
          const isSelected = mode === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => choose(o.key)}
              aria-pressed={isSelected}
              className={`p-2.5 rounded-xl border text-center transition-all min-h-[46px] flex flex-col items-center justify-center gap-1 ${
                isSelected
                  ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-extrabold ring-1 ring-emerald-800'
                  : 'border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {o.icon}
              <span className="text-xs font-bold">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
