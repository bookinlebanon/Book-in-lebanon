import React from 'react';
import { Language, Category, Region } from '../types';
import { translations } from '../data/translations';
import { Search, MapPin, SlidersHorizontal, Sparkles, X, ChevronDown } from 'lucide-react';
import { VoiceSearchButton } from './VoiceSearchButton';

interface HeroSearchProps {
  lang: Language;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedRegion: Region;
  setSelectedRegion: (r: Region) => void;
  selectedCategory: Category;
  setSelectedCategory: (c: Category) => void;
  onOpenAdvancedFilters: () => void;
  hasActiveFilters: boolean;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  lang,
  searchQuery,
  setSearchQuery,
  selectedRegion,
  setSelectedRegion,
  selectedCategory,
  setSelectedCategory,
  onOpenAdvancedFilters,
  hasActiveFilters,
}) => {
  const t = translations[lang];

  const categories: { key: Category; label: string; icon: string }[] = [
    { key: 'all', label: t.categories.all, icon: '✨' },
    { key: 'chalet', label: t.categories.chalet, icon: '🏡' },
    { key: 'guesthouse', label: t.categories.guesthouse, icon: '🌿' },
    { key: 'studio', label: t.categories.studio, icon: '🛋️' },
    { key: 'hotel', label: t.categories.hotel, icon: '🏨' },
    { key: 'restaurant', label: t.categories.restaurant, icon: '🍽️' },
    { key: 'real_estate', label: t.categories.real_estate, icon: '🔑' },
  ];

  const regionChips: { key: Region; label: string; icon: string }[] = [
    { key: 'all', label: t.regions.all, icon: '🇱🇧' },
    { key: 'beirut', label: lang === 'ar' ? 'بيروت' : lang === 'fr' ? 'Beyrouth' : 'Beirut', icon: '🏙️' },
    { key: 'keserwan', label: lang === 'ar' ? 'فاريا وفقرا' : lang === 'fr' ? 'Faraya & Faqra' : 'Faraya & Faqra', icon: '⛷️' },
    { key: 'jbeil', label: lang === 'ar' ? 'جبيل' : lang === 'fr' ? 'Byblos' : 'Byblos', icon: '🏰' },
    { key: 'batroun', label: lang === 'ar' ? 'البترون' : 'Batroun', icon: '🏖️' },
    { key: 'ehden_cedars', label: lang === 'ar' ? 'إهدن والأرز' : lang === 'fr' ? 'Ehden & Cèdres' : 'Ehden & Cedars', icon: '🌲' },
    { key: 'tripoli_akkar', label: lang === 'ar' ? 'طرابلس وعكار' : 'Tripoli & Akkar', icon: '⚓' },
    { key: 'matn', label: lang === 'ar' ? 'برمانا والمتن' : lang === 'fr' ? 'Broummana & Metn' : 'Broummana & Matn', icon: '🏡' },
    { key: 'chouf_aley', label: lang === 'ar' ? 'الشوف وعاليه' : 'Chouf & Aley', icon: '🌿' },
    { key: 'tyre_south', label: lang === 'ar' ? 'صور والجنوب' : lang === 'fr' ? 'Tyr & Sud' : 'Tyre & South', icon: '🌊' },
    { key: 'sidon_jezzine', label: lang === 'ar' ? 'جزين وصيدا' : lang === 'fr' ? 'Jezzine & Saïda' : 'Jezzine & Sidon', icon: '💧' },
    { key: 'zahle_bekaa', label: lang === 'ar' ? 'زحلة والبقاع' : lang === 'fr' ? 'Zahlé & Békaa' : 'Zahle & Bekaa', icon: '🍇' },
    { key: 'baalbek_hermel', label: lang === 'ar' ? 'بعلبك والهرمل' : 'Baalbek & Hermel', icon: '🏛️' },
    { key: 'west_bekaa_rashaya', label: lang === 'ar' ? 'راشيا والقرعون' : lang === 'fr' ? 'Rashaya & Békaa' : 'Rashaya & Qaraoun', icon: '⛵' },
  ];

  return (
    <div className="relative bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 text-white overflow-hidden py-4 sm:py-8 md:py-10">
      {/* Background radial glow */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.3) 0%, transparent 70%)`,
        }}
      />

      <div className="relative max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
        {/* Editorial Subtitle Marker */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] sm:text-xs text-amber-200 font-medium mb-2 backdrop-blur-sm">
          <span>🇱🇧</span>
          <span>
            {lang === 'ar' 
              ? 'بوابتك الأولى للإقامة والسياحة في لبنان' 
              : lang === 'fr' 
              ? 'Votre passerelle d’exception au Liban' 
              : 'Lebanon’s Premiere Booking Gateway'}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-1.5 max-w-3xl mx-auto leading-snug">
          {t.hero.headline}
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-2xl mx-auto mb-3 sm:mb-5 font-normal leading-relaxed hidden sm:block">
          {t.hero.subhead}
        </p>

        {/* Unified Search Surface */}
        <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-xl text-stone-900 max-w-4xl mx-auto ring-1 ring-black/5 text-left rtl:text-right">
          
          {/* Search Inputs Responsive Container */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            
            {/* Keyword Search (Full width on mobile, flexible on desktop) */}
            <div className="flex-1 relative flex items-center bg-stone-50 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 border border-stone-200/80 focus-within:border-emerald-700 focus-within:ring-1 focus-within:ring-emerald-700 transition-all min-h-[44px] sm:min-h-[42px] gap-1.5">
              <Search className="w-4 h-4 text-stone-400 shrink-0 mx-0.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.hero.searchPlaceholder}
                className="w-full bg-transparent text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-5 h-5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-xs shrink-0 cursor-pointer"
                  title="Clear"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Web Speech API Voice Search Button */}
              <VoiceSearchButton
                lang={lang}
                onVoiceResult={(result) => {
                  if (result.matchedRegion) {
                    setSelectedRegion(result.matchedRegion);
                  }
                  if (result.matchedCategory) {
                    setSelectedCategory(result.matchedCategory);
                  }
                  if (result.cleanedQuery) {
                    setSearchQuery(result.cleanedQuery);
                  }
                }}
              />
            </div>

            {/* Controls Row on Mobile (Region Selector + Filter Button), Inline on Desktop */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Region Selector (Desktop & Mobile) */}
              <div className="flex-1 sm:w-52 md:w-56 relative items-center bg-stone-50 rounded-xl px-3 py-2 sm:py-2.5 border border-stone-200/80 focus-within:border-emerald-700 focus-within:ring-1 focus-within:ring-emerald-700 transition-all min-h-[42px] flex">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mx-1" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value as Region)}
                  aria-label={t.hero.allRegions}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none appearance-none cursor-pointer pr-4 rtl:pr-0 rtl:pl-4 truncate"
                >
                  {regionChips.map((reg) => (
                    <option key={reg.key} value={reg.key}>
                      {reg.icon} {reg.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 rtl:right-auto rtl:left-2.5 pointer-events-none" />
              </div>

              {/* Filters Trigger Action */}
              <button
                type="button"
                onClick={onOpenAdvancedFilters}
                className={`flex items-center justify-center gap-1.5 py-2 px-3.5 sm:px-4 text-xs font-bold rounded-xl transition-all shadow-xs min-h-[42px] shrink-0 cursor-pointer ${
                  hasActiveFilters
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                }`}
                title={t.filter.title}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="inline text-xs">{t.filter.title}</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                )}
              </button>
            </div>

          </div>

          {/* Category Chips Bar (1-swipe thumb reachable) */}
          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 px-0.5">
            {categories.map((c) => {
              const isActive = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all min-h-[32px] ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs font-bold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
