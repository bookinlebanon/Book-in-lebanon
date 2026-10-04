import React, { useState, useEffect, useRef } from 'react';
import { Listing, Language, Currency, Review } from '../types';
import { translations, LBP_RATE } from '../data/translations';
import { 
  X, 
  Star, 
  MapPin, 
  Share2, 
  Heart, 
  ShieldCheck, 
  MessageCircle, 
  Phone, 
  Calendar, 
  Users, 
  Check, 
  Send,
  Zap,
  Waves,
  Mountain,
  Wifi,
  Sparkles,
  Car,
  UtensilsCrossed,
  Coffee,
  PawPrint,
  Flame,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Camera,
  Play,
  Video,
  Film,
  QrCode,
  MessageSquare,
  Crown
} from 'lucide-react';
import { isVideoSource } from '../utils/mediaUtils';
import { InteractivePropertyMap } from './InteractivePropertyMap';
import { WeatherWidget } from './WeatherWidget';

interface ListingDetailModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onDirectBook: (listing: Listing) => void;
  onAddReview: (listingId: string, review: Omit<Review, 'id' | 'date'>) => void;
  onShareListing: (listing: Listing) => void;
  onOpenQrCode?: (listing: Listing) => void;
  onStartChatWithHost?: (listing: Listing) => void;
  onPromoteListing?: (listing: Listing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  lang,
  currency,
  isFavorite,
  onToggleFavorite,
  onDirectBook,
  onAddReview,
  onShareListing,
  onOpenQrCode,
  onStartChatWithHost,
  onPromoteListing,
}) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const mediaItems: { type: 'image' | 'video'; url: string }[] = [];
  (listing?.images || []).forEach(url => {
    mediaItems.push({
      type: isVideoSource(url) ? 'video' : 'image',
      url,
    });
  });
  (listing?.videos || []).forEach(url => {
    mediaItems.push({
      type: 'video',
      url,
    });
  });
  if (mediaItems.length === 0) {
    mediaItems.push({
      type: 'image',
      url: '/images/lebanon_mountain_chalet_1790760821579.jpg',
    });
  }

  const currentMedia = mediaItems[selectedImgIndex] || mediaItems[0];
  const firstVideoIndex = mediaItems.findIndex(m => m.type === 'video');
  const hasVideos = firstVideoIndex !== -1;

  const prevImage = () => {
    setSelectedImgIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedImgIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
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
        lang === 'ar' ? prevImage() : nextImage();
      } else {
        lang === 'ar' ? nextImage() : prevImage();
      }
    }
    touchStartX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !listing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        lang === 'ar' ? prevImage() : nextImage();
      } else if (e.key === 'ArrowLeft') {
        lang === 'ar' ? nextImage() : prevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, listing, isLightboxOpen, selectedImgIndex, lang, mediaItems.length]);

  if (!isOpen || !listing) return null;

  const t = translations[lang];
  const localizedTitle = listing.title[lang] || listing.title.en || listing.title.ar;
  const localizedCity = listing.city[lang] || listing.city.en || listing.city.ar;
  const localizedDescription = listing.description[lang] || listing.description.en || listing.description.ar;

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

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const phone = listing.host.whatsapp.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      lang === 'ar'
        ? `مرحباً، أود الاستفسار عن مكانك "${localizedTitle}" المعروض على Book in Lebanon.`
        : `Hello! I would like to inquire about "${localizedTitle}" listed on Book in Lebanon.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    onAddReview(listing.id, {
      author: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
    });
    setReviewSubmitted(true);
    setReviewName('');
    setReviewComment('');
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const getAmenityIcon = (key: string) => {
    switch (key) {
      case 'generator_247':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'pool':
        return <Waves className="w-4 h-4 text-cyan-600" />;
      case 'mountain_view':
        return <Mountain className="w-4 h-4 text-emerald-700" />;
      case 'sea_view':
        return <Waves className="w-4 h-4 text-blue-600" />;
      case 'wifi':
        return <Wifi className="w-4 h-4 text-indigo-600" />;
      case 'jacuzzi':
        return <Sparkles className="w-4 h-4 text-rose-500" />;
      case 'parking':
        return <Car className="w-4 h-4 text-stone-600" />;
      case 'kitchen':
        return <UtensilsCrossed className="w-4 h-4 text-stone-600" />;
      case 'breakfast':
        return <Coffee className="w-4 h-4 text-amber-700" />;
      case 'terrace':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'pet_friendly':
        return <PawPrint className="w-4 h-4 text-emerald-600" />;
      default:
        return <Check className="w-4 h-4 text-emerald-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
      <div 
        className="relative bg-white rounded-t-3xl sm:rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2 sm:hidden shrink-0"></div>

        {/* Sticky Header Bar */}
        <div className="px-4 py-3 sm:p-4 border-b border-stone-200 flex items-center justify-between bg-white/95 backdrop-blur-sm sticky top-0 z-20 gap-3">
          <div className="flex items-center gap-2 truncate pr-4 rtl:pr-0 rtl:pl-4 min-w-0 flex-1">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider shrink-0">
              {t.categories[listing.category]}
            </span>
            <span aria-hidden="true" className="text-stone-300 shrink-0">·</span>
            <span className="text-xs text-stone-500 truncate">{localizedCity}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Promote Listing Trigger */}
            {onPromoteListing && (
              <button
                onClick={() => onPromoteListing(listing)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full sm:rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                title={t.promote.button}
                aria-label={t.promote.button}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden xs:inline">{t.promote.button}</span>
              </button>
            )}

            {/* Share Social Modal Trigger */}
            <button
              onClick={() => onShareListing(listing)}
              className="w-9 h-9 rounded-full sm:rounded-lg text-stone-600 hover:text-stone-900 bg-stone-100 sm:bg-transparent hover:bg-stone-100 transition-colors flex items-center justify-center text-xs"
              title={t.card.share}
              aria-label={t.card.share}
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Favorite */}
            <button
              onClick={() => onToggleFavorite(listing.id)}
              className="w-9 h-9 rounded-full sm:rounded-lg text-stone-600 hover:text-rose-600 bg-stone-100 sm:bg-transparent hover:bg-stone-100 transition-colors flex items-center justify-center"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-600'
                }`}
              />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full sm:rounded-lg text-stone-500 hover:text-stone-800 bg-stone-100 sm:bg-transparent hover:bg-stone-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main Visual Carousel Slot */}
          <div className="space-y-3">
            <div 
              className="group relative aspect-[16/9] w-full bg-stone-900 rounded-2xl overflow-hidden shadow-md select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {currentMedia.type === 'video' ? (
                <div className="w-full h-full bg-black flex items-center justify-center relative">
                  <video
                    key={currentMedia.url}
                    src={currentMedia.url}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <img
                  src={currentMedia.url}
                  alt={`${localizedTitle} - photo ${selectedImgIndex + 1}`}
                  referrerPolicy="no-referrer"
                  onClick={() => setIsLightboxOpen(true)}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.01] cursor-pointer"
                />
              )}

              {/* Prev / Next Carousel Navigation Arrows */}
              {mediaItems.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    aria-label="Previous media"
                    className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10 active:scale-95 shadow-md"
                  >
                    {lang === 'ar' ? (
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    aria-label="Next media"
                    className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10 active:scale-95 shadow-md"
                  >
                    {lang === 'ar' ? (
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </button>
                </>
              )}

              {/* Top Right Fullscreen Lightbox Trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5 transition-colors z-10 shadow-xs"
                title={lang === 'ar' ? 'تكبير الشاشة' : lang === 'fr' ? 'Plein écran' : 'Fullscreen'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'ar' ? 'تكبير الشاشة' : lang === 'fr' ? 'Plein écran' : 'Fullscreen'}</span>
              </button>

              {/* Bottom Left Rating Badge */}
              <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 px-3 py-1 bg-black/65 backdrop-blur-sm text-white text-xs font-semibold rounded-lg flex items-center gap-1 z-10">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{listing.rating.toFixed(2)}</span>
                <span className="opacity-80">({listing.reviewsCount} {lang === 'ar' ? 'تقييماً' : lang === 'fr' ? 'avis' : 'reviews'})</span>
              </div>

              {/* Bottom Right Photo/Video Counter Indicator */}
              {mediaItems.length > 1 && (
                <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1 bg-black/65 backdrop-blur-sm text-white text-xs font-mono font-semibold rounded-lg flex items-center gap-1.5 z-10">
                  {currentMedia.type === 'video' ? (
                    <Video className="w-3.5 h-3.5 text-purple-300" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-stone-300" />
                  )}
                  <span>{selectedImgIndex + 1} / {mediaItems.length}</span>
                </div>
              )}
            </div>

            {/* Quick Video Tour Jump Bar if property has video */}
            {hasVideos && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 border border-purple-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
                  <span className="text-xs font-bold text-purple-950">
                    {lang === 'ar' ? '🎥 يتوفر فيديو جولة استكشافية حية لهذا المكان' : lang === 'fr' ? '🎥 Visite vidéo disponible pour cet établissement' : '🎥 Live tour video available for this property'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedImgIndex(firstVideoIndex)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>{lang === 'ar' ? 'تشغيل الفيديو' : lang === 'fr' ? 'Lire la vidéo' : 'Play Video'}</span>
                </button>
              </div>
            )}

            {/* Thumbnails row */}
            {mediaItems.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {mediaItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`relative w-20 sm:w-24 h-14 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImgIndex === idx
                        ? 'border-emerald-700 ring-2 ring-emerald-700/50 scale-[1.02]'
                        : 'border-transparent opacity-65 hover:opacity-100 hover:scale-[1.01]'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-stone-900 flex flex-col items-center justify-center text-white relative">
                        <Play className="w-4 h-4 fill-purple-400 text-purple-400" />
                        <span className="text-[9px] font-bold text-purple-200 mt-0.5">
                          {lang === 'ar' ? 'فيديو' : lang === 'fr' ? 'Vidéo' : 'Video'}
                        </span>
                      </div>
                    ) : (
                      <img src={item.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                    {selectedImgIndex === idx && (
                      <span className="absolute inset-0 bg-emerald-950/15 pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Key Capacity */}
          <div>
            {listing.featured && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-black text-xs shadow-xs mb-2">
                <Crown className="w-3.5 h-3.5 fill-white" />
                <span>
                  {listing.promotionTier === 'spotlight' 
                    ? t.promote.badgeSpotlight 
                    : listing.promotionTier === 'weekend' 
                    ? t.promote.badgeWeekend 
                    : t.promote.badgeVip}
                </span>
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-snug mb-2">
              {localizedTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-stone-800">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                {localizedCity} · {listing.address}
              </span>
              {listing.maxGuests && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-stone-500" />
                    <span>{t.detail.capacity}: {listing.maxGuests} {t.detail.guests}</span>
                  </span>
                </>
              )}
              {listing.bedrooms && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span>{listing.bedrooms} {t.detail.bedrooms}</span>
                </>
              )}
              {listing.bathrooms && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span>{listing.bathrooms} {t.detail.bathrooms}</span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-stone-200 pt-5">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2.5">
              {t.detail.about}
            </h2>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {localizedDescription}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="border-t border-stone-200 pt-5">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
              {t.detail.amenitiesTitle}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {listing.amenities.map(am => (
                <div 
                  key={am}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 text-xs font-medium text-stone-800"
                >
                  {getAmenityIcon(am)}
                  <span>{t.amenities[am] || am}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Day Local Weather Forecast Widget */}
          <WeatherWidget
            city={localizedCity}
            region={listing.region}
            coordinates={listing.coordinates}
            lang={lang}
          />

          {/* Interactive Property Location Map */}
          <InteractivePropertyMap
            coordinates={listing.coordinates}
            region={listing.region}
            title={localizedTitle}
            city={localizedCity}
            address={listing.address}
            lang={lang}
            priceUSD={listing.priceUSD}
            thumbnailUrl={mediaItems[0]?.url}
          />

          {/* Host Card & WhatsApp Contact */}
          <div className="border-t border-stone-200 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/80 p-4 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-800 text-white font-bold text-lg flex items-center justify-center shrink-0">
                {listing.host.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-stone-900">{listing.host.name}</span>
                  {listing.host.verified && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-800 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {t.card.verifiedHost}
                    </span>
                  )}
                </div>
                <span className="text-xs text-stone-500 font-mono">{listing.host.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* In-App Direct Chat with Host Button */}
              {onStartChatWithHost && (
                <button
                  onClick={() => onStartChatWithHost(listing)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all shadow-xs min-h-[42px]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'دردشة مباشرة مع المضيف' : lang === 'fr' ? 'Discuter avec l’hôte' : 'Chat with Host'}</span>
                </button>
              )}

              {/* WhatsApp Direct Chat Button */}
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-95 rounded-xl transition-all shadow-xs min-h-[42px]"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
              </button>

              {/* Social Share Trigger */}
              <button
                onClick={() => onShareListing(listing)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-all active:scale-95 min-h-[42px]"
              >
                <Share2 className="w-4 h-4 text-emerald-800" />
                <span>{lang === 'ar' ? 'مشاركة الإعلان' : lang === 'fr' ? 'Partager l’annonce' : 'Share Listing'}</span>
              </button>

              {/* Physical On-Site QR Code Viewer */}
              {onOpenQrCode && (
                <button
                  onClick={() => onOpenQrCode(listing)}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-all active:scale-95 min-h-[42px]"
                  title={lang === 'ar' ? 'عرض رمز QR للعقار' : 'Show property QR code'}
                >
                  <QrCode className="w-4 h-4 text-emerald-800" />
                  <span>{lang === 'ar' ? 'رمز QR' : 'QR Code'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-stone-200 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <span>{t.detail.reviewsTitle}</span>
                <span className="text-xs font-semibold text-emerald-900">({listing.reviews.length})</span>
              </h2>
            </div>

            {/* Existing Reviews */}
            <div className="space-y-3">
              {listing.reviews.map(rev => (
                <div key={rev.id} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-stone-900">{rev.author}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-stone-400 text-[10px] ml-1">{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-stone-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Write a Review Form */}
            <form onSubmit={handleReviewSubmit} className="mt-4 p-4 rounded-xl border border-stone-200 bg-white space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                {t.detail.writeReview}
              </h3>
              
              {reviewSubmitted && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  {lang === 'ar' 
                    ? '✓ شكراً لك، تم نشر تقييمك بنجاح!' 
                    : lang === 'fr' 
                    ? '✓ Merci, votre avis a été publié avec succès !' 
                    : '✓ Thank you, your review has been submitted successfully!'}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">{t.detail.yourName}</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: فادي منصور' : lang === 'fr' ? 'ex. Fadi Mansour' : 'e.g. Fadi Mansour'}
                    className="w-full text-xs p-2 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">{t.detail.selectRating}</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 bg-white"
                  >
                    <option value={5}>
                      {lang === 'ar' ? '5 ★★★★★ (ممتاز)' : lang === 'fr' ? '5 ★★★★★ (Excellent)' : '5 ★★★★★ (Excellent)'}
                    </option>
                    <option value={4}>
                      {lang === 'ar' ? '4 ★★★★☆ (جيد جداً)' : lang === 'fr' ? '4 ★★★★☆ (Très bien)' : '4 ★★★★☆ (Very Good)'}
                    </option>
                    <option value={3}>
                      {lang === 'ar' ? '3 ★★★☆☆ (جيد)' : lang === 'fr' ? '3 ★★★☆☆ (Bien)' : '3 ★★★☆☆ (Good)'}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">{t.detail.yourComment}</label>
                <textarea
                  rows={2}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={t.detail.yourComment}
                  className="w-full text-xs p-2 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>{t.detail.submitReview}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Sticky Purchase & Direct Chat Bottom Bar (Mobile thumb reach) */}
        <div className="p-3 sm:p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between sticky bottom-0 z-20 gap-2.5 pb-[env(safe-area-inset-bottom,12px)]">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-extrabold text-stone-900 tabular-nums">
                {formattedPrice()}
              </span>
              <span className="text-xs text-stone-500 font-normal">
                / {getPriceUnitLabel()}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-emerald-800 font-semibold block truncate">
              ✓ {lang === 'ar' ? 'حجز فوري ومباشر' : 'Instant direct booking'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onStartChatWithHost && (
              <button
                onClick={() => onStartChatWithHost(listing)}
                className="px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 min-h-[40px]"
                title={lang === 'ar' ? 'دردشة مع المضيف' : 'Chat with host'}
              >
                <MessageSquare className="w-4 h-4 text-emerald-800" />
                <span className="hidden xs:inline">{lang === 'ar' ? 'دردشة' : 'Chat'}</span>
              </button>
            )}

            <button
              onClick={() => onDirectBook(listing)}
              className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 rounded-xl shadow-md transition-all whitespace-nowrap active:scale-95 min-h-[40px]"
            >
              {t.card.bookNow}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Overlay */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-70 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar in Lightbox */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2">
              {currentMedia.type === 'video' ? (
                <Video className="w-4 h-4 text-purple-400" />
              ) : (
                <Camera className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-sm font-bold font-mono">
                {selectedImgIndex + 1} / {mediaItems.length}
              </span>
              <span className="text-stone-400 text-xs hidden sm:inline">· {localizedTitle}</span>
            </div>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center Main Lightbox Media with Arrows */}
          <div 
            className="relative flex-1 flex items-center justify-center my-3 max-h-[80vh] w-full"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {currentMedia.type === 'video' ? (
              <video
                key={currentMedia.url}
                src={currentMedia.url}
                controls
                autoPlay
                playsInline
                className="max-h-[80vh] max-w-full rounded-xl shadow-2xl bg-black"
              />
            ) : (
              <img
                src={currentMedia.url}
                alt={`Fullscreen ${selectedImgIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
              />
            )}

            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-colors shadow-lg active:scale-90"
                >
                  {lang === 'ar' ? (
                    <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                  ) : (
                    <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                  )}
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm transition-colors shadow-lg active:scale-90"
                >
                  {lang === 'ar' ? (
                    <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                  ) : (
                    <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails in Lightbox */}
          {mediaItems.length > 1 && (
            <div 
              className="flex items-center justify-center gap-2 overflow-x-auto pb-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {mediaItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImgIndex === idx
                      ? 'border-emerald-500 scale-105'
                      : 'border-white/20 opacity-50 hover:opacity-90'
                  }`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-stone-900 flex items-center justify-center text-purple-400">
                      <Play className="w-4 h-4 fill-purple-400" />
                    </div>
                  ) : (
                    <img src={item.url} alt="Thumb" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
