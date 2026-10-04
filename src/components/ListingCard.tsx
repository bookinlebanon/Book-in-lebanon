import React, { useState, useRef } from 'react';
import { Listing, Language, Currency } from '../types';
import { translations, LBP_RATE } from '../data/translations';
import { 
  Star, 
  Heart, 
  MapPin, 
  CheckCircle2, 
  MessageCircle, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Camera,
  Play,
  Crown,
  Sparkles
} from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  lang: Language;
  currency: Currency;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onDirectBook: (listing: Listing) => void;
  onShareListing: (listing: Listing) => void;
  onPromoteListing?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  lang,
  currency,
  isFavorite,
  onToggleFavorite,
  onSelectListing,
  onDirectBook,
  onShareListing,
  onPromoteListing,
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const t = translations[lang];

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : ['/images/lebanon_mountain_chalet_1790760821579.jpg'];

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left
        lang === 'ar' ? prevImage() : nextImage();
      } else {
        // Swiped right
        lang === 'ar' ? nextImage() : prevImage();
      }
    }
    touchStartX.current = null;
  };

  // Price conversion
  const formattedPrice = () => {
    if (currency === 'USD') {
      return `$${listing.priceUSD.toLocaleString()}`;
    } else {
      const inLbp = listing.priceUSD * LBP_RATE;
      if (lang === 'ar') return `${inLbp.toLocaleString()} ل.ل`;
      if (lang === 'fr') return `${inLbp.toLocaleString()} LL`;
      return `${inLbp.toLocaleString()} LBP`;
    }
  };

  const getPriceUnitLabel = () => {
    switch (listing.priceUnit) {
      case 'per_person':
        return t.card.person;
      case 'per_month':
        return t.card.month;
      case 'min_spend':
        return t.card.minSpend;
      case 'per_night':
      default:
        return t.card.night;
    }
  };

  const localizedTitle = listing.title[lang] || listing.title.en || listing.title.ar;
  const localizedCity = listing.city[lang] || listing.city.en || listing.city.ar;
  const categoryLabel = t.categories[listing.category];

  // WhatsApp click handler
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = listing.host.whatsapp.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      lang === 'ar'
        ? `مرحباً، أستفسر عن الإعلان المعروض على منصة Book in Lebanon: "${localizedTitle}"`
        : lang === 'fr'
        ? `Bonjour, je me renseigne sur l’annonce sur Book in Lebanon : "${localizedTitle}"`
        : `Hello, inquiring about your listing on Book in Lebanon: "${localizedTitle}"`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={() => onSelectListing(listing)}
      className={`group relative bg-white rounded-2xl transition-all duration-200 flex flex-col overflow-hidden cursor-pointer active:scale-[0.99] ${
        listing.featured
          ? 'border-2 border-amber-300/90 shadow-md hover:border-amber-400 hover:shadow-xl ring-1 ring-amber-400/20'
          : 'border border-stone-200/90 hover:border-stone-300 hover:shadow-md'
      }`}
    >
      {/* Media Carousel slot with 16:10 ratio and swipe support */}
      <div 
        className="relative aspect-[16/10] bg-stone-100 overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!imgError && images.length > 0 ? (
          <img
            src={images[currentImgIndex] || images[0]}
            alt={`${localizedTitle} - photo ${currentImgIndex + 1}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-4 text-center">
            <span className="text-3xl mb-1">🇱🇧</span>
            <span className="text-xs font-medium text-stone-500">{localizedCity}</span>
          </div>
        )}

        {/* Carousel Prev / Next Chevron Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous photo"
              className="absolute left-2 rtl:left-auto rtl:right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10 active:scale-90"
            >
              {lang === 'ar' ? (
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>

            <button
              onClick={nextImage}
              aria-label="Next photo"
              className="absolute right-2 rtl:right-auto rtl:left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10 active:scale-90"
            >
              {lang === 'ar' ? (
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </>
        )}

        {/* Carousel Pagination Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`transition-all duration-200 rounded-full shadow-xs ${
                  idx === currentImgIndex
                    ? 'w-4 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Photo Counter Badge (e.g. 1/4) */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 rtl:right-auto rtl:left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono font-bold flex items-center gap-1 z-10">
            <Camera className="w-3 h-3 text-stone-200" />
            <span>{currentImgIndex + 1}/{images.length}</span>
          </div>
        )}

        {/* Favorite Heart Button with >= 44x44 hitbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(listing.id);
          }}
          className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-stone-700 shadow-sm backdrop-blur-sm transition-colors flex items-center justify-center active:scale-90 z-10"
          aria-label="Toggle favorite"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-700'
            }`}
          />
        </button>

        {/* Promoted / Featured VIP Badge */}
        {listing.featured && (
          <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 z-10 flex items-center gap-1">
            <span className="px-2.5 py-1 text-[10px] font-black tracking-wide bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-lg shadow-sm border border-amber-300/60 flex items-center gap-1">
              <Crown className="w-3 h-3 fill-amber-200 text-amber-200" />
              <span>
                {listing.promotionTier === 'spotlight' 
                  ? t.promote.badgeSpotlight 
                  : listing.promotionTier === 'weekend' 
                  ? t.promote.badgeWeekend 
                  : t.promote.badgeVip}
              </span>
            </span>
          </div>
        )}

        {/* User listing subtle marker if created by user */}
        {listing.isUserListing && (
          <span className={`absolute ${listing.featured ? 'top-10' : 'top-2.5'} left-2.5 rtl:left-auto rtl:right-2.5 px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-stone-900/90 text-white rounded-md shadow-xs z-10`}>
            {t.card.userListing}
          </span>
        )}

        {/* Video Tour Badge */}
        {listing.videos && listing.videos.length > 0 && (
          <span className={`absolute ${listing.featured && listing.isUserListing ? 'top-16' : (listing.featured || listing.isUserListing) ? 'top-9.5' : 'top-2.5'} left-2.5 rtl:left-auto rtl:right-2.5 px-2 py-0.5 text-[10px] font-bold tracking-wide bg-purple-900/90 text-purple-200 border border-purple-500/40 rounded-md shadow-xs flex items-center gap-1 z-10 backdrop-blur-sm`}>
            <Play className="w-2.5 h-2.5 fill-purple-300 text-purple-300" />
            <span>{t.postAd.videoBadge}</span>
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          {/* Unboxed Metadata: Category · City · Rating */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5 font-medium min-w-0 gap-2">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="text-emerald-900 font-semibold shrink-0">{categoryLabel}</span>
              <span aria-hidden="true" className="text-stone-300 shrink-0">·</span>
              <span className="truncate">{localizedCity}</span>
            </div>

            <div className="flex items-center gap-1 text-stone-800 shrink-0 font-semibold tabular-nums">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{listing.rating.toFixed(2)}</span>
              <span className="text-stone-400 text-[11px] font-normal">({listing.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-stone-900 line-clamp-1 group-hover:text-emerald-800 transition-colors mb-1.5">
            {localizedTitle}
          </h3>

          {/* Quiet Amenities text line */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-stone-500 mb-3 truncate">
            {listing.amenities.includes('generator_247') && (
              <span className="text-emerald-800 font-medium shrink-0">⚡ {t.amenities.generator_247}</span>
            )}
            {listing.amenities.includes('pool') && (
              <span className="shrink-0">· 🏊 {t.amenities.pool}</span>
            )}
            {listing.amenities.includes('sea_view') && (
              <span className="shrink-0">· 🌊 {t.amenities.sea_view}</span>
            )}
            {listing.amenities.includes('mountain_view') && (
              <span className="shrink-0">· ⛰️ {t.amenities.mountain_view}</span>
            )}
            {listing.amenities.includes('jacuzzi') && (
              <span className="shrink-0">· ♨️ {t.amenities.jacuzzi}</span>
            )}
          </div>
        </div>

        {/* Bottom Price & Direct Actions */}
        <div className="pt-2.5 sm:pt-3 border-t border-stone-100 flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
          {/* Price Box */}
          <div className="flex flex-col min-w-0 shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base md:text-lg font-extrabold text-stone-900 tabular-nums">
                {formattedPrice()}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 font-normal">
                / {getPriceUnitLabel()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Quick Promote / Boost Button if onPromoteListing is provided */}
            {onPromoteListing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPromoteListing(listing);
                }}
                className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl text-amber-700 hover:text-amber-800 hover:bg-amber-100 bg-amber-50/90 border border-amber-200/80 flex items-center justify-center transition-colors active:scale-95"
                title={t.promote.button}
                aria-label={t.promote.button}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {/* Share Social & Copy Link Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShareListing(listing);
              }}
              className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 bg-stone-100/80 flex items-center justify-center transition-colors active:scale-95"
              title={t.card.share}
              aria-label={t.card.share}
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* WhatsApp Quick Direct Inquiry */}
            <button
              onClick={handleWhatsApp}
              className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 bg-emerald-50/80 flex items-center justify-center transition-colors active:scale-95"
              title={lang === 'ar' ? 'استفسار عبر واتساب' : lang === 'fr' ? 'Contact WhatsApp direct' : 'WhatsApp Direct Inquiry'}
              aria-label={lang === 'ar' ? 'استفسار عبر واتساب' : lang === 'fr' ? 'Contact WhatsApp' : 'WhatsApp Inquiry'}
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Direct Instant Booking Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDirectBook(listing);
              }}
              className="h-8.5 sm:h-10 px-2.5 sm:px-4 text-[11px] sm:text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all whitespace-nowrap shadow-xs flex items-center justify-center"
            >
              {t.card.bookNow}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
