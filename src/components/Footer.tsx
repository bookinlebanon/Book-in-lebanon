import React from 'react';
import { Language, Category } from '../types';
import { translations } from '../data/translations';
import { ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

interface FooterProps {
  lang: Language;
  onSelectCategory: (cat: Category) => void;
  onOpenPostAd: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onSelectCategory,
  onOpenPostAd,
}) => {
  const t = translations[lang];

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center text-sm">
                🇱🇧
              </span>
              <span className="text-lg font-bold text-white tracking-tight">
                Book in Lebanon
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t.footer.aboutText}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                {lang === 'ar' 
                  ? 'حجوزات مباشرة وموثقة 100%' 
                  : lang === 'fr' 
                  ? '100% Réservations directes et vérifiées' 
                  : '100% Direct & Verified Bookings'}
              </span>
            </div>
          </div>

          {/* Quick Category Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.footer.fastLinks}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onSelectCategory('chalet')}
                  className="hover:text-white transition-colors"
                >
                  {t.categories.chalet}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('guesthouse')}
                  className="hover:text-white transition-colors"
                >
                  {t.categories.guesthouse}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('studio')}
                  className="hover:text-white transition-colors"
                >
                  {t.categories.studio}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('restaurant')}
                  className="hover:text-white transition-colors"
                >
                  {t.categories.restaurant}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('hotel')}
                  className="hover:text-white transition-colors"
                >
                  {t.categories.hotel}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('real_estate')}
                  className="hover:text-white transition-colors"
                >
                  {t.categories.real_estate}
                </button>
              </li>
            </ul>
          </div>

          {/* Lebanese Regions */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'ar' ? 'مناطق الاستجمام والإقامة' : lang === 'fr' ? 'Destinations au Liban' : 'Lebanon Destinations'}
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>{t.regions.keserwan}</li>
              <li>{t.regions.jbeil}</li>
              <li>{t.regions.batroun}</li>
              <li>{t.regions.ehden_cedars}</li>
              <li>{t.regions.matn}</li>
              <li>{t.regions.chouf_aley}</li>
              <li>{t.regions.tyre_south}</li>
              <li>{t.regions.sidon_jezzine}</li>
              <li>{t.regions.zahle_bekaa}</li>
              <li>{t.regions.baalbek_hermel}</li>
            </ul>
          </div>

          {/* Owners & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.footer.contact}
            </h4>
            <p className="text-xs text-stone-400">
              {lang === 'ar' 
                ? 'هل تملك شاليه، بيت ضيافة، استوديو أو مطعماً في لبنان؟ اعرضه الآن مجاناً.'
                : lang === 'fr'
                ? 'Vous possédez un chalet, une maison d’hôtes ou un restaurant au Liban ? Publiez-le gratuitement.'
                : 'Do you own a chalet, guest house, studio, or restaurant in Lebanon? List it directly.'}
            </p>
            <button
              onClick={onOpenPostAd}
              className="px-3.5 py-2 text-xs font-semibold text-stone-900 bg-amber-300 hover:bg-amber-200 rounded-lg transition-colors shadow-xs"
            >
              {t.postAd.button}
            </button>
          </div>

        </div>

        {/* Quiet Bottom Line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <span>{t.footer.rights}</span>
          <span className="text-stone-400 font-medium">{t.footer.lebanonPride}</span>
        </div>

      </div>
    </footer>
  );
};
