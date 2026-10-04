import React from 'react';
import { Language, Category } from '../types';
import { translations } from '../data/translations';
import { 
  Compass, 
  Map,
  Heart, 
  Plus, 
  BookmarkCheck, 
  Globe,
  QrCode,
  MessageSquare,
  SlidersHorizontal,
  LayoutGrid
} from 'lucide-react';

interface MobileBottomNavProps {
  lang: Language;
  activeTab: 'explore' | 'favorites' | 'bookings';
  setActiveTab: (tab: 'explore' | 'favorites' | 'bookings') => void;
  viewMode?: 'grid' | 'map' | 'split';
  onToggleViewMode?: (mode: 'grid' | 'map' | 'split') => void;
  onOpenPostAd: () => void;
  onOpenMyBookings: () => void;
  onOpenFavorites: () => void;
  onOpenSettings: () => void;
  onOpenQrScanner: () => void;
  onOpenChat: () => void;
  unreadMessagesCount: number;
  bookingsCount: number;
  favoritesCount: number;
  onSelectCategory: (cat: Category) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  lang,
  activeTab,
  setActiveTab,
  viewMode = 'grid',
  onToggleViewMode,
  onOpenPostAd,
  onOpenMyBookings,
  onOpenFavorites,
  onOpenSettings,
  onOpenQrScanner,
  onOpenChat,
  unreadMessagesCount,
  bookingsCount,
  favoritesCount,
  onSelectCategory,
}) => {
  const t = translations[lang];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
      <div className="grid grid-cols-5 items-center justify-items-center h-13 max-w-md mx-auto">
        
        {/* 1. Explore (Grid) */}
        <button
          onClick={() => {
            setActiveTab('explore');
            if (onToggleViewMode) onToggleViewMode('grid');
            onSelectCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'explore' && viewMode === 'grid'
              ? 'text-emerald-800 font-extrabold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          aria-label={t.nav.explore}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'explore' && viewMode === 'grid' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5 font-bold">
            {lang === 'ar' ? 'استكشاف' : lang === 'fr' ? 'Explorer' : 'Explore'}
          </span>
        </button>

        {/* 2. Interactive Map View */}
        <button
          onClick={() => {
            setActiveTab('explore');
            if (onToggleViewMode) onToggleViewMode('map');
          }}
          className={`relative flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-colors cursor-pointer ${
            viewMode === 'map'
              ? 'text-emerald-800 font-extrabold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          aria-label={t.filter.mapView}
        >
          <div className="relative">
            <Map className={`w-5 h-5 ${viewMode === 'map' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {viewMode === 'map' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-700 animate-ping" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-bold">
            {lang === 'ar' ? 'الخريطة' : lang === 'fr' ? 'Carte' : 'Map'}
          </span>
        </button>

        {/* 3. Center Elevated Post Ad Action */}
        <button
          onClick={onOpenPostAd}
          className="relative -top-2 flex flex-col items-center justify-center group focus:outline-none cursor-pointer"
          aria-label={t.postAd.button}
        >
          <div className="w-11 h-11 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-900/25 group-active:scale-95 transition-transform border-2 border-white">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-bold text-emerald-900 tracking-tight mt-0.5 whitespace-nowrap">
            {lang === 'ar' ? 'نشر إعلان' : lang === 'fr' ? 'Publier' : 'Post'}
          </span>
        </button>

        {/* 4. Messages & Host Chat */}
        <button
          onClick={onOpenChat}
          className="relative flex flex-col items-center justify-center w-full h-full min-h-[44px] text-stone-500 hover:text-emerald-800 transition-colors cursor-pointer"
          aria-label="Chat & Messages"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 stroke-[1.8]" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 rtl:-right-auto rtl:-left-2 w-4 h-4 bg-emerald-800 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">
            {lang === 'ar' ? 'الرسائل' : lang === 'fr' ? 'Messages' : 'Chat'}
          </span>
        </button>

        {/* 5. Language & Account Settings Sheet */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center w-full h-full min-h-[44px] text-stone-600 hover:text-emerald-900 transition-colors cursor-pointer"
          aria-label="Language & Settings"
        >
          <div className="relative">
            <Globe className="w-5 h-5 stroke-[1.8] text-stone-600" />
            {(bookingsCount > 0 || favoritesCount > 0) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-700" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-bold text-stone-800">
            {lang === 'ar' ? 'حسابي' : lang === 'fr' ? 'Compte' : 'Profile'}
          </span>
        </button>

      </div>
    </nav>
  );
};
