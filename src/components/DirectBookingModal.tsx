import React, { useState, useEffect, useMemo } from 'react';
import { Listing, Language, Booking, PaymentMethod, User } from '../types';
import { translations, LBP_RATE } from '../data/translations';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Printer, 
  MessageCircle, 
  Share2, 
  Sparkles,
  CreditCard,
  QrCode,
  Smartphone,
  Banknote,
  Lock,
  Copy,
  Check,
  Building2,
  ExternalLink
} from 'lucide-react';
import { BookingCalendarPicker } from './BookingCalendarPicker';

interface DirectBookingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onConfirmBooking: (booking: Booking) => Promise<Booking | null>;
  existingBookings?: Booking[];
  currentUser?: User | null;
}

export const DirectBookingModal: React.FC<DirectBookingModalProps> = ({
  listing,
  isOpen,
  onClose,
  lang,
  onConfirmBooking,
  existingBookings = [],
  currentUser,
}) => {
  // Dates defaults: today + tomorrow
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [reservationTime, setReservationTime] = useState('20:00');
  const [guestsCount, setGuestsCount] = useState(2);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+961 ');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Payment Options State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_arrival');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Cards Form State

  // Whish Pay & OMT Pay State
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Dynamic reference code for payment
  const [txnRefCode] = useState(() => `BIL-${Math.floor(100000 + Math.random() * 900000)}`);

  // Confirmation view state
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Prefill guest details from the signed-in account
  useEffect(() => {
    if (!isOpen || !currentUser) return;
    setFullName((prev) => prev || currentUser.name);
    setEmail((prev) => prev || currentUser.email);
    setPhone((prev) => (prev.trim() && prev.trim() !== '+961' ? prev : currentUser.phone || prev));
  }, [isOpen, currentUser]);

  const t = translations[lang];
  const isRestaurant = listing?.category === 'restaurant';
  const localizedTitle = listing ? (listing.title[lang] || listing.title.en || listing.title.ar) : '';
  const localizedCity = listing ? (listing.city[lang] || listing.city.en || listing.city.ar) : '';

  // Compile all booked dates for this listing (both from confirmed bookings and listing's reserved dates)
  const propertyBookedDates = useMemo(() => {
    if (!listing) return [];
    const datesSet = new Set<string>(listing.bookedDates || []);
    
    // Add dates from confirmed bookings for this listing
    if (existingBookings && existingBookings.length > 0) {
      existingBookings
        .filter(b => b.listingId === listing.id && b.status === 'confirmed')
        .forEach(b => {
          if (b.checkInDate) {
            const start = new Date(b.checkInDate);
            const end = b.checkOutDate ? new Date(b.checkOutDate) : new Date(start);
            const curr = new Date(start);
            while (curr <= end) {
              datesSet.add(curr.toISOString().split('T')[0]);
              curr.setDate(curr.getDate() + 1);
            }
          }
        });
    }

    return Array.from(datesSet);
  }, [listing, existingBookings]);

  // Adjust initial date to next available day if today is booked
  useEffect(() => {
    if (isOpen && propertyBookedDates.length > 0) {
      if (propertyBookedDates.includes(checkInDate)) {
        const nextAvail = new Date();
        while (propertyBookedDates.includes(nextAvail.toISOString().split('T')[0])) {
          nextAvail.setDate(nextAvail.getDate() + 1);
        }
        const availIn = nextAvail.toISOString().split('T')[0];
        const nextOut = new Date(nextAvail);
        nextOut.setDate(nextAvail.getDate() + 2);
        while (propertyBookedDates.includes(nextOut.toISOString().split('T')[0])) {
          nextOut.setDate(nextOut.getDate() + 1);
        }
        setCheckInDate(availIn);
        setCheckOutDate(nextOut.toISOString().split('T')[0]);
      }
    }
  }, [isOpen, propertyBookedDates]);

  // Check if current selection has any conflict with booked dates
  const isSelectedDateConflict = useMemo(() => {
    if (!checkInDate) return false;
    if (propertyBookedDates.includes(checkInDate)) return true;
    if (!isRestaurant && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const curr = new Date(start);
      curr.setDate(curr.getDate() + 1);
      while (curr < end) {
        if (propertyBookedDates.includes(curr.toISOString().split('T')[0])) {
          return true;
        }
        curr.setDate(curr.getDate() + 1);
      }
    }
    return false;
  }, [checkInDate, checkOutDate, isRestaurant, propertyBookedDates]);

  // Calculate nights
  const calculateNights = () => {
    if (isRestaurant) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();

  // Pricing calculations
  const subtotalUSD = listing 
    ? (isRestaurant ? listing.priceUSD * guestsCount : listing.priceUSD * nights)
    : 0;
  const serviceFeeUSD = isRestaurant ? 0 : 15;
  const totalUSD = subtotalUSD + serviceFeeUSD;
  const totalLBP = totalUSD * LBP_RATE;


  if (!isOpen || !listing) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim() || isSubmitting) return;

    let paymentRef = txnRefCode;
    if (paymentMethod === 'whish_pay') paymentRef = `WHISH-${txnRefCode}`;
    if (paymentMethod === 'omt_pay') paymentRef = `OMT-${txnRefCode}`;
    if (paymentMethod === 'cards') paymentRef = `CARD-${txnRefCode}`;
    if (paymentMethod === 'cash_on_arrival') paymentRef = `CASH-${txnRefCode}`;

    const newBooking: Booking = {
      id: txnRefCode,
      reference: txnRefCode,
      listingId: listing.id,
      listingTitle: localizedTitle,
      listingImage: listing.images[0] || '',
      category: listing.category,
      city: localizedCity,
      guestName: fullName.trim(),
      guestPhone: phone.trim(),
      guestEmail: email.trim(),
      checkInDate,
      checkOutDate: isRestaurant ? undefined : checkOutDate,
      reservationTime: isRestaurant ? reservationTime : undefined,
      guestsCount,
      nightsCount: nights,
      pricePerNightUSD: listing.priceUSD,
      subtotalUSD,
      serviceFeeUSD,
      totalUSD,
      totalLBP,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_arrival' ? 'cash' : 'pending',
      paymentReference: paymentRef,
      notes: notes.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    const saved = await onConfirmBooking(newBooking);
    setIsSubmitting(false);
    if (saved) setConfirmedBooking(saved);
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'whish_pay':
        return t.booking.whishPay;
      case 'omt_pay':
        return t.booking.omtPay;
      case 'cards':
        return t.booking.cards;
      case 'cash_on_arrival':
      default:
        return t.booking.cashOnArrival;
    }
  };

  const handleShareWhatsApp = (booking: Booking) => {
    const hostPhone = listing.host.whatsapp.replace(/[^0-9]/g, '');
    const payLabel = getPaymentMethodLabel(booking.paymentMethod || 'cards');
    let text = '';
    if (lang === 'ar') {
      text = encodeURIComponent(
        `🇱🇧 *حجز مباشر عبر منصة Book in Lebanon*\n` +
        `رقم الحجز: ${booking.id}\n` +
        `طريقة الدفع: ${payLabel} (${booking.paymentReference})\n` +
        `المكان: ${booking.listingTitle}\n` +
        `الاسم: ${booking.guestName}\n` +
        `التاريخ: ${booking.checkInDate}${booking.checkOutDate ? ` إلى ${booking.checkOutDate}` : ` الساعة ${booking.reservationTime}`}\n` +
        `الضيوف: ${booking.guestsCount}\n` +
        `المبلغ الإجمالي: $${booking.totalUSD} (${booking.totalLBP.toLocaleString()} ل.ل)\n` +
        `ملاحظات: ${booking.notes || 'لا يوجد'}`
      );
    } else if (lang === 'fr') {
      text = encodeURIComponent(
        `🇱🇧 *Réservation directe via Book in Lebanon*\n` +
        `N° Réservation: ${booking.id}\n` +
        `Paiement: ${payLabel} (${booking.paymentReference})\n` +
        `Lieu: ${booking.listingTitle}\n` +
        `Nom: ${booking.guestName}\n` +
        `Date: ${booking.checkInDate}${booking.checkOutDate ? ` au ${booking.checkOutDate}` : ` à ${booking.reservationTime}`}\n` +
        `Personnes: ${booking.guestsCount}\n` +
        `Montant Total: $${booking.totalUSD} (${booking.totalLBP.toLocaleString()} LL)\n` +
        `Remarques: ${booking.notes || 'Aucune'}`
      );
    } else {
      text = encodeURIComponent(
        `🇱🇧 *Direct Booking via Book in Lebanon*\n` +
        `Booking Ref: ${booking.id}\n` +
        `Payment: ${payLabel} (${booking.paymentReference})\n` +
        `Venue: ${booking.listingTitle}\n` +
        `Guest: ${booking.guestName}\n` +
        `Dates: ${booking.checkInDate}${booking.checkOutDate ? ` to ${booking.checkOutDate}` : ` at ${booking.reservationTime}`}\n` +
        `Guests: ${booking.guestsCount}\n` +
        `Total Amount: $${booking.totalUSD} (${booking.totalLBP.toLocaleString()} L.L.)\n` +
        `Notes: ${booking.notes || 'None'}`
      );
    }
    window.open(`https://wa.me/${hostPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5">
      <div 
        className="relative bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border-t sm:border border-stone-200 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2 sm:hidden shrink-0"></div>

        {/* Modal Top Bar */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <h2 className="text-base font-bold text-stone-900">
              {isRestaurant ? t.booking.restaurantTitle : t.booking.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-stone-100 sm:bg-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBooking ? (
          /* Confirmation & Voucher View */
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-extrabold text-stone-900">
                {(lang === 'ar' ? 'تم إرسال طلب الحجز!' : lang === 'fr' ? 'Demande envoyée !' : 'Booking request sent!')}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {(lang === 'ar' ? 'المضيف سيراجع طلبك ويؤكده. ستجد حالة الطلب في حجوزاتي.' : lang === 'fr' ? 'L’hôte va examiner votre demande. Suivez-la dans Mes réservations.' : 'The host will review your request. Track it in My Bookings.')}
              </p>
            </div>

            {/* Official Digital Voucher Card */}
            <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/70 space-y-3.5 print:border-black">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <span className="text-[11px] text-stone-400 uppercase font-semibold block">
                    {t.booking.bookingRef}
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-900 tracking-wider">
                    {confirmedBooking.reference}
                  </span>
                </div>
                <div className="text-right rtl:text-left flex flex-col items-end rtl:items-start gap-1">
                  <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500 text-white rounded-md">
                    {(lang === 'ar' ? 'بانتظار موافقة المضيف' : lang === 'fr' ? 'En attente de l’hôte' : 'Awaiting host approval')}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-sm">{confirmedBooking.listingTitle}</h4>
                <p className="text-xs text-stone-500">{confirmedBooking.city}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-stone-200/80">
                <div>
                  <span className="text-stone-400 block">{t.booking.fullName}</span>
                  <span className="font-semibold text-stone-800">{confirmedBooking.guestName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">{t.booking.guestsCount}</span>
                  <span className="font-semibold text-stone-800">{confirmedBooking.guestsCount} {t.detail.guests}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">
                    {isRestaurant ? t.booking.reservationDate : t.booking.checkIn}
                  </span>
                  <span className="font-semibold text-stone-800">{confirmedBooking.checkInDate}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">
                    {isRestaurant ? t.booking.reservationTime : t.booking.checkOut}
                  </span>
                  <span className="font-semibold text-stone-800">
                    {isRestaurant ? confirmedBooking.reservationTime : confirmedBooking.checkOutDate}
                  </span>
                </div>
              </div>

              {/* Payment Method Used Banner */}
              <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {confirmedBooking.paymentMethod === 'whish_pay' && (
                    <span className="w-6 h-6 rounded-md bg-[#E11D48] text-white flex items-center justify-center text-[10px] font-black">W</span>
                  )}
                  {confirmedBooking.paymentMethod === 'omt_pay' && (
                    <span className="w-6 h-6 rounded-md bg-[#0284C7] text-white flex items-center justify-center text-[10px] font-black">OMT</span>
                  )}
                  {confirmedBooking.paymentMethod === 'cards' && (
                    <span className="w-6 h-6 rounded-md bg-stone-900 text-white flex items-center justify-center text-[10px] font-black">💳</span>
                  )}
                  {confirmedBooking.paymentMethod === 'cash_on_arrival' && (
                    <span className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black">💵</span>
                  )}
                  <div>
                    <span className="text-[10px] text-stone-400 block">{t.booking.paymentMethod}</span>
                    <span className="font-bold text-stone-800">
                      {getPaymentMethodLabel(confirmedBooking.paymentMethod || 'cards')}
                    </span>
                  </div>
                </div>
                <div className="text-right rtl:text-left font-mono text-[11px] text-stone-600 font-semibold">
                  {confirmedBooking.paymentReference}
                </div>
              </div>

              {/* Total Row */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-stone-600">{t.booking.totalUSD}</span>
                <div className="text-right rtl:text-left">
                  <span className="text-base font-extrabold text-stone-900 tabular-nums">
                    ${confirmedBooking.totalUSD}
                  </span>
                  <span className="block text-[11px] text-stone-500 font-medium tabular-nums">
                    {confirmedBooking.totalLBP.toLocaleString()} {lang === 'ar' ? 'ل.ل' : lang === 'fr' ? 'LL' : 'L.L.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleShareWhatsApp(confirmedBooking)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-xs transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{t.booking.sendWhatsApp}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.booking.printVoucher}</span>
                </button>

                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
                >
                  {t.booking.done}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
            {/* Listing snippet */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
              <img
                src={listing.images[0]}
                alt={localizedTitle}
                className="w-16 h-14 object-cover rounded-lg shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                  {localizedTitle}
                </h3>
                <span className="text-xs text-stone-500 block">{localizedCity}</span>
                <span className="text-xs font-bold text-emerald-900 tabular-nums">
                  ${listing.priceUSD} / {isRestaurant ? t.card.person : t.card.night}
                </span>
              </div>
            </div>

            {/* Interactive Calendar Date Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-800" />
                  <span>
                    {isRestaurant
                      ? (lang === 'ar' ? 'تحديد تاريخ الحضور' : lang === 'fr' ? 'Date de réservation' : 'Select Reservation Date')
                      : (lang === 'ar' ? 'تواريخ الحجز (الوصول والمغادرة)' : lang === 'fr' ? 'Dates de séjour (Arrivée & Départ)' : 'Stay Dates (Check-In & Check-Out)')}
                  </span>
                </label>
                <span className="text-[11px] text-stone-500 font-medium">
                  {lang === 'ar' 
                    ? (isRestaurant ? 'اختر اليوم المطلوب' : 'اختر تاريخ الوصول ثم المغادرة') 
                    : lang === 'fr'
                    ? (isRestaurant ? 'Choisissez le jour' : 'Arrivée puis Départ')
                    : (isRestaurant ? 'Choose date' : 'Pick check-in then check-out')}
                </span>
              </div>

              <BookingCalendarPicker
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                isSingleDate={isRestaurant}
                lang={lang}
                bookedDates={propertyBookedDates}
                pricePerNight={listing.priceUSD}
                onDatesChange={(newCheckIn, newCheckOut) => {
                  setCheckInDate(newCheckIn);
                  if (newCheckOut) {
                    setCheckOutDate(newCheckOut);
                  }
                }}
                onSingleDateChange={(date) => {
                  setCheckInDate(date);
                }}
              />
            </div>

            {/* Restaurant Time Selection */}
            {isRestaurant && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-800" />
                  <span>{t.booking.reservationTime}</span>
                </label>
                <select
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 bg-white"
                >
                  <option value="12:30">12:30 PM (الغداء)</option>
                  <option value="13:30">01:30 PM (الغداء)</option>
                  <option value="14:30">02:30 PM (الغداء)</option>
                  <option value="19:30">07:30 PM (العشاء)</option>
                  <option value="20:30">08:30 PM (العشاء)</option>
                  <option value="21:30">09:30 PM (العشاء)</option>
                  <option value="22:30">10:30 PM (العشاء)</option>
                </select>
              </div>
            )}

            {/* Guests Count Input */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-800" />
                  <span>{t.booking.guestsCount}</span>
                </span>
                {listing.maxGuests && (
                  <span className="text-[11px] text-stone-400 font-normal">
                    {t.detail.capacity}: {listing.maxGuests} {t.detail.guests}
                  </span>
                )}
              </label>

              <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden w-36">
                <button
                  type="button"
                  onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                  className="w-10 h-9 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <div className="flex-1 text-center font-bold text-xs tabular-nums text-stone-800">
                  {guestsCount}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (listing.maxGuests && guestsCount >= listing.maxGuests) return;
                    setGuestsCount(guestsCount + 1);
                  }}
                  className="w-10 h-9 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Guest Personal Info */}
            <div className="border-t border-stone-200 pt-4 space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                {t.booking.guestDetails}
              </h3>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  {t.booking.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jean Khoury"
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    {t.booking.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+961 70 123 456"
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    {t.booking.email} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  {t.booking.specialRequests}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'وصول متأخر، سرير أطفال، طاولة هادئة، طلبات خاصة...'
                      : lang === 'fr'
                      ? 'Arrivée tardive, lit bébé, table calme, demandes spécifiques...'
                      : 'Late check-in, baby cot, quiet table, special requests...'
                  }
                  className="w-full text-xs p-2 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            {/* Payment Options Section (Cards, Whish Pay, OMT Pay, Cash) */}
            <div className="border-t border-stone-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-800" />
                  <span>{t.booking.paymentMethod}</span>
                </h3>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {t.booking.paymentMethodSelect}
                </span>
              </div>

              {/* 4 Interactive Payment Method Cards */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* 2. Whish Pay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('whish_pay')}
                  className={`p-3 rounded-xl border text-left rtl:text-right flex flex-col justify-between transition-all ${
                    paymentMethod === 'whish_pay'
                      ? 'border-[#E11D48] bg-rose-50/70 ring-1 ring-[#E11D48] shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="w-5 h-5 rounded-md bg-[#E11D48] text-white flex items-center justify-center font-black text-[10px]">
                      W
                    </span>
                    <span className="text-[9px] font-extrabold text-[#E11D48] bg-rose-100 px-1.5 py-0.5 rounded-full">
                      Whish Money
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 leading-tight">
                      Whish Pay
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                      {lang === 'ar' ? 'محفظة ويش ورمز QR' : 'Whish App & QR'}
                    </p>
                  </div>
                </button>

                {/* 3. OMT Pay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('omt_pay')}
                  className={`p-3 rounded-xl border text-left rtl:text-right flex flex-col justify-between transition-all ${
                    paymentMethod === 'omt_pay'
                      ? 'border-[#0284C7] bg-sky-50/70 ring-1 ring-[#0284C7] shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="w-5 h-5 rounded-md bg-[#0284C7] text-white flex items-center justify-center font-black text-[9px]">
                      OMT
                    </span>
                    <span className="text-[9px] font-extrabold text-[#0284C7] bg-sky-100 px-1.5 py-0.5 rounded-full">
                      1,400+ Branches
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 leading-tight">
                      OMT Pay
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                      {lang === 'ar' ? 'تطبيق OMT وفروع لبنان' : 'OMT App & Agents'}
                    </p>
                  </div>
                </button>

                {/* 4. Cash on Arrival */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_arrival')}
                  className={`p-3 rounded-xl border text-left rtl:text-right flex flex-col justify-between transition-all ${
                    paymentMethod === 'cash_on_arrival'
                      ? 'border-emerald-800 bg-emerald-50/70 ring-1 ring-emerald-800 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-base font-bold">💵</span>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      {lang === 'ar' ? 'كاش' : 'Cash'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 leading-tight">
                      {t.booking.cashOnArrival}
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                      {lang === 'ar' ? 'عند استلام المفاتيح' : 'Pay at check-in'}
                    </p>
                  </div>
                </button>
              </div>

              <p className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                {(lang === 'ar' ? 'لن تدفع أي مبلغ الآن. بعد موافقة المضيف على طلبك، تتفق معه على الدفع مباشرة بالطريقة التي اخترتها.' : lang === 'fr' ? 'Aucun paiement maintenant. Une fois la demande acceptée, vous réglez directement l’hôte avec le moyen choisi.' : 'You pay nothing now. Once the host accepts, you pay them directly with the method you picked.')}
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/90 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>
                  {isRestaurant
                    ? `${t.booking.ratePerPerson} ($${listing.priceUSD} × ${guestsCount})`
                    : `${t.booking.ratePerNight} ($${listing.priceUSD} × ${nights} ${t.booking.nights})`}
                </span>
                <span className="tabular-nums font-semibold">${subtotalUSD}</span>
              </div>

              {!isRestaurant && (
                <div className="flex justify-between text-stone-600">
                  <span>{t.booking.serviceFee}</span>
                  <span className="tabular-nums font-semibold">${serviceFeeUSD}</span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-bold text-stone-900">
                <span>{t.booking.totalUSD}</span>
                <div className="text-right rtl:text-left">
                  <span className="text-base text-emerald-900 tabular-nums">${totalUSD}</span>
                  <span className="block text-[11px] text-stone-500 font-normal tabular-nums">
                    {totalLBP.toLocaleString()} {lang === 'ar' ? 'ل.ل' : lang === 'fr' ? 'LL' : 'L.L.'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 leading-tight">
              {(lang === 'ar' ? 'سيصلك إشعار عندما يقبل المضيف طلبك أو يرفضه.' : lang === 'fr' ? 'Vous serez notifié quand l’hôte acceptera ou refusera.' : 'You will be notified when the host accepts or declines.')}
            </p>

            {/* Confirm CTA */}
            <button
              type="submit"
              disabled={isSelectedDateConflict || isSubmitting}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 ${
                isSelectedDateConflict
                  ? 'bg-stone-400 cursor-not-allowed opacity-70'
                  : 'bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 cursor-pointer'
              }`}
            >
              <span>{isSelectedDateConflict ? t.booking.datesConflictNotice : isSubmitting ? (lang === 'ar' ? 'جارٍ الإرسال...' : lang === 'fr' ? 'Envoi...' : 'Sending...') : (lang === 'ar' ? 'أرسل طلب الحجز' : lang === 'fr' ? 'Envoyer la demande' : 'Send booking request')}</span>
              <span>(${totalUSD} USD)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
