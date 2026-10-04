import React from 'react';
import { FilterState, Language, Amenity, Category, Region } from '../types';
import { translations } from '../data/translations';
import { X, RotateCcw, Check } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  lang: Language;
  resultsCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  onReset,
  lang,
  resultsCount,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  const amenityKeys: { key: Amenity; label: string }[] = [
    { key: 'generator_247', label: t.amenities.generator_247 },
    { key: 'pool', label: t.amenities.pool },
    { key: 'sea_view', label: t.amenities.sea_view },
    { key: 'mountain_view', label: t.amenities.mountain_view },
    { key: 'jacuzzi', label: t.amenities.jacuzzi },
    { key: 'wifi', label: t.amenities.wifi },
    { key: 'parking', label: t.amenities.parking },
    { key: 'kitchen', label: t.amenities.kitchen },
    { key: 'breakfast', label: t.amenities.breakfast },
    { key: 'terrace', label: t.amenities.terrace },
    { key: 'pet_friendly', label: t.amenities.pet_friendly },
  ];

  const toggleAmenity = (amenity: Amenity) => {
    setFilters(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-stone-900">{t.filter.title}</h2>
            <p className="text-xs text-stone-500 font-medium">
              {resultsCount} {t.filter.resultsCount}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 space-y-6 flex-1">
          {/* Region Filter */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              {lang === 'ar' ? 'المنطقة في لبنان' : lang === 'fr' ? 'Région au Liban' : 'Region in Lebanon'}
            </label>
            <select
              value={filters.region}
              onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value as Region }))}
              className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 bg-white"
            >
              <option value="all">{t.regions.all}</option>
              <option value="beirut">{t.regions.beirut}</option>
              <option value="keserwan">{t.regions.keserwan}</option>
              <option value="jbeil">{t.regions.jbeil}</option>
              <option value="batroun">{t.regions.batroun}</option>
              <option value="ehden_cedars">{t.regions.ehden_cedars}</option>
              <option value="tripoli_akkar">{t.regions.tripoli_akkar}</option>
              <option value="matn">{t.regions.matn}</option>
              <option value="chouf_aley">{t.regions.chouf_aley}</option>
              <option value="tyre_south">{t.regions.tyre_south}</option>
              <option value="sidon_jezzine">{t.regions.sidon_jezzine}</option>
              <option value="zahle_bekaa">{t.regions.zahle_bekaa}</option>
              <option value="baalbek_hermel">{t.regions.baalbek_hermel}</option>
              <option value="west_bekaa_rashaya">{t.regions.west_bekaa_rashaya}</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2.5">
              {t.filter.sortBy}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'featured', label: t.filter.sortFeatured },
                { id: 'price_asc', label: t.filter.sortPriceAsc },
                { id: 'price_desc', label: t.filter.sortPriceDesc },
                { id: 'rating', label: t.filter.sortRating },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilters(prev => ({ ...prev, sortBy: opt.id as any }))}
                  className={`px-3 py-2 text-xs font-medium rounded-lg text-left rtl:text-right border transition-all ${
                    filters.sortBy === opt.id
                      ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                {t.filter.priceRange}
              </label>
              <span className="text-xs font-bold text-emerald-900 tabular-nums">
                ${filters.minPrice} - ${filters.maxPrice} {lang === 'ar' ? 'دولار' : 'USD'}
              </span>
            </div>
            <div className="space-y-3">
              <input
                type="range"
                min="20"
                max="600"
                step="10"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-full accent-emerald-800 cursor-pointer"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-[11px] text-stone-400 block mb-1">
                    {lang === 'ar' ? 'الحد الأدنى ($)' : lang === 'fr' ? 'Min ($)' : 'Min ($)'}
                  </span>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Math.max(0, Number(e.target.value)) }))}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs font-medium tabular-nums"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] text-stone-400 block mb-1">
                    {lang === 'ar' ? 'الحد الأقصى ($)' : lang === 'fr' ? 'Max ($)' : 'Max ($)'}
                  </span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                    className="w-full p-2 border border-stone-200 rounded-lg text-xs font-medium tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2.5">
              {t.filter.minRating}
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { val: 0, label: t.filter.allRatings },
                { val: 4.0, label: '4.0+ ★' },
                { val: 4.5, label: '4.5+ ★' },
                { val: 4.8, label: '4.8+ ★' },
              ].map(item => (
                <button
                  key={item.val}
                  onClick={() => setFilters(prev => ({ ...prev, minRating: item.val }))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    filters.minRating === item.val
                      ? 'border-emerald-800 bg-emerald-800 text-white font-semibold'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities Checklist */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2.5">
              {t.filter.amenities}
            </label>
            <div className="space-y-2">
              {amenityKeys.map(({ key, label }) => {
                const isChecked = filters.amenities.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAmenity(key)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      isChecked
                        ? 'border-emerald-700 bg-emerald-50/60 text-emerald-950 font-semibold'
                        : 'border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <span>{label}</span>
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isChecked ? 'bg-emerald-800 border-emerald-800 text-white' : 'border-stone-300'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-stone-200 sticky bottom-0 bg-white flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.filter.clearFilters}</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors text-center"
          >
            {t.detail.close} ({resultsCount})
          </button>
        </div>
      </div>
    </div>
  );
};
