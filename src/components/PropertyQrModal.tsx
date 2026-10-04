import React, { useState, useEffect } from 'react';
import { Listing, Language } from '../types';
import { generateListingQrDataUrl } from '../utils/qrUtils';
import { 
  X, 
  Download, 
  Printer, 
  Share2, 
  Check, 
  QrCode, 
  ExternalLink,
  MapPin,
  Sparkles
} from 'lucide-react';

interface PropertyQrModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PropertyQrModal: React.FC<PropertyQrModalProps> = ({
  listing,
  isOpen,
  onClose,
  lang,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (listing && isOpen) {
      generateListingQrDataUrl(listing.id).then(setQrUrl);
    }
  }, [listing, isOpen]);

  if (!isOpen || !listing) return null;

  const localizedTitle = listing.title[lang] || listing.title.en;
  const localizedCity = listing.city[lang] || listing.city.en;
  const directUrl = `${window.location.origin}/?listing=${listing.id}`;

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `QR_${listing.id}_BookInLebanon.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 text-stone-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900">
                {lang === 'ar' ? 'رمز QR الخاص بالعقار' : lang === 'fr' ? 'Code QR de la propriété' : 'Property QR Code'}
              </h3>
              <p className="text-[10px] text-stone-500">
                {lang === 'ar' ? 'للمسح الميداني عند مدخل العقار' : lang === 'fr' ? 'À afficher sur place' : 'For on-site physical scanning'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Card for display and print */}
        <div className="p-6 text-center space-y-4 print:p-0">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 inline-block shadow-inner mx-auto">
            {qrUrl ? (
              <img 
                src={qrUrl} 
                alt={`QR code for ${localizedTitle}`} 
                className="w-48 h-48 rounded-xl mx-auto"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-stone-400">
                Generating QR...
              </div>
            )}
          </div>

          <div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold tracking-wide uppercase inline-flex items-center gap-1 mb-1">
              <span>🇱🇧</span>
              <span>Book in Lebanon</span>
            </span>
            <h4 className="text-sm font-extrabold text-stone-900 mt-1 line-clamp-1">
              {localizedTitle}
            </h4>
            <div className="flex items-center justify-center gap-1 text-xs text-stone-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{localizedCity}</span>
              <span>·</span>
              <span className="font-semibold text-emerald-800">${listing.priceUSD} USD</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-2 max-w-xs mx-auto">
              {lang === 'ar'
                ? 'امسح الرمز بكاميرا الهاتف أو عبر تطبيق المنصة لعرض التفاصيل والحجز الفوري'
                : lang === 'fr'
                ? 'Scannez avec votre téléphone pour réserver directement'
                : 'Scan with camera or mobile app to view full details and book instantly'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100">
            <button
              onClick={handleDownload}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 transition-all text-xs font-semibold"
            >
              <Download className="w-4 h-4 text-emerald-800 mb-1" />
              <span className="text-[10px]">{lang === 'ar' ? 'حفظ الصورة' : 'Download'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 transition-all text-xs font-semibold"
            >
              <Printer className="w-4 h-4 text-emerald-800 mb-1" />
              <span className="text-[10px]">{lang === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 transition-all text-xs font-semibold"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 mb-1" />
              ) : (
                <Share2 className="w-4 h-4 text-emerald-800 mb-1" />
              )}
              <span className="text-[10px]">
                {copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ الرابط' : 'Copy Link')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
