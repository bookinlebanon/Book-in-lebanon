import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Language, Currency, User } from '../types';
import { translations, LBP_RATE } from '../data/translations';
import { 
  X, 
  Check, 
  Globe, 
  Coins, 
  MessageCircle, 
  Phone,
  User as UserIcon,
  LogIn,
  UserPlus,
  Home,
  ShieldAlert,
  Bell,
  LogOut,
  Crown, Share2 } from 'lucide-react';

interface MobileSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onLogout: () => void;
  onDeleteAccount?: () => void;
  onOpenBecomeHost: () => void;
  onOpenAdmin: () => void;
  onOpenNotifications: () => void;
  onOpenPromote?: () => void;
  onOpenShareApp?: () => void;
  unreadNotificationsCount: number;
}

export const MobileSettingsSheet: React.FC<MobileSettingsSheetProps> = ({
  isOpen,
  onClose,
  lang,
  setLang,
  currency,
  setCurrency,
  currentUser,
  onOpenAuth,
  onLogout,
  onDeleteAccount,
  onOpenBecomeHost,
  onOpenAdmin,
  onOpenNotifications,
  onOpenPromote,
  onOpenShareApp,
  unreadNotificationsCount,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto -mt-1 sm:hidden"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇱🇧</span>
            <h3 className="font-extrabold text-base text-stone-900">
              {lang === 'ar' ? 'الحساب والإعدادات' : 'Account & Settings'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Account Quick Section */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
          {currentUser ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-stone-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-stone-900">{currentUser.name}</h4>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {lang === 'ar' 
                        ? (currentUser.role === 'admin' ? 'مشرف' : currentUser.role === 'host' ? 'مضيف' : 'ضيف')
                        : lang === 'fr'
                        ? (currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'host' ? 'Hôte' : 'Voyageur')
                        : currentUser.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="p-2 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                title={lang === 'ar' ? 'تسجيل الخروج' : lang === 'fr' ? 'Déconnexion' : 'Sign out'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 block">
                {lang === 'ar' ? 'سجل دخولك لتجربة كاملة' : lang === 'fr' ? 'Connectez-vous pour profiter de tout' : 'Sign in for full experience'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth('signin');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Connexion' : 'Sign In'}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth('signup');
                  }}
                  className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إنشاء حساب' : lang === 'fr' ? 'Créer un compte' : 'Sign Up'}</span>
                </button>
              </div>
            </div>
          )}

          {onOpenShareApp && (
            <button
              onClick={() => {
                onClose();
                onOpenShareApp();
              }}
              className="w-full p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <img src="./icon-192.png" alt="" className="w-8 h-8 rounded-xl shadow-xs" />
                <div className="text-left rtl:text-right">
                  <span className="text-xs font-black text-emerald-950 block">
                    {lang === 'ar' ? 'شارك التطبيق مع أصدقائك' : lang === 'fr' ? 'Partager l’app avec vos amis' : 'Share the app with friends'}
                  </span>
                  <span className="text-[10px] text-emerald-800">
                    {lang === 'ar' ? 'واتساب، فيسبوك، تيليغرام، رسائل...' : 'WhatsApp, Facebook, Telegram, SMS...'}
                  </span>
                </div>
              </div>
              <Share2 className="w-4 h-4 text-emerald-800" />
            </button>
          )}

          {/* Quick Promote Banner */}
          {onOpenPromote && (
            <button
              onClick={() => {
                onClose();
                onOpenPromote();
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-100/50 to-amber-50/20 border border-amber-300 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <Crown className="w-4 h-4 fill-white" />
                </div>
                <div className="text-left rtl:text-right">
                  <span className="text-xs font-black text-amber-950 block">
                    {lang === 'ar' ? 'تمييز وترقية الإعلانات' : 'Promote & Boost Listings'}
                  </span>
                  <span className="text-[10px] text-amber-800">
                    {lang === 'ar' ? 'صدارة نتائج البحث والشريط المميز' : 'Top search priority & VIP spotlight'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-amber-700 px-2 py-0.5 rounded-full bg-amber-100">
                VIP ⚡
              </span>
            </button>
          )}

          {/* Quick Action Links: Become a Host & Admin Panel & Notifications */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-200/70">
            <button
              onClick={() => {
                onClose();
                onOpenBecomeHost();
              }}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-950 flex flex-col items-center justify-center text-center transition-all"
            >
              <Home className="w-4 h-4 text-emerald-800 mb-1" />
              <span className="text-[11px] font-bold leading-tight">{lang === 'ar' ? 'انضم كمضيف' : lang === 'fr' ? 'Devenir hôte' : 'Become a Host'}</span>
              <span className="text-[9px] text-emerald-700 font-semibold mt-0.5">{lang === 'ar' ? '0% عمولة' : lang === 'fr' ? '0% commission' : '0% Fee'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 text-purple-950 flex flex-col items-center justify-center text-center transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-purple-700 mb-1" />
              <span className="text-[11px] font-bold leading-tight">{lang === 'ar' ? 'لوحة المشرف' : lang === 'fr' ? 'Admin' : 'Admin Panel'}</span>
              <span className="text-[9px] text-purple-600 font-semibold mt-0.5">{lang === 'ar' ? 'إدارة المنصة' : lang === 'fr' ? 'Gestion' : 'Dashboard'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenNotifications();
              }}
              className="relative p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 flex flex-col items-center justify-center text-center transition-all"
            >
              <Bell className="w-4 h-4 text-stone-600 mb-1" />
              <span className="text-[11px] font-bold leading-tight">{lang === 'ar' ? 'الإشعارات' : lang === 'fr' ? 'Alertes' : 'Notifications'}</span>
              {unreadNotificationsCount > 0 ? (
                <span className="text-[9px] text-rose-600 font-bold mt-0.5">{unreadNotificationsCount} {lang === 'ar' ? 'جديد' : lang === 'fr' ? 'nouv.' : 'new'}</span>
              ) : (
                <span className="text-[9px] text-stone-400 mt-0.5">{lang === 'ar' ? 'لا جديد' : lang === 'fr' ? 'Aucun' : 'None'}</span>
              )}
            </button>
          </div>
        </div>

        {/* Appearance: light / dark / follow the phone */}
        <ThemeSwitcher lang={lang} />

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            {lang === 'ar' ? 'لغة التطبيق' : lang === 'fr' ? 'Langue de l’application' : 'App Language'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'ar', label: 'العربية', sub: 'عربي' },
              { code: 'en', label: 'English', sub: 'English' },
              { code: 'fr', label: 'Français', sub: 'Français' },
            ].map((item) => {
              const isSelected = lang === item.code;
              return (
                <button
                  key={item.code}
                  onClick={() => setLang(item.code as Language)}
                  className={`p-2.5 rounded-xl border text-center transition-all min-h-[46px] flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-extrabold ring-1 ring-emerald-800'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className="text-[10px] text-stone-400 font-normal">{item.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Currency Selection */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {lang === 'ar' ? 'العملة المعروضة' : lang === 'fr' ? 'Devise d’affichage' : 'Display Currency'}
            </label>
            <span className="text-[11px] text-stone-400 font-mono">
              {lang === 'ar' ? '1$ = 89,500 ل.ل' : lang === 'fr' ? '1$ = 89 500 LL' : '1$ = 89,500 LBP'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { 
                code: 'USD', 
                label: '$', 
                desc: lang === 'ar' ? 'دولار أمريكي' : lang === 'fr' ? 'Dollar américain' : 'US Dollar' 
              },
              { 
                code: 'LBP', 
                label: lang === 'ar' ? 'ل.ل' : lang === 'fr' ? 'LL' : 'LBP', 
                desc: lang === 'ar' ? 'ليرة لبنانية' : lang === 'fr' ? 'Livre libanaise' : 'Lebanese Pound' 
              },
            ].map((cur) => {
              const isSelected = currency === cur.code;
              return (
                <button
                  key={cur.code}
                  onClick={() => setCurrency(cur.code as Currency)}
                  className={`p-2.5 rounded-xl border text-center transition-all min-h-[46px] flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-extrabold ring-1 ring-emerald-800'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-xs font-bold">{cur.label}</span>
                  <span className="text-[10px] text-stone-500">{cur.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legal links and account deletion */}
        <div className="flex items-center justify-center gap-3 text-[11px] font-semibold text-stone-500">
          <a href="./privacy.html" target="_blank" rel="noopener" className="hover:text-stone-800 underline">
            {lang === 'ar' ? 'سياسة الخصوصية' : lang === 'fr' ? 'Confidentialité' : 'Privacy Policy'}
          </a>
          <span aria-hidden="true">·</span>
          <a href="./terms.html" target="_blank" rel="noopener" className="hover:text-stone-800 underline">
            {lang === 'ar' ? 'شروط الاستخدام' : lang === 'fr' ? 'Conditions' : 'Terms of Use'}
          </a>
          {currentUser && onDeleteAccount && (
            <>
              <span aria-hidden="true">·</span>
              <button onClick={onDeleteAccount} className="text-rose-600 hover:text-rose-700 underline">
                {lang === 'ar' ? 'حذف حسابي' : lang === 'fr' ? 'Supprimer mon compte' : 'Delete my account'}
              </button>
            </>
          )}
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-stone-900 hover:bg-stone-800 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl transition-all"
        >
          {lang === 'ar' ? 'حفظ وإغلاق' : lang === 'fr' ? 'Enregistrer et fermer' : 'Save & Close'}
        </button>
      </div>
    </div>
  );
};
