import React from 'react';
import { Listing, Language, Currency } from '../types';
import { translations } from '../data/translations';
import { X, Heart, Star } from 'lucide-react';
import { ListingCard } from './ListingCard';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Listing[];
  lang: Language;
  currency: Currency;
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onDirectBook: (listing: Listing) => void;
  onShareListing: (listing: Listing) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  lang,
  currency,
  onToggleFavorite,
  onSelectListing,
  onDirectBook,
  onShareListing,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5">
      <div 
        className="relative bg-white rounded-t-3xl sm:rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-t sm:border border-stone-200 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2 sm:hidden shrink-0"></div>

        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-base font-bold text-stone-900">{t.nav.favorites}</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {favorites.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 sm:bg-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6">
          {favorites.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <span className="text-4xl">❤️</span>
              <p className="text-sm font-semibold text-stone-600">
                {lang === 'ar' 
                  ? 'لم تقم بإضافة أي مكان إلى المفضلة بعد. اضغط على رمز القلب لحفظ الأماكن المفضلة لديك.'
                  : lang === 'fr'
                  ? 'Vous n’avez pas encore ajouté de favoris. Cliquez sur le cœur pour enregistrer vos lieux préférés.'
                  : 'You have not added any favorites yet. Tap the heart icon to save places you love.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  lang={lang}
                  currency={currency}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  onSelectListing={(l) => {
                    onClose();
                    onSelectListing(l);
                  }}
                  onDirectBook={(l) => {
                    onClose();
                    onDirectBook(l);
                  }}
                  onShareListing={(l) => {
                    onShareListing(l);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
