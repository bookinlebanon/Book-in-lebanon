import React, { useState } from 'react';
import { Booking, BookingStatus, Language, Currency, User } from '../types';
import { translations, LBP_RATE } from '../data/translations';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  Printer, 
  MessageCircle, 
  Trash2,
  Receipt
} from 'lucide-react';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onCancelBooking: (id: string) => void;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  currentUser: User | null;
  lang: Language;
  currency: Currency;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onCancelBooking,
  onUpdateStatus,
  currentUser,
  lang,
  currency,
}) => {
  const [selectedVoucher, setSelectedVoucher] = useState<Booking | null>(null);
  const [tab, setTab] = useState<'trips' | 'requests'>('trips');

  if (!isOpen) return null;

  const t = translations[lang];
  const myTrips = bookings.filter((b) => b.guestId === currentUser?.id);
  const requests = bookings.filter((b) => b.hostId === currentUser?.id);
  const showTabs = requests.length > 0 || currentUser?.role === 'host';
  const activeTab = showTabs ? tab : 'trips';
  const visible = activeTab === 'trips' ? myTrips : requests;
  const pendingRequests = requests.filter((b) => b.status === 'pending').length;

  const statusStyle: Record<BookingStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    declined: 'bg-stone-200 text-stone-700',
    cancelled: 'bg-rose-100 text-rose-800',
  };
  const statusLabel: Record<BookingStatus, string> = {
    pending: (lang === 'ar' ? 'بانتظار الموافقة' : lang === 'fr' ? 'En attente' : 'Pending'),
    confirmed: t.myBookings.confirmed,
    declined: (lang === 'ar' ? 'مرفوض' : lang === 'fr' ? 'Refusée' : 'Declined'),
    cancelled: t.myBookings.cancelled,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = (b: Booking, toGuest = false) => {
    if (toGuest) {
      const digits = b.guestPhone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${digits}`, '_blank', 'noopener,noreferrer');
      return;
    }
    let text = '';
    if (lang === 'ar') {
      text = encodeURIComponent(
        `🇱🇧 مرحباً، أود مراجعة تفاصيل حجزي رقم ${b.reference} في "${b.listingTitle}" للضيف: ${b.guestName}`
      );
    } else if (lang === 'fr') {
      text = encodeURIComponent(
        `🇱🇧 Bonjour, je souhaite vérifier les détails de ma réservation N° ${b.reference} à "${b.listingTitle}" pour le client : ${b.guestName}`
      );
    } else {
      text = encodeURIComponent(
        `🇱🇧 Hello, I would like to review my reservation #${b.reference} at "${b.listingTitle}" for guest: ${b.guestName}`
      );
    }
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5">
      <div 
        className="relative bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-t sm:border border-stone-200 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2 sm:hidden shrink-0"></div>

        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base font-bold text-stone-900">{t.myBookings.title}</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {visible.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 sm:bg-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showTabs && (
          <div className="p-3 bg-stone-100/70 border-b border-stone-200/80 flex gap-1">
            {(['trips', 'requests'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === key ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {key === 'trips'
                  ? (lang === 'ar' ? 'حجوزاتي كضيف' : lang === 'fr' ? 'Mes voyages' : 'My trips')
                  : (lang === 'ar' ? 'طلبات على إعلاناتي' : lang === 'fr' ? 'Demandes reçues' : 'Requests for my listings')}
                {key === 'requests' && pendingRequests > 0 && (
                  <span className="ms-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">{pendingRequests}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {visible.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <span className="text-4xl">🇱🇧</span>
              <h3 className="text-sm font-bold text-stone-800">{t.myBookings.emptyState}</h3>
            </div>
          ) : (
            visible.map((booking) => {
              const isHostView = activeTab === 'requests';
              const canCancel = booking.status === 'confirmed' || (!isHostView && booking.status === 'pending');
              return (
                <div
                  key={booking.id}
                  className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {booking.listingImage && (
                        <img
                          src={booking.listingImage}
                          alt={booking.listingTitle}
                          className="w-14 h-14 sm:w-16 sm:h-14 object-cover rounded-lg shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono font-bold text-emerald-900 shrink-0">
                            {booking.reference}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${statusStyle[booking.status]}`}>
                            {statusLabel[booking.status]}
                          </span>
                          {booking.paymentMethod && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 shrink-0">
                              {booking.paymentMethod === 'whish_pay' && '🔴 Whish Pay'}
                              {booking.paymentMethod === 'omt_pay' && '🔵 OMT Pay'}
                              {booking.paymentMethod === 'cash_on_arrival' && '💵 نقداً / Cash'}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">{booking.listingTitle}</h4>
                        <span className="text-xs text-stone-500 truncate block">{booking.city}</span>
                      </div>
                    </div>

                    <div className="text-right rtl:text-left shrink-0">
                      <span className="text-sm font-extrabold text-stone-900 tabular-nums block">
                        ${booking.totalUSD}
                      </span>
                      <span className="text-[11px] text-stone-500 tabular-nums">
                        {booking.totalLBP.toLocaleString()} {lang === 'ar' ? 'ل.ل' : lang === 'fr' ? 'LL' : 'L.L.'}
                      </span>
                    </div>
                  </div>

                  {/* Booking details metadata */}
                  <div className="flex items-center gap-4 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        {booking.checkInDate}
                        {booking.checkOutDate ? ` → ${booking.checkOutDate}` : ` @ ${booking.reservationTime}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span>{booking.guestsCount} {t.detail.guests}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <span>👤 {booking.guestName}</span>
                      {isHostView && (
                        <a href={`tel:${booking.guestPhone}`} className="font-mono text-emerald-800 font-semibold" dir="ltr">
                          {booking.guestPhone}
                        </a>
                      )}
                    </div>
                    {booking.notes && <div className="w-full text-stone-500">📝 {booking.notes}</div>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleWhatsApp(booking, activeTab === 'requests')}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isHostView && booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(booking.id, 'declined')}
                            className="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                          >
                            {(lang === 'ar' ? 'رفض' : lang === 'fr' ? 'Refuser' : 'Decline')}
                          </button>
                          <button
                            onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                            className="px-3 py-1 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors"
                          >
                            {(lang === 'ar' ? 'قبول' : lang === 'fr' ? 'Accepter' : 'Accept')}
                          </button>
                        </>
                      )}
                      {canCancel && (
                        <button
                          onClick={() => {
                            if (window.confirm(t.myBookings.cancelConfirm)) {
                              onCancelBooking(booking.id);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          {t.myBookings.cancelBooking}
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSelectedVoucher(booking)}
                        className="px-3 py-1 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                      >
                        {t.myBookings.viewVoucher}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Voucher Detail Modal Overlay */}
        {selectedVoucher && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-stone-200">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇱🇧</span>
                  <span className="font-extrabold text-sm text-stone-900">
                    {lang === 'ar' ? 'إيصال حجز معتمد' : lang === 'fr' ? 'Bon de réservation officiel' : 'Official Booking Voucher'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-mono font-bold text-emerald-900">
                  <span>{t.booking.bookingRef}:</span>
                  <span>{selectedVoucher.reference}</span>
                </div>
                <div className="font-bold text-stone-900 text-sm">{selectedVoucher.listingTitle}</div>
                <div>{t.booking.fullName}: <span className="font-semibold">{selectedVoucher.guestName}</span></div>
                <div>{t.booking.phone}: <span className="font-semibold font-mono">{selectedVoucher.guestPhone}</span></div>
                <div>{t.booking.checkIn}: <span className="font-semibold">{selectedVoucher.checkInDate}</span></div>
                {selectedVoucher.checkOutDate && (
                  <div>{t.booking.checkOut}: <span className="font-semibold">{selectedVoucher.checkOutDate}</span></div>
                )}
                <div className="pt-2 border-t font-bold text-sm text-stone-900 flex justify-between">
                  <span>{t.booking.totalUSD}:</span>
                  <span>
                    ${selectedVoucher.totalUSD} ({selectedVoucher.totalLBP.toLocaleString()} {lang === 'ar' ? 'ل.ل' : lang === 'fr' ? 'LL' : 'L.L.'})
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-2 rounded-lg border border-stone-300 text-xs font-semibold hover:bg-stone-50 flex items-center justify-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.booking.printVoucher}</span>
                </button>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="flex-1 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
                >
                  {t.detail.close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
