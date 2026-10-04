import React, { useState, useEffect } from 'react';
import { Listing, Language, PromotionTier, PaymentMethod } from '../types';
import { translations, LBP_RATE } from '../data/translations';
import { 
  X, 
  Sparkles, 
  Crown, 
  Zap, 
  Flame, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock,
  ArrowRight,
  TrendingUp,
  Eye,
  Star
} from 'lucide-react';

interface PromoteListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  allListings: Listing[];
  onPromoteSuccess: (
    listingId: string, 
    tier: PromotionTier, 
    days: number, 
    priceUSD: number,
    paymentMethod: PaymentMethod, 
    refCode: string
  ) => void;
  lang: Language;
}

export const PromoteListingModal: React.FC<PromoteListingModalProps> = ({
  isOpen,
  onClose,
  listing,
  allListings,
  onPromoteSuccess,
  lang,
}) => {
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<PromotionTier>('vip');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('whish_pay');

  // Payment form states
  
  // QRs and references
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [txnRefCode, setTxnRefCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const t = translations[lang];

  // Set default listing when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      const initialId = listing?.id || (allListings.length > 0 ? allListings[0].id : '');
      setSelectedListingId(initialId);
      setTxnRefCode(`PROM-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isOpen, listing, allListings]);

  // Current active listing
  const currentListing = allListings.find(l => l.id === selectedListingId) || listing;
  const localizedTitle = currentListing ? (currentListing.title[lang] || currentListing.title.en || currentListing.title.ar) : '';
  const localizedCity = currentListing ? (currentListing.city[lang] || currentListing.city.en || currentListing.city.ar) : '';

  // Tier pricing configuration
  const tiersConfig = {
    vip: {
      priceUSD: 35,
      days: 30,
      badge: t.promote.badgeVip,
      title: t.promote.tierVip,
      desc: t.promote.tierVipDesc,
      daysLabel: t.promote.days30,
      icon: <Crown className="w-5 h-5 text-amber-500 fill-amber-400" />,
      border: 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-50/70',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
    },
    spotlight: {
      priceUSD: 18,
      days: 14,
      badge: t.promote.badgeSpotlight,
      title: t.promote.tierSpotlight,
      desc: t.promote.tierSpotlightDesc,
      daysLabel: t.promote.days14,
      icon: <Zap className="w-5 h-5 text-emerald-600 fill-emerald-500" />,
      border: 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/70',
      badgeBg: 'bg-emerald-700 text-white',
    },
    weekend: {
      priceUSD: 9,
      days: 3,
      badge: t.promote.badgeWeekend,
      title: t.promote.tierWeekend,
      desc: t.promote.tierWeekendDesc,
      daysLabel: t.promote.days3,
      icon: <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />,
      border: 'border-rose-400 ring-2 ring-rose-400/40 bg-rose-50/70',
      badgeBg: 'bg-rose-600 text-white',
    },
  };

  const activeTierConfig = tiersConfig[selectedTier];
  const totalLBP = activeTierConfig.priceUSD * LBP_RATE;


  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleConfirmPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentListing) return;

    let refCode = txnRefCode;
    if (paymentMethod === 'whish_pay') refCode = `WHISH-${txnRefCode}`;
    if (paymentMethod === 'omt_pay') refCode = `OMT-${txnRefCode}`;

    onPromoteSuccess(
      currentListing.id,
      selectedTier,
      activeTierConfig.days,
      activeTierConfig.priceUSD,
      paymentMethod,
      refCode
    );

    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border-t sm:border border-stone-200 max-h-[92vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2 sm:hidden shrink-0"></div>

        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-gradient-to-r from-amber-950 via-stone-900 to-emerald-950 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-1.5">
                <span>{t.promote.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-extrabold uppercase">PRO</span>
              </h3>
              <p className="text-xs text-stone-300 line-clamp-1">
                {t.promote.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* Promotion Success View */
          <div className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto flex-1 min-h-0">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-amber-50 animate-bounce">
              <Crown className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                {(lang === 'ar' ? 'تم استلام طلب الترقية' : lang === 'fr' ? 'Demande reçue' : 'Promotion request received')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {(lang === 'ar' ? 'سنتواصل معك لإتمام الدفع، ثم يظهر إعلانك في المميزة.' : lang === 'fr' ? 'Nous vous contacterons pour le paiement, puis votre annonce sera mise en avant.' : 'We will contact you to complete payment, then your listing gets featured.')}
              </p>
            </div>

            {/* Promoted Voucher Card */}
            <div className="p-4 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 text-left rtl:text-right space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                <span className="text-xs font-bold text-amber-900 uppercase">
                  {activeTierConfig.title}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                  {activeTierConfig.badge}
                </span>
              </div>

              {currentListing && (
                <div className="flex items-center gap-3">
                  <img
                    src={currentListing.images[0]}
                    alt={localizedTitle}
                    className="w-14 h-14 rounded-xl object-cover border border-amber-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                      {localizedTitle}
                    </h4>
                    <p className="text-xs text-stone-500">{localizedCity}</p>
                    <span className="text-[11px] font-semibold text-emerald-800">
                      صلاحية التمييز: {activeTierConfig.days} يوماً
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">كود الترقية المرجعي:</span>
                <span className="font-mono font-bold text-stone-900">{txnRefCode}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md transition-colors"
            >
              {lang === 'ar' ? 'تم، العودة إلى المنصة' : 'Done, Return to Platform'}
            </button>
          </div>
        ) : (
          /* Promotion Form */
          <form onSubmit={handleConfirmPromotion} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
            {/* 1. Choose which listing to promote */}
            <div>
              <label className="block text-xs font-bold text-stone-900 mb-2 flex items-center justify-between">
                <span>{lang === 'ar' ? 'العقار أو النشاط المراد ترقيته' : 'Listing to promote'}</span>
                <span className="text-[10px] text-stone-400 font-normal">
                  {allListings.length} {lang === 'ar' ? 'عقارات متوفرة' : 'listings'}
                </span>
              </label>

              {listing ? (
                /* Pre-selected listing card */
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <img
                    src={listing.images[0]}
                    alt={localizedTitle}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                      {localizedTitle}
                    </h4>
                    <span className="text-xs text-stone-500 block truncate">{localizedCity}</span>
                    <span className="text-xs font-extrabold text-emerald-900">${listing.priceUSD} USD</span>
                  </div>
                </div>
              ) : (
                /* Dropdown to pick a listing */
                <select
                  value={selectedListingId}
                  onChange={(e) => setSelectedListingId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 font-medium"
                >
                  {allListings.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.title[lang] || l.title.ar} ({l.city[lang] || l.city.ar}) - ${l.priceUSD}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 2. Choose Promotion Tier */}
            <div>
              <label className="block text-xs font-extrabold text-stone-900 uppercase tracking-wider mb-2.5">
                {t.promote.selectTier}
              </label>

              <div className="space-y-2.5">
                {/* VIP Elite Tier */}
                <button
                  type="button"
                  onClick={() => setSelectedTier('vip')}
                  className={`w-full p-3.5 rounded-2xl border text-left rtl:text-right flex items-start justify-between gap-3 transition-all ${
                    selectedTier === 'vip'
                      ? tiersConfig.vip.border
                      : 'border-stone-200 hover:border-amber-300 bg-white hover:bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                      <Crown className="w-5 h-5 fill-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-extrabold text-stone-900">{t.promote.tierVip}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                          VIP
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-snug">
                        {t.promote.tierVipDesc}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-amber-900 font-bold mt-1.5">
                        <span>⏳ {t.promote.days30}</span>
                        <span>·</span>
                        <span>⭐ صدارة البحث والصفحة الأولى</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left shrink-0">
                    <span className="text-base sm:text-lg font-black text-amber-900 tabular-nums block">
                      $35
                    </span>
                    <span className="text-[10px] text-stone-400">USD / شهر</span>
                  </div>
                </button>

                {/* Spotlight Tier */}
                <button
                  type="button"
                  onClick={() => setSelectedTier('spotlight')}
                  className={`w-full p-3.5 rounded-2xl border text-left rtl:text-right flex items-start justify-between gap-3 transition-all ${
                    selectedTier === 'spotlight'
                      ? tiersConfig.spotlight.border
                      : 'border-stone-200 hover:border-emerald-300 bg-white hover:bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                      <Zap className="w-5 h-5 fill-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-extrabold text-stone-900">{t.promote.tierSpotlight}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white">
                          SPOTLIGHT
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-snug">
                        {t.promote.tierSpotlightDesc}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-800 font-bold mt-1.5">
                        <span>⏳ {t.promote.days14}</span>
                        <span>·</span>
                        <span>📈 مضاعفة المشاهدات 4x</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left shrink-0">
                    <span className="text-base sm:text-lg font-black text-emerald-950 tabular-nums block">
                      $18
                    </span>
                    <span className="text-[10px] text-stone-400">USD / أسبوعين</span>
                  </div>
                </button>

                {/* Weekend Peak Boost Tier */}
                <button
                  type="button"
                  onClick={() => setSelectedTier('weekend')}
                  className={`w-full p-3.5 rounded-2xl border text-left rtl:text-right flex items-start justify-between gap-3 transition-all ${
                    selectedTier === 'weekend'
                      ? tiersConfig.weekend.border
                      : 'border-stone-200 hover:border-rose-300 bg-white hover:bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                      <Flame className="w-5 h-5 fill-rose-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-extrabold text-stone-900">{t.promote.tierWeekend}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                          WEEKEND
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-snug">
                        {t.promote.tierWeekendDesc}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-rose-900 font-bold mt-1.5">
                        <span>⏳ {t.promote.days3}</span>
                        <span>·</span>
                        <span>🔥 ذروة حجوزات الويك إند</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left shrink-0">
                    <span className="text-base sm:text-lg font-black text-rose-950 tabular-nums block">
                      $9
                    </span>
                    <span className="text-[10px] text-stone-400">USD / عطلة</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Lebanese Payment Selector */}
            <div className="border-t border-stone-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                  {t.promote.payVia}
                </span>
                <span className="text-xs font-black text-stone-900 tabular-nums">
                  ${activeTierConfig.priceUSD} USD
                </span>
              </div>

              {/* Payment options: Whish Pay, OMT Pay */}
              <div className="grid grid-cols-2 gap-2">
                {/* Whish Pay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('whish_pay')}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'whish_pay'
                      ? 'border-[#E11D48] bg-rose-50 text-stone-900 ring-1 ring-[#E11D48] shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <span className="w-6 h-6 rounded-md bg-[#E11D48] text-white flex items-center justify-center font-black text-[11px]">
                    W
                  </span>
                  <span className="text-xs font-bold">Whish Pay</span>
                  <span className="text-[9px] text-[#E11D48] font-bold">فوري QR</span>
                </button>

                {/* OMT Pay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('omt_pay')}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'omt_pay'
                      ? 'border-[#0284C7] bg-sky-50 text-stone-900 ring-1 ring-[#0284C7] shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <span className="w-6 h-6 rounded-md bg-[#0284C7] text-white flex items-center justify-center font-black text-[10px]">
                    OMT
                  </span>
                  <span className="text-xs font-bold">OMT Pay</span>
                  <span className="text-[9px] text-[#0284C7] font-bold">1400+ فرع</span>
                </button>

              </div>

              <p className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                {(lang === 'ar' ? 'لن تدفع الآن. سنتواصل معك على رقم هاتفك بتفاصيل التحويل، ويتم تفعيل التمييز فور تأكيد الدفع.' : lang === 'fr' ? 'Aucun paiement maintenant. Nous vous contacterons avec les détails du transfert ; la mise en avant est activée après confirmation.' : 'You pay nothing now. We will contact you with transfer details; the promotion goes live once payment is confirmed.')}
              </p>
            </div>

            {/* Total Pricing Summary */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  {(lang === 'ar' ? 'المجموع' : lang === 'fr' ? 'Total' : 'Total')}:
                </span>
                <span className="text-[11px] text-amber-800">
                  {activeTierConfig.days} يوماً تمييز وصدارة
                </span>
              </div>
              <div className="text-right rtl:text-left">
                <span className="text-lg font-black text-amber-950 tabular-nums">
                  ${activeTierConfig.priceUSD} USD
                </span>
                <span className="block text-[10px] text-stone-500 font-medium tabular-nums">
                  {totalLBP.toLocaleString()} ل.ل
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 active:scale-[0.99] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 fill-white" />
              <span>{(lang === 'ar' ? 'أرسل طلب الترقية' : lang === 'fr' ? 'Envoyer la demande' : 'Send promotion request')} (${activeTierConfig.priceUSD} USD)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
