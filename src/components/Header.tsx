import React, { useState, useRef, useEffect } from 'react';
import { Language, Currency, Category, User } from '../types';
import { translations } from '../data/translations';
import { 
  PlusCircle, 
  BookmarkCheck, 
  Heart, 
  Menu, 
  X,
  Bell,
  User as UserIcon,
  ShieldAlert,
  Home,
  LogOut,
  Sparkles,
  ChevronDown,
  LogIn, 
  UserPlus,
  QrCode,
  Globe,
  MessageSquare,
  Crown,
  Check, Share2 } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  onOpenPostAd: () => void;
  onOpenMyBookings: () => void;
  onOpenFavorites: () => void;
  onOpenQrScanner?: () => void;
  onOpenChat?: () => void;
  onOpenPromote?: () => void;
  onOpenShareApp?: () => void;
  unreadMessagesCount?: number;
  bookingsCount: number;
  favoritesCount: number;
  currentUser: User | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onLogout: () => void;
  onOpenBecomeHost: () => void;
  onOpenAdmin: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  currency,
  setCurrency,
  selectedCategory,
  onSelectCategory,
  onOpenPostAd,
  onOpenMyBookings,
  onOpenFavorites,
  onOpenQrScanner,
  onOpenChat,
  onOpenPromote,
  onOpenShareApp,
  unreadMessagesCount = 0,
  bookingsCount,
  favoritesCount,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenBecomeHost,
  onOpenAdmin,
  onOpenNotifications,
  unreadNotificationsCount,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  const languages: {
    code: Language;
    label: string;
    shortLabel: string;
    subtext: string;
    flag: string;
  }[] = [
    {
      code: 'ar',
      label: 'العربية',
      shortLabel: 'عربي',
      subtext: 'اللغة العربية الرسمية (لبنان)',
      flag: '🇱🇧',
    },
    {
      code: 'en',
      label: 'English',
      shortLabel: 'EN',
      subtext: 'International English',
      flag: '🇬🇧',
    },
    {
      code: 'fr',
      label: 'Français',
      shortLabel: 'FR',
      subtext: 'Français du Liban',
      flag: '🇫🇷',
    },
  ];

  const navCategories: { key: Category; label: string }[] = [
    { key: 'all', label: t.categories.all },
    { key: 'chalet', label: t.categories.chalet },
    { key: 'guesthouse', label: t.categories.guesthouse },
    { key: 'studio', label: t.categories.studio },
    { key: 'hotel', label: t.categories.hotel },
    { key: 'restaurant', label: t.categories.restaurant },
    { key: 'real_estate', label: t.categories.real_estate },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (cat: Category) => {
    onSelectCategory(cat);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18 gap-2">
          
          {/* Zone 1: Logo Wordmark */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button 
              onClick={() => handleCategoryClick('all')} 
              className="text-left rtl:text-right group flex items-center gap-1.5 sm:gap-2 focus:outline-none min-h-[44px] cursor-pointer"
            >
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-sm sm:text-lg shadow-xs ring-1 ring-emerald-900/10 shrink-0">
                🇱🇧
              </span>
              <div className="flex flex-col">
                <span className="text-sm xs:text-base sm:text-xl font-extrabold tracking-tight text-stone-900 group-hover:text-emerald-800 transition-colors whitespace-nowrap">
                  Book in Lebanon
                </span>
                <span className="text-[10px] sm:text-[11px] text-stone-500 font-medium hidden sm:block -mt-0.5">
                  {lang === 'ar' 
                    ? 'شاليهات · بيوت ضيافة · مطاعم' 
                    : lang === 'fr'
                    ? 'Chalets · Maisons d’hôtes · Tables'
                    : 'Chalets · Guest Houses · Dining'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Category Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navCategories.map((item) => {
              const isActive = selectedCategory === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleCategoryClick(item.key)}
                  className={`px-3 py-1.5 text-sm font-medium transition-all rounded-lg whitespace-nowrap min-h-[36px] ${
                    isActive
                      ? 'text-emerald-900 bg-emerald-50 font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Currency, Language, Notifications, User Menu, Post Ad) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Currency Selector */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs font-semibold text-stone-700">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 min-w-[26px] min-h-[26px] rounded-md transition-all flex items-center justify-center ${
                  currency === 'USD'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="US Dollar"
              >
                $
              </button>
              <button
                onClick={() => setCurrency('LBP')}
                className={`px-2 py-1 min-w-[26px] min-h-[26px] rounded-md transition-all flex items-center justify-center ${
                  currency === 'LBP'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Lebanese Pound (ل.ل)"
              >
                ل.ل
              </button>
            </div>

            {/* Dynamic Language Switcher Toggle (Desktop & Mobile) */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all min-h-[36px] cursor-pointer ${
                  langMenuOpen
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'bg-stone-100 hover:bg-stone-200/80 border-stone-200/80 text-stone-800'
                }`}
                title={
                  lang === 'ar'
                    ? 'تبديل اللغة (عربي / English / Français)'
                    : lang === 'fr'
                    ? 'Changer de langue'
                    : 'Switch Language'
                }
                aria-label="Switch Language"
                aria-expanded={langMenuOpen}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                <span className="text-sm leading-none select-none">
                  {lang === 'ar' ? '🇱🇧' : lang === 'fr' ? '🇫🇷' : '🇬🇧'}
                </span>
                <span className="font-extrabold text-stone-900 text-xs">
                  {lang === 'ar' ? 'عربي' : lang === 'fr' ? 'FR' : 'EN'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${
                    langMenuOpen ? 'rotate-180 text-emerald-800' : ''
                  }`}
                />
              </button>

              {/* Language Switcher Dropdown Menu */}
              {langMenuOpen && (
                <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 z-50 w-56 p-1.5 rounded-2xl bg-white shadow-2xl border border-stone-200 animate-in fade-in slide-in-from-top-2 duration-150 text-left rtl:text-right">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 border-b border-stone-100 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>
                      {lang === 'ar'
                        ? 'لغة المنصة'
                        : lang === 'fr'
                        ? 'Langue'
                        : 'Language'}
                    </span>
                    <Globe className="w-3 h-3 text-stone-400" />
                  </div>

                  <div className="space-y-1">
                    {languages.map((l) => {
                      const isCurrent = lang === l.code;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            setLang(l.code);
                            setLangMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/80 shadow-2xs'
                              : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg leading-none select-none">{l.flag}</span>
                            <div>
                              <span className="block font-bold text-stone-900 leading-tight">
                                {l.label}
                              </span>
                              <span className="block text-[10px] text-stone-400 font-normal">
                                {l.subtext}
                              </span>
                            </div>
                          </div>

                          {isCurrent && (
                            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick 1-Click Segmented Language Toggle (Large screens) */}
            <div className="hidden xl:flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700">
              {languages.map((l) => {
                const isCurrent = lang === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code)}
                    className={`flex items-center gap-1 px-2.5 py-1 min-h-[28px] rounded-lg transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-white text-emerald-950 font-extrabold shadow-xs'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                    title={l.subtext}
                  >
                    <span className="text-xs leading-none select-none">{l.flag}</span>
                    <span>{l.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* QR Code Scanner Button (Desktop / Tablet - on mobile it has a dedicated tab in bottom nav) */}
            {onOpenQrScanner && (
              <button
                onClick={onOpenQrScanner}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 rounded-xl transition-all active:scale-95 min-h-[40px]"
                title={lang === 'ar' ? 'مسح رمز QR للعقار في الموقع' : 'Scan property QR code'}
                aria-label="Scan QR Code"
              >
                <QrCode className="w-4 h-4 stroke-[2.2]" />
                <span className="hidden lg:inline text-[11px] font-bold">
                  {lang === 'ar' ? 'مسح QR' : 'Scan QR'}
                </span>
              </button>
            )}

            {/* Messages / In-App Chat Button (Desktop - on mobile it has a dedicated tab in bottom nav) */}
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="hidden md:flex relative p-2 text-stone-600 hover:text-emerald-900 hover:bg-stone-100 rounded-xl transition-colors min-h-[40px] min-w-[40px] items-center justify-center"
                title={lang === 'ar' ? 'الرسائل والمحادثات مع المضيفين' : 'Chat & Messages'}
                aria-label="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 rtl:right-auto rtl:left-1.5 w-4 h-4 bg-emerald-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            )}

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 sm:p-2 text-stone-600 hover:text-emerald-900 hover:bg-stone-100 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title={lang === 'ar' ? 'الإشعارات والتنبيهات' : 'Notifications'}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 rtl:right-auto rtl:left-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-1 ring-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Favorites Icon (Desktop) */}
            <button
              onClick={onOpenFavorites}
              className="hidden md:flex relative p-2 text-stone-600 hover:text-rose-600 hover:bg-stone-100 rounded-xl transition-colors min-h-[40px] min-w-[40px] items-center justify-center"
              title={t.nav.favorites}
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 rtl:right-auto rtl:left-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {onOpenShareApp && (
              <button
                onClick={onOpenShareApp}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-xs min-h-[40px] whitespace-nowrap active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'شارك التطبيق' : lang === 'fr' ? 'Partager l’app' : 'Share app'}</span>
              </button>
            )}

            {/* Promote Listing CTA Button */}
            {onOpenPromote && (
              <button
                onClick={onOpenPromote}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all shadow-xs min-h-[40px] whitespace-nowrap active:scale-95"
                title={t.promote.title}
              >
                <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>{t.promote.button}</span>
              </button>
            )}

            {/* Post an Ad Primary CTA */}
            <button
              onClick={onOpenPostAd}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 rounded-xl shadow-xs transition-colors whitespace-nowrap min-h-[40px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.postAd.button}</span>
            </button>

            {/* User Account Dropdown Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all flex items-center gap-1.5 min-h-[40px] ${
                  userMenuOpen
                    ? 'border-emerald-700 bg-emerald-50/70'
                    : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                }`}
                aria-label="User Account Menu"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-bold">
                    {currentUser ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                )}

                <div className="hidden sm:flex flex-col text-left rtl:text-right min-w-[70px]">
                  <span className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[100px]">
                    {currentUser ? currentUser.name : (lang === 'ar' ? 'حسابي' : lang === 'fr' ? 'Mon compte' : 'My Account')}
                  </span>
                  <span className="text-[10px] text-stone-500 font-semibold leading-none">
                    {currentUser 
                      ? (lang === 'ar' 
                          ? (currentUser.role === 'admin' ? 'مشرف' : currentUser.role === 'host' ? 'مضيف' : 'ضيف')
                          : lang === 'fr'
                          ? (currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'host' ? 'Hôte' : 'Voyageur')
                          : (currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'host' ? 'Host' : 'Guest'))
                      : (lang === 'ar' ? 'دخول / حساب' : lang === 'fr' ? 'Connexion' : 'Sign in')}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* Dropdown Menu Window */}
              {userMenuOpen && (
                <div 
                  className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  {/* User Profile Header if logged in */}
                  {currentUser ? (
                    <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/70">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {currentUser.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          currentUser.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : currentUser.role === 'host'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}>
                          {lang === 'ar' 
                            ? (currentUser.role === 'admin' ? 'مشرف' : currentUser.role === 'host' ? 'مضيف' : 'ضيف')
                            : lang === 'fr'
                            ? (currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'host' ? 'Hôte' : 'Voyageur')
                            : currentUser.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-mono truncate">{currentUser.email}</p>
                    </div>
                  ) : (
                    <div className="px-3 py-2 border-b border-stone-100 flex flex-col gap-1.5">
                      <button
                        onClick={() => onOpenAuth('signin')}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Se connecter' : 'Sign In'}</span>
                      </button>

                      <button
                        onClick={() => onOpenAuth('signup')}
                        className="w-full py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'إنشاء حساب جديد' : lang === 'fr' ? 'Créer un compte' : 'Sign Up'}</span>
                      </button>
                    </div>
                  )}

                  {/* Menu Items */}
                  <div className="py-1">
                    {/* Become a Host with Details */}
                    <button
                      onClick={onOpenBecomeHost}
                      className="w-full px-4 py-2 text-xs font-bold text-stone-800 hover:bg-emerald-50/70 hover:text-emerald-900 transition-colors flex items-center justify-between text-left rtl:text-right"
                    >
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-emerald-800" />
                        <span>{lang === 'ar' ? 'انضم كمضيف' : lang === 'fr' ? 'Devenir hôte' : 'Become a Host'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                        {lang === 'ar' ? '0% عمولة' : lang === 'fr' ? '0% commission' : '0% Fee'}
                      </span>
                    </button>

                    {/* Promote Listing */}
                    {onOpenPromote && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenPromote();
                        }}
                        className="w-full px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50 hover:text-amber-950 transition-colors flex items-center justify-between text-left rtl:text-right"
                      >
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                          <span>{t.promote.title}</span>
                        </div>
                        <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          VIP
                        </span>
                      </button>
                    )}

                    {/* Admin Panel Link */}
                    <button
                      onClick={onOpenAdmin}
                      className="w-full px-4 py-2 text-xs font-bold text-stone-800 hover:bg-purple-50 hover:text-purple-900 transition-colors flex items-center justify-between text-left rtl:text-right"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-purple-700" />
                        <span>{lang === 'ar' ? 'لوحة تحكم المشرف' : lang === 'fr' ? 'Panneau d’administration' : 'Admin Panel'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded">
                        {lang === 'ar' ? 'مشرف' : lang === 'fr' ? 'Admin' : 'Admin'}
                      </span>
                    </button>

                    {/* Post an Ad */}
                    <button
                      onClick={onOpenPostAd}
                      className="w-full px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2 text-left rtl:text-right"
                    >
                      <PlusCircle className="w-4 h-4 text-stone-500" />
                      <span>{t.postAd.button}</span>
                    </button>

                    {/* My Bookings */}
                    <button
                      onClick={onOpenMyBookings}
                      className="w-full px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-between text-left rtl:text-right"
                    >
                      <div className="flex items-center gap-2">
                        <BookmarkCheck className="w-4 h-4 text-emerald-700" />
                        <span>{t.nav.myBookings}</span>
                      </div>
                      {bookingsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {bookingsCount}
                        </span>
                      )}
                    </button>

                    {/* Favorites */}
                    <button
                      onClick={onOpenFavorites}
                      className="w-full px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-between text-left rtl:text-right"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>{t.nav.favorites}</span>
                      </div>
                      {favoritesCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          {favoritesCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Sign Out if logged in */}
                  {currentUser && (
                    <div className="pt-1 mt-1 border-t border-stone-100">
                      <button
                        onClick={onLogout}
                        className="w-full px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 text-left rtl:text-right"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'تسجيل الخروج' : lang === 'fr' ? 'Se déconnecter' : 'Sign Out'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
