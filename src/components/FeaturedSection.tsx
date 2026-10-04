import React from 'react';
import { Listing, Language, Currency } from '../types';
import { translations, LBP_RATE } from '../data/translations';
import { Crown, Sparkles, Star, ChevronLeft, ChevronRight, Zap, Flame } from 'lucide-react';

interface FeaturedSectionProps {
  listings: Listing[];
  lang: Language;
  currency: Currency;
  onSelectListing: (listing: Listing) => void;
  onOpenPromoteModal: () => void;
  isFilterFeaturedOnly?: boolean;
  onToggleFilterFeaturedOnly?: () => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  listings,
  lang,
  currency,
  onSelectListing,
  onOpenPromoteModal,
  isFilterFeaturedOnly,
  onToggleFilterFeaturedOnly,
}) => {
  const t = translations[lang];

  // Filter listings that are featured
  const featuredListings = listings.filter((l) => l.featured);

  if (featuredListings.length === 0) return null;

  const scrollLeft = () => {
    const el = document.getElementById('featured-scroll-container');
    if (el) el.scrollBy({ left: lang === 'ar' ? 320 : -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const el = document.getElementById('featured-scroll-container');
    if (el) el.scrollBy({ left: lang === 'ar' ? -320 : 320, behavior: 'smooth' });
  };

  const formatPrice = (priceUSD: number) => {
    if (currency === 'LBP') {
      const priceLBP = priceUSD * LBP_RATE;
      return `${(priceLBP / 1000).toLocaleString()} ألف ل.ل`;
    }
    return `$${priceUSD}`;
  };

  return (
    <section className="w-full my-6 bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-stone-50 border border-amber-200/90 rounded-3xl p-4 sm:p-6 shadow-sm overflow-hidden relative">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Crown className="w-5 h-5 fill-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                {t.promote.featuredTitle}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-stone-950 uppercase shadow-2xs">
                VIP
              </span>
            </div>
            <p className="text-xs text-stone-600 line-clamp-1">
              {t.promote.featuredSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls: Promote CTA + Scroll Arrows */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Promote Your Listing CTA Button */}
          <button
            onClick={onOpenPromoteModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.promote.promoteYourListing}</span>
          </button>

          {/* Nav buttons on tablet/desktop */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={scrollLeft}
              className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center transition-colors shadow-2xs"
              aria-label="Previous featured listings"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              onClick={scrollRight}
              className="w-8 h-8 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center transition-colors shadow-2xs"
              aria-label="Next featured listings"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Horizontal Scroller */}
      <div 
        id="featured-scroll-container"
        className="flex items-center gap-3.5 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
      >
        {featuredListings.map((listing) => {
          const title = listing.title[lang] || listing.title.en || listing.title.ar;
          const city = listing.city[lang] || listing.city.en || listing.city.ar;
          const tier = listing.promotionTier || 'vip';

          return (
            <div
              key={listing.id}
              onClick={() => onSelectListing(listing)}
              className="w-64 sm:w-72 shrink-0 bg-white rounded-2xl border-2 border-amber-300/80 hover:border-amber-400 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col justify-between active:scale-[0.99]"
            >
              {/* Image & VIP Badge */}
              <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                <img
                  src={listing.images[0]}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* VIP / Spotlight / Weekend Badge */}
                <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 z-10 flex items-center gap-1">
                  {tier === 'vip' && (
                    <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black shadow-xs flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-white" />
                      <span>{t.promote.badgeVip}</span>
                    </span>
                  )}
                  {tier === 'spotlight' && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-black shadow-xs flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-white" />
                      <span>{t.promote.badgeSpotlight}</span>
                    </span>
                  )}
                  {tier === 'weekend' && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black shadow-xs flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-white" />
                      <span>{t.promote.badgeWeekend}</span>
                    </span>
                  )}
                </div>

                {/* Rating badge */}
                <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 z-10 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{listing.reviewsCount > 0 ? listing.rating.toFixed(2) : (lang === 'ar' ? 'جديد' : lang === 'fr' ? 'Nouveau' : 'New')}</span>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium mb-1">
                    <span className="text-amber-800 font-semibold">{t.categories[listing.category]}</span>
                    <span>·</span>
                    <span className="truncate">{city}</span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1 mb-2">
                    {title}
                  </h3>
                </div>

                {/* Price and Details */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm sm:text-base font-extrabold text-stone-900 tabular-nums">
                      {formatPrice(listing.priceUSD)}
                    </span>
                    <span className="text-[10px] text-stone-500 font-normal">
                      / {listing.category === 'restaurant' ? t.card.person : t.card.night}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-amber-700 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform flex items-center gap-0.5">
                    <span>{t.card.viewDetails}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
