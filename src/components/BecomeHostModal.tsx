import React, { useState } from 'react';
import { Language, Currency } from '../types';
import { translations, LBP_RATE } from '../data/translations';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  DollarSign, 
  MessageCircle, 
  ShieldCheck, 
  TrendingUp, 
  Camera, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

interface BecomeHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  onOpenPostAd: () => void;
}

export const BecomeHostModal: React.FC<BecomeHostModalProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  onOpenPostAd,
}) => {
  // Calculator state
  const [propertyType, setPropertyType] = useState<'chalet' | 'guesthouse' | 'studio' | 'villa'>('chalet');
  const [nightsPerMonth, setNightsPerMonth] = useState<number>(10);
  const [ratePerNight, setRatePerNight] = useState<number>(200);

  if (!isOpen) return null;

  const presets: Record<string, { labelAr: string; labelEn: string; defaultRate: number; exampleRegion: string }> = {
    chalet: {
      labelAr: 'شاليه جبلي (فاريا، الأرز، فقرا)',
      labelEn: 'Mountain Chalet (Faraya, Cedars, Faqra)',
      defaultRate: 240,
      exampleRegion: 'Faraya / Cedars',
    },
    guesthouse: {
      labelAr: 'بيت ضيافة تراثي (البترون، الشوف، جبيل)',
      labelEn: 'Heritage Guest House (Batroun, Chouf, Byblos)',
      defaultRate: 160,
      exampleRegion: 'Batroun / Chouf',
    },
    studio: {
      labelAr: 'استوديو مفروش (بيروت، برمانا)',
      labelEn: 'Furnished Studio (Beirut, Broummana)',
      defaultRate: 90,
      exampleRegion: 'Beirut / Matn',
    },
    villa: {
      labelAr: 'فيلا فخمة مع مسبح (جزين، فقرا، صور)',
      labelEn: 'Luxury Villa with Pool (Jezzine, Faqra, Tyre)',
      defaultRate: 350,
      exampleRegion: 'Jezzine / Faqra',
    },
  };

  const handlePropertyTypeChange = (type: 'chalet' | 'guesthouse' | 'studio' | 'villa') => {
    setPropertyType(type);
    setRatePerNight(presets[type].defaultRate);
  };

  const monthlyEstUSD = nightsPerMonth * ratePerNight;
  const yearlyEstUSD = monthlyEstUSD * 12;

  const formatMoney = (amountUSD: number) => {
    if (currency === 'USD') return `$${amountUSD.toLocaleString()}`;
    return `${(amountUSD * LBP_RATE).toLocaleString()} ${lang === 'ar' ? 'ل.ل' : lang === 'fr' ? 'LL' : 'L.L.'}`;
  };

  const benefits = [
    {
      icon: <DollarSign className="w-5 h-5 text-emerald-800" />,
      titleAr: '0% عمولة - أرباحك 100% لك',
      titleEn: '0% Commission - Keep 100% Earnings',
      descAr: 'لا نقتطع أي نسب مئوية من حجوزاتك. السعر الذي تضعه هو ما تقبضه مباشرة من الضيف.',
      descEn: 'Zero platform fees on bookings. Direct cash or transfer payment straight from travelers.',
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-[#25D366]" />,
      titleAr: 'تواصل مباشر وسريع عبر واتساب',
      titleEn: 'Direct WhatsApp Communication',
      descAr: 'يصلك استفسار الضيف وتأكيد حجزه مباشرة على هاتفك لتتحدث معه وتنسق الوصول بحرية.',
      descEn: 'Guest inquiries and booking vouchers arrive directly to your WhatsApp with full details.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-800" />,
      titleAr: 'شارة المضيف الموثق والمعتمد',
      titleEn: 'Verified Host Identity Badge',
      descAr: 'نوثق حسابك ونمنح إعلانك شارة الموثوقية لرفع معدل الحجوزات وبناء ثقة المغتربين والسياح.',
      descEn: 'Build immediate trust with local travelers and the Lebanese diaspora worldwide.',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
      titleAr: 'تسويق عبر انستغرام وتيك توك',
      titleEn: 'Social Media Amplification',
      descAr: 'مشاركة إعلانك عبر شبكات التواصل، مع أدوات جاهزة للمشاركة بنقرة واحدة.',
      descEn: 'Built-in one-tap sharing to Instagram stories, Facebook, TikTok, and WhatsApp.',
    },
  ];

  const steps = [
    {
      num: '1',
      titleAr: 'أضف تفاصيل وصور العقار',
      titleEn: 'Add photos & property details',
      descAr: 'اختر صوراً مميزة لشاليهك أو بيت الضيافة وحدد السعر والخدمات ورقم الواتساب.',
      descEn: 'Upload photos, select amenities, set your pricing basis and WhatsApp contact.',
    },
    {
      num: '2',
      titleAr: 'مراجعة وتفعيل الإعلان فوراً',
      titleEn: 'Instant review & publishing',
      descAr: 'يصبح إعلانك معروضاً لآلاف الزوار والباحثين عن إقامات استثنائية في لبنان.',
      descEn: 'Your listing goes live instantly across web and mobile searches.',
    },
    {
      num: '3',
      titleAr: 'استقبل الحجوزات والأرباح',
      titleEn: 'Receive bookings & enjoy income',
      descAr: 'تواصل مع الضيوف مباشرة عبر واتساب ونسق الدفع والاستقبال.',
      descEn: 'Chat directly on WhatsApp, finalize booking, and receive guests.',
    },
  ];

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Heroic Gradient */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900 text-white shrink-0 overflow-hidden">
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1.5 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'انضم إلى نخبة مضيفي لبنان' : lang === 'fr' ? 'Rejoignez l’élite des hôtes au Liban' : 'Become a Host on Book in Lebanon'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {lang === 'ar' 
                  ? 'أجّر شاليهك، بيت ضيافتك أو مطعمك بدون أي عمولة' 
                  : lang === 'fr'
                  ? 'Louez votre chalet ou maison d’hôtes avec 0% de commission'
                  : 'List your chalet, guest house or venue with 0% fees'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 font-normal">
                {lang === 'ar'
                  ? 'تواصل مباشر عبر واتساب مع آلاف الضيوف من المقيمين والمغتربين اللبنانيين والسياح.'
                  : lang === 'fr'
                  ? 'Contact direct via WhatsApp avec des milliers de voyageurs, résidents et diaspora.'
                  : 'Connect directly via WhatsApp with guests looking for authentic stays in Lebanon.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1 text-stone-800">
          {/* Interactive Earnings Calculator */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                  {lang === 'ar' ? 'حاسبة العائد المالي التقديري' : lang === 'fr' ? 'Simulateur de revenus' : 'Estimated Earnings Calculator'}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                {lang === 'ar' ? 'أرباح 100% لك دون اقتطاع' : lang === 'fr' ? '100% de vos gains conservés' : 'Keep 100% of revenue'}
              </span>
            </div>

            {/* Property Type Selector */}
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1.5">
                {lang === 'ar' ? 'اختر فئة عقارك' : lang === 'fr' ? 'Type d’hébergement' : 'Select property type'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['chalet', 'guesthouse', 'studio', 'villa'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handlePropertyTypeChange(type)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      propertyType === type
                        ? 'border-emerald-800 bg-emerald-800 text-white shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    {presets[type][lang === 'ar' ? 'labelAr' : 'labelEn'].split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders for Nights & Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-medium text-stone-600">
                    {lang === 'ar' ? 'سعر الليلة المقترح' : lang === 'fr' ? 'Tarif nuitée estimé' : 'Nightly Rate'}
                  </span>
                  <span className="font-bold text-stone-900 font-mono">
                    ${ratePerNight} {lang === 'ar' ? 'دولار' : 'USD'}
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="600"
                  step="10"
                  value={ratePerNight}
                  onChange={(e) => setRatePerNight(Number(e.target.value))}
                  className="w-full accent-emerald-800 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-medium text-stone-600">
                    {lang === 'ar' ? 'عدد الليالي المحجوزة شهرياً' : lang === 'fr' ? 'Nuits réservées / mois' : 'Booked Nights/Month'}
                  </span>
                  <span className="font-bold text-stone-900 font-mono">
                    {nightsPerMonth} {lang === 'ar' ? 'ليالٍ' : lang === 'fr' ? 'nuits' : 'nights'}
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="28"
                  step="1"
                  value={nightsPerMonth}
                  onChange={(e) => setNightsPerMonth(Number(e.target.value))}
                  className="w-full accent-emerald-800 cursor-pointer"
                />
              </div>
            </div>

            {/* Total Estimated Earnings Callout */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-stone-900 text-white flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider block">
                  {lang === 'ar' ? 'العائد الشهري التقديري' : lang === 'fr' ? 'Revenu mensuel estimé' : 'Estimated Monthly Income'}
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                  {formatMoney(monthlyEstUSD)}
                </span>
              </div>
              <div className="text-right rtl:text-left">
                <span className="text-[11px] text-stone-400 font-medium block">
                  {lang === 'ar' ? 'العائد السنوي المتوقع' : lang === 'fr' ? 'Revenu annuel estimé' : 'Estimated Yearly'}
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-200 font-mono">
                  ≈ {formatMoney(yearlyEstUSD)}
                </span>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
              {lang === 'ar' ? 'لماذا يعتمد أصحاب العقارات في لبنان على منصتنا؟' : lang === 'fr' ? 'Pourquoi choisir notre plateforme ?' : 'Why Lebanese Hosts Choose Us'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((b, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-stone-200 bg-white flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-stone-50 border border-stone-200/80 flex items-center justify-center shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{lang === 'ar' ? b.titleAr : b.titleEn}</h4>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">{lang === 'ar' ? b.descAr : b.descEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Simple Steps */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
              {lang === 'ar' ? '3 خطوات بسيطة لبدء التأجير' : lang === 'fr' ? '3 étapes simples pour démarrer' : '3 Simple Steps to Start'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {steps.map((st) => (
                <div key={st.num} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 relative">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-black flex items-center justify-center mb-2">
                    {st.num}
                  </span>
                  <h4 className="text-xs font-bold text-stone-900 mb-1">{lang === 'ar' ? st.titleAr : st.titleEn}</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed">{lang === 'ar' ? st.descAr : st.descEn}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            {lang === 'ar' ? 'إغلاق' : lang === 'fr' ? 'Fermer' : 'Close'}
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenPostAd();
            }}
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <span>{lang === 'ar' ? 'ابدأ بنشر إعلانك الآن' : lang === 'fr' ? 'Commencer à publier' : 'Publish Your Listing Now'}</span>
            {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
