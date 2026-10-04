import React, { useState } from 'react';
import { Listing, Booking, Language, Currency } from '../types';
import { LBP_RATE } from '../data/translations';
import { 
  X, 
  ShieldAlert, 
  Building2, 
  CalendarCheck, 
  DollarSign, 
  Users, 
  Star, 
  CheckCircle2, 
  Trash2, 
  Send, 
  Search, 
  ExternalLink,
  MessageCircle,
  Sparkles
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  listings: Listing[];
  bookings: Booking[];
  onToggleFeatured: (listingId: string) => void;
  onToggleVerifiedHost: (listingId: string) => void;
  onDeleteListing: (listingId: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onBroadcastNotification: (title: string, message: string) => void;
  onShowToast: (msg: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  listings,
  bookings,
  onToggleFeatured,
  onToggleVerifiedHost,
  onDeleteListing,
  onCancelBooking,
  onBroadcastNotification,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings' | 'broadcast'>('listings');
  const [searchQuery, setSearchQuery] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  if (!isOpen) return null;

  // Key KPI stats
  const totalRevenueUSD = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalUSD, 0);

  const verifiedHostsCount = listings.filter((l) => l.host.verified).length;

  const filteredListings = listings.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.title.ar.toLowerCase().includes(q) ||
      l.title.en.toLowerCase().includes(q) ||
      l.host.name.toLowerCase().includes(q) ||
      l.city.ar.toLowerCase().includes(q)
    );
  });

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    onBroadcastNotification(broadcastTitle, broadcastMessage);
    onShowToast(
      lang === 'ar' 
        ? 'تم إرسال الإشعار لجميع زوار المنصة بنجاح!' 
        : lang === 'fr' 
        ? 'Notification diffusée avec succès !' 
        : 'Broadcast notification sent successfully!'
    );
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Admin Panel Header */}
        <div className="p-4 sm:p-6 bg-stone-900 text-white flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/40 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  {lang === 'ar' ? 'لوحة تحكم المشرف العام' : lang === 'fr' ? 'Tableau d’administration' : 'Admin Management Panel'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {lang === 'ar' ? 'صلاحيات كاملة' : lang === 'fr' ? 'Administrateur' : 'Super Admin'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {lang === 'ar' ? 'إدارة العقارات، الحجوزات، المضيفين وتنبيهات المنصة' : lang === 'fr' ? 'Gestion des annonces, réservations et diffusions' : 'Manage listings, direct bookings, hosts & announcements'}
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

        {/* Top KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-stone-50 border-b border-stone-200 shrink-0">
          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold mb-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-800" />
              <span>{lang === 'ar' ? 'إجمالي الأماكن' : lang === 'fr' ? 'Total des annonces' : 'Total Listings'}</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-stone-900 font-mono">
              {listings.length}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold mb-1">
              <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'ar' ? 'الحجوزات المباشرة' : lang === 'fr' ? 'Réservations directes' : 'Direct Bookings'}</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-stone-900 font-mono">
              {bookings.length}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold mb-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'ar' ? 'قيمة الحجوزات' : lang === 'fr' ? 'Volume des réservations' : 'Booking Volume'}</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-emerald-900 font-mono">
              ${totalRevenueUSD.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold mb-1">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>{lang === 'ar' ? 'مضيفون موثقون' : lang === 'fr' ? 'Hôtes vérifiés' : 'Verified Hosts'}</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-stone-900 font-mono">
              {verifiedHostsCount}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 border-b border-stone-200 flex gap-4 shrink-0 bg-white">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'listings'
                ? 'border-emerald-800 text-emerald-950 font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {lang === 'ar' ? 'إدارة العقارات والأماكن' : lang === 'fr' ? 'Gestion des annonces' : 'Listings Management'} ({listings.length})
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'bookings'
                ? 'border-emerald-800 text-emerald-950 font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {lang === 'ar' ? 'سجل الحجوزات' : lang === 'fr' ? 'Registre des réservations' : 'Bookings Register'} ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'broadcast'
                ? 'border-emerald-800 text-emerald-950 font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {lang === 'ar' ? 'إرسال إشعار عام' : lang === 'fr' ? 'Diffuser une alerte' : 'Broadcast Alerts'}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-4">
          {/* TAB 1: Listings Management */}
          {activeTab === 'listings' && (
            <div className="space-y-3">
              {/* Search filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'ar' ? 'بحث باسم الإعلان، المضيف، أو البلدة...' : lang === 'fr' ? 'Rechercher par titre, hôte ou ville...' : 'Search listings by title, host or city...'}
                  className="w-full text-xs p-2.5 pl-9 rtl:pl-2.5 rtl:pr-9 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="space-y-2">
                {filteredListings.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 sm:p-4 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 transition-all flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.images[0]}
                        alt={item.title[lang] || item.title.ar}
                        className="w-16 h-14 object-cover rounded-xl shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                            {item.title[lang] || item.title.ar}
                          </h4>
                          {item.featured && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                              ★ {lang === 'ar' ? 'مميز' : lang === 'fr' ? 'Recommandé' : 'Featured'}
                            </span>
                          )}
                          {item.isUserListing && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                              {lang === 'ar' ? 'إعلان مستخدم' : lang === 'fr' ? 'Annonce membre' : 'User Ad'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">
                          {item.city[lang] || item.city.ar} · {item.host.name} ({item.host.phone})
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="text-xs font-bold text-emerald-900 tabular-nums">
                            ${item.priceUSD} / {item.priceUnit}
                          </span>
                          <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                            📷 {item.images.length} {lang === 'ar' ? 'صور' : 'photos'}
                          </span>
                          {item.videos && item.videos.length > 0 && (
                            <span className="text-[10px] font-bold text-purple-800 bg-purple-100/70 px-1.5 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                              🎥 {item.videos.length} {lang === 'ar' ? 'فيديو' : 'video'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Action Buttons for Listing */}
                    <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                      {/* Direct WhatsApp Contact with Host */}
                      <a
                        href={`https://wa.me/${item.host.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200/80"
                        title={lang === 'ar' ? 'مراسلة المضيف عبر واتساب' : lang === 'fr' ? 'WhatsApp hôte' : 'WhatsApp Host'}
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                      </a>

                      {/* Toggle Featured */}
                      <button
                        onClick={() => onToggleFeatured(item.id)}
                        className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          item.featured
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {item.featured 
                          ? (lang === 'ar' ? 'إلغاء التمييز' : lang === 'fr' ? 'Retirer' : 'Unfeature') 
                          : (lang === 'ar' ? 'تمييز الإعلان' : lang === 'fr' ? 'Mettre en avant' : 'Feature')}
                      </button>

                      {/* Toggle Verified Host */}
                      <button
                        onClick={() => onToggleVerifiedHost(item.id)}
                        className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          item.host.verified
                            ? 'bg-purple-50 border-purple-300 text-purple-800'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        {item.host.verified 
                          ? (lang === 'ar' ? 'مضيف موثق ✓' : lang === 'fr' ? 'Vérifié ✓' : 'Verified ✓') 
                          : (lang === 'ar' ? 'توثيق المضيف' : lang === 'fr' ? 'Vérifier' : 'Verify')}
                      </button>

                      {/* Delete Listing */}
                      <button
                        onClick={() => onDeleteListing(item.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title={lang === 'ar' ? 'حذف الإعلان' : lang === 'fr' ? 'Supprimer l’annonce' : 'Delete listing'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Bookings Management */}
          {activeTab === 'bookings' && (
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <span className="text-3xl">📅</span>
                  <p className="text-xs font-semibold text-stone-500">
                    {lang === 'ar' ? 'لا توجد حجوزات مسجلة بعد' : lang === 'fr' ? 'Aucune réservation enregistrée' : 'No bookings in the system yet'}
                  </p>
                </div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white space-y-2.5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-stone-400 block">
                          #{b.id}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900">
                          {b.listingTitle} ({b.city})
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status === 'confirmed' 
                            ? (lang === 'ar' ? 'حجز مؤكد' : lang === 'fr' ? 'Confirmé' : 'Confirmed') 
                            : (lang === 'ar' ? 'ملغى' : lang === 'fr' ? 'Annulé' : 'Cancelled')}
                        </span>
                        <span className="text-sm font-black text-stone-900 font-mono">
                          ${b.totalUSD} {lang === 'ar' ? 'دولار' : 'USD'}
                        </span>
                      </div>
                    </div>

                    {/* Guest details & direct WhatsApp */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-stone-50 rounded-xl text-xs">
                      <div>
                        <span className="text-[11px] text-stone-400 block">{lang === 'ar' ? 'الضيف' : lang === 'fr' ? 'Client' : 'Guest'}</span>
                        <span className="font-bold text-stone-800">{b.guestName}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400 block">{lang === 'ar' ? 'التواريخ' : lang === 'fr' ? 'Dates' : 'Dates'}</span>
                        <span className="font-medium text-stone-700">{b.checkInDate} ({b.nightsCount} {lang === 'ar' ? 'ليالٍ' : lang === 'fr' ? 'nuits' : 'nights'})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-stone-400 block">{lang === 'ar' ? 'واتساب الضيف' : lang === 'fr' ? 'WhatsApp client' : 'WhatsApp'}</span>
                          <span className="font-mono text-stone-700">{b.guestPhone}</span>
                        </div>
                        <a
                          href={`https://wa.me/${b.guestPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-[#25D366] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                        </a>
                      </div>
                    </div>

                    {/* Booking actions */}
                    {b.status === 'confirmed' && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => onCancelBooking(b.id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                        >
                          {lang === 'ar' ? 'إلغاء الحجز من الإدارة' : lang === 'fr' ? 'Annuler la réservation' : 'Cancel booking from admin'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Broadcast Notification */}
          {activeTab === 'broadcast' && (
            <div className="max-w-xl mx-auto p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-sm text-stone-900">
                  {lang === 'ar' ? 'إرسال تنبيه أو إشعار لجميع زوار المنصة' : lang === 'fr' ? 'Diffuser une notification' : 'Broadcast Platform Notification'}
                </h4>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'ar' ? 'عنوان الإشعار' : lang === 'fr' ? 'Titre de l’alerte' : 'Notification Title'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: بدأ موسم الثلج في فاريا والأرز! ❄️' : lang === 'fr' ? 'Ex: La saison de ski est ouverte ! ❄️' : 'e.g. Ski season in Faraya & Cedars is open! ❄️'}
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'ar' ? 'نص وتفاصيل الإشعار' : lang === 'fr' ? 'Message de l’alerte' : 'Notification Message'} *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder={lang === 'ar' ? 'استمتع بأجمل العطلات الشتوية في شاليهات لبنان مع حجز مباشر عبر واتساب...' : lang === 'fr' ? 'Profitez des meilleurs séjours hivernaux avec réservation directe...' : 'Enjoy authentic Lebanese winter stays with direct WhatsApp booking...'}
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'بث الإشعار الآن لكافة المستخدمين' : lang === 'fr' ? 'Diffuser à tous les utilisateurs' : 'Send Broadcast to All Users'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
