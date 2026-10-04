import React, { useState } from 'react';
import { Listing, Language, Currency } from '../types';
import { translations, LBP_RATE } from '../data/translations';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  ExternalLink 
} from 'lucide-react';

interface ShareModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  onShowToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  listing,
  isOpen,
  onClose,
  lang,
  currency,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  const t = translations[lang];
  const localizedTitle = listing.title[lang] || listing.title.en || listing.title.ar;
  const localizedCity = listing.city[lang] || listing.city.en || listing.city.ar;

  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?place=${listing.id}`
    : `https://bookinlebanon.com/?place=${listing.id}`;

  const formattedPrice = currency === 'USD' 
    ? `$${listing.priceUSD}` 
    : `${(listing.priceUSD * LBP_RATE).toLocaleString()} ${lang === 'ar' ? 'ل.ل' : lang === 'fr' ? 'LL' : 'L.L.'}`;

  const shareText = lang === 'ar'
    ? `🇱🇧 اكتشف "${localizedTitle}" في ${localizedCity} عبر تطبيق Book in Lebanon بسعر ${formattedPrice}!\nاحجز مباشرة أو تواصل عبر الرابط:`
    : lang === 'fr'
    ? `🇱🇧 Découvrez "${localizedTitle}" à ${localizedCity} sur Book in Lebanon (${formattedPrice}) !\nRéservez directement via :`
    : `🇱🇧 Check out "${localizedTitle}" in ${localizedCity} on Book in Lebanon (${formattedPrice})!\nBook directly or contact via:`;

  const copyToClipboard = async (customNotice?: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${currentUrl}`);
      }
      setCopied(true);
      if (customNotice) {
        setNotice(customNotice);
        onShowToast(customNotice);
      } else {
        onShowToast(t.shareModal.copied);
      }
      setTimeout(() => {
        setCopied(false);
        setNotice(null);
      }, 3500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // 1. WhatsApp Share
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n${currentUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // 2. Facebook Share
  const handleShareFacebook = () => {
    const url = encodeURIComponent(currentUrl);
    const quote = encodeURIComponent(`${localizedTitle} - Book in Lebanon`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank', 'noopener,noreferrer');
  };

  // 3. Instagram Share (Copies caption and link, then opens Instagram)
  const handleShareInstagram = () => {
    copyToClipboard(t.shareModal.instagramNotice);
    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }, 400);
  };

  // 4. TikTok Share (Copies caption and link, then opens TikTok)
  const handleShareTikTok = () => {
    copyToClipboard(t.shareModal.tiktokNotice);
    setTimeout(() => {
      window.open('https://www.tiktok.com/', '_blank', 'noopener,noreferrer');
    }, 400);
  };

  // Direct Host Contact via WhatsApp
  const handleHostWhatsApp = () => {
    const phone = listing.host.whatsapp.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      lang === 'ar'
        ? `مرحباً، أستفسر عن إعلانك "${localizedTitle}" المعروض على منصة Book in Lebanon.`
        : lang === 'fr'
        ? `Bonjour, je me renseigne sur votre annonce "${localizedTitle}" sur Book in Lebanon.`
        : `Hello, inquiring about your listing "${localizedTitle}" on Book in Lebanon.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border-t sm:border border-stone-200 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2 sm:hidden shrink-0"></div>

        {/* Modal Top Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-800" />
            <h3 className="font-extrabold text-base text-stone-900">{t.shareModal.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 sm:bg-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Listing Preview Snippet */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
            <img 
              src={listing.images[0]} 
              alt={localizedTitle} 
              className="w-14 h-14 object-cover rounded-lg shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                {localizedTitle}
              </h4>
              <p className="text-xs text-stone-500 truncate">{localizedCity} · {listing.address}</p>
              <span className="text-xs font-bold text-emerald-900 tabular-nums">
                {formattedPrice}
              </span>
            </div>
          </div>

          {/* Social Share Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              {t.shareModal.subtitle}
            </span>

            <div className="grid grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group active:scale-95"
              >
                <div className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-[11px] font-bold text-stone-700 mt-1.5">{t.shareModal.whatsapp}</span>
              </button>

              {/* Instagram */}
              <button
                onClick={handleShareInstagram}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 hover:border-pink-500 hover:bg-pink-50/50 transition-all group active:scale-95"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-stone-700 mt-1.5">{t.shareModal.instagram}</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group active:scale-95"
              >
                <div className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/>
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-stone-700 mt-1.5">{t.shareModal.facebook}</span>
              </button>

              {/* TikTok */}
              <button
                onClick={handleShareTikTok}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 hover:border-stone-800 hover:bg-stone-50 transition-all group active:scale-95"
              >
                <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43 6.3 6.3 0 0 0 1.86-4.47V8.41a8.16 8.16 0 0 0 4.87 1.6V6.69z"/>
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-stone-700 mt-1.5">{t.shareModal.tiktok}</span>
              </button>
            </div>
          </div>

          {/* Copy Link Input Bar */}
          <div className="space-y-1.5 pt-2 border-t border-stone-100">
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              {t.shareModal.copyLink}
            </label>
            <div className="flex items-center gap-2 p-1.5 pl-3 rtl:pl-1.5 rtl:pr-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-xs text-stone-600 truncate flex-1 font-mono">
                {currentUrl}
              </span>
              <button
                onClick={() => copyToClipboard()}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-emerald-800 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.shareModal.copied : t.shareModal.copyLink}</span>
              </button>
            </div>
          </div>

          {/* Feedback notice if copied */}
          {notice && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-semibold">
              ✓ {notice}
            </div>
          )}

          {/* Direct Communication with Host via WhatsApp Button */}
          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={handleHostWhatsApp}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>{t.shareModal.chatOnWhatsapp} ({listing.host.name})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
