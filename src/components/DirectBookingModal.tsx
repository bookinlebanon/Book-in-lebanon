import React, { useState, useEffect, useMemo } from 'react';
import { Listing, Language, Booking, PaymentMethod } from '../types';
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
import { generatePaymentQrDataUrl } from '../utils/qrUtils';

interface DirectBookingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onConfirmBooking: (booking: Booking) => void;
  existingBookings?: Booking[];
}

export const DirectBookingModal: React.FC<DirectBookingModalProps> = ({
  listing,
  isOpen,
  onClose,
  lang,
  onConfirmBooking,
  existingBookings = [],
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cards');
  
  // Cards Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Whish Pay & OMT Pay State
  const [whishPhone, setWhishPhone] = useState('+961 ');
  const [omtPhone, setOmtPhone] = useState('+961 ');
  const [whishQr, setWhishQr] = useState<string>('');
  const [omtQr, setOmtQr] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Dynamic reference code for payment
  const [txnRefCode] = useState(() => `BIL-${Math.floor(100000 + Math.random() * 900000)}`);

  // Confirmation view state
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

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

    // If listing has no reserved dates set, generate realistic reserved days (e.g. popular upcoming weekend dates)
    if (datesSet.size === 0) {
      const today = new Date();
      const day = today.getDay();
      const diffToFri = (5 - day + 7) % 7 || 7;
      const fri = new Date(today);
      fri.setDate(today.getDate() + diffToFri);
      const sat = new Date(fri);
      sat.setDate(fri.getDate() + 1);
      
      datesSet.add(fri.toISOString().split('T')[0]);
      datesSet.add(sat.toISOString().split('T')[0]);

      // And 2 weeks later
      const fri2 = new Date(fri);
      fri2.setDate(fri.getDate() + 14);
      const sat2 = new Date(sat);
      sat2.setDate(sat.getDate() + 14);
      datesSet.add(fri2.toISOString().split('T')[0]);
      datesSet.add(sat2.toISOString().split('T')[0]);
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

  // Generate QR codes for Whish and OMT when payment method is selected
  useEffect(() => {
    if (isOpen && totalUSD > 0) {
      generatePaymentQrDataUrl('whish', totalUSD, `WHISH-${txnRefCode}`).then(setWhishQr);
      generatePaymentQrDataUrl('omt', totalUSD, `OMT-${txnRefCode}`).then(setOmtQr);
    }
  }, [isOpen, totalUSD, txnRefCode]);

  if (!isOpen || !listing) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) return;

    let paymentRef = txnRefCode;
    if (paymentMethod === 'whish_pay') paymentRef = `WHISH-${txnRefCode}`;
    if (paymentMethod === 'omt_pay') paymentRef = `OMT-${txnRefCode}`;
    if (paymentMethod === 'cards') paymentRef = `CARD-${txnRefCode}`;
    if (paymentMethod === 'cash_on_arrival') paymentRef = `CASH-${txnRefCode}`;

    const newBooking: Booking = {
      id: txnRefCode,
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
      paymentStatus: paymentMethod === 'cash_on_arrival' ? 'cash' : 'paid',
      paymentReference: paymentRef,
      notes: notes.trim(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    onConfirmBooking(newBooking);
    setConfirmedBooking(newBooking);
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
                {t.booking.bookingSuccess}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {t.booking.voucherNotice}
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
                    {confirmedBooking.id}
                  </span>
                </div>
                <div className="text-right rtl:text-left flex flex-col items-end rtl:items-start gap-1">
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-800 text-white rounded-md">
                    {t.myBookings.confirmed}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">
                    {confirmedBooking.paymentStatus === 'paid' ? t.booking.paymentStatusPaid : t.booking.paymentStatusCash}
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
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Credit / Debit Cards */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cards')}
                  className={`p-3 rounded-xl border text-left rtl:text-right flex flex-col justify-between transition-all ${
                    paymentMethod === 'cards'
                      ? 'border-emerald-800 bg-emerald-50/70 ring-1 ring-emerald-800 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-base font-bold text-stone-800">💳</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-black tracking-tight text-blue-900 bg-blue-50 px-1 py-0.5 rounded">VISA</span>
                      <span className="text-[10px] font-black tracking-tight text-amber-900 bg-amber-50 px-1 py-0.5 rounded">MC</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 leading-tight">
                      {lang === 'ar' ? 'بطاقات مصرفية' : 'Bank Cards'}
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                      Visa / Mastercard
                    </p>
                  </div>
                </button>

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

              {/* Dynamic Payment Details Drawer */}
              {paymentMethod === 'cards' && (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span className="font-semibold">{t.booking.cardsDesc}</span>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>3D Secure</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      {lang === 'ar' ? 'الاسم على البطاقة' : 'Cardholder Name'}
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="e.g. CHARBEL EL HAGE"
                      className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      {lang === 'ar' ? 'رقم البطاقة' : 'Card Number'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1 ').trim();
                          setCardNumber(val);
                        }}
                        placeholder="4532 •••• •••• 8841"
                        className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono tracking-wider"
                      />
                      <CreditCard className="w-4 h-4 text-stone-400 absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        {lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry'} (MM/YY)
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length > 2) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                          setCardExpiry(val);
                        }}
                        placeholder="12/28"
                        className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        رمز الأمان (CVC)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="•••"
                        className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'whish_pay' && (
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#E11D48] text-white flex items-center justify-center font-bold text-xs">W</span>
                      <span className="text-xs font-bold text-stone-900">Whish Money Direct Checkout</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#E11D48]">
                      ${totalUSD} USD
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {t.booking.whishInstructions}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-rose-200/80">
                    {whishQr ? (
                      <img src={whishQr} alt="Whish Pay QR" className="w-24 h-24 rounded-lg shrink-0 border border-rose-200" />
                    ) : (
                      <div className="w-24 h-24 bg-rose-100 rounded-lg flex items-center justify-center shrink-0">
                        <QrCode className="w-8 h-8 text-[#E11D48]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-center sm:text-left rtl:sm:text-right space-y-1">
                      <span className="text-[10px] text-stone-500 font-semibold block">
                        {lang === 'ar' ? 'كود الدفع في Whish:' : 'Whish Payment Reference:'}
                      </span>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg">
                        <span className="font-mono text-xs font-bold text-[#E11D48]">WHISH-{txnRefCode}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(`WHISH-${txnRefCode}`)}
                          className="p-1 hover:bg-rose-200 rounded transition-colors text-stone-600"
                        >
                          {copiedCode === `WHISH-${txnRefCode}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-400">
                        {lang === 'ar' ? 'افتح كاميرا الهاتف أو تطبيق Whish لمسح الرمز فوراً' : 'Scan with Whish Money app or enter reference'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      {lang === 'ar' ? 'رقم هاتفك المسجل في Whish (اختياري للتحقق):' : 'Registered Whish Phone Number:'}
                    </label>
                    <input
                      type="tel"
                      value={whishPhone}
                      onChange={(e) => setWhishPhone(e.target.value)}
                      placeholder="+961 70 000 000"
                      className="w-full text-xs p-2.5 border border-rose-200 rounded-lg focus:outline-none focus:border-[#E11D48] font-mono bg-white"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'omt_pay' && (
                <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#0284C7] text-white flex items-center justify-center font-bold text-[10px]">OMT</span>
                      <span className="text-xs font-bold text-stone-900">OMT Pay & 1,400+ Branches</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#0284C7]">
                      ${totalUSD} USD
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {t.booking.omtInstructions}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-sky-200/80">
                    {omtQr ? (
                      <img src={omtQr} alt="OMT Pay QR" className="w-24 h-24 rounded-lg shrink-0 border border-sky-200" />
                    ) : (
                      <div className="w-24 h-24 bg-sky-100 rounded-lg flex items-center justify-center shrink-0">
                        <QrCode className="w-8 h-8 text-[#0284C7]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-center sm:text-left rtl:sm:text-right space-y-1">
                      <span className="text-[10px] text-stone-500 font-semibold block">
                        {lang === 'ar' ? 'رمز حجز OMT الرسمي:' : 'OMT Service Voucher Code:'}
                      </span>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 border border-sky-200 rounded-lg">
                        <span className="font-mono text-xs font-bold text-[#0284C7]">OMT-{txnRefCode}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(`OMT-${txnRefCode}`)}
                          className="p-1 hover:bg-sky-200 rounded transition-colors text-stone-600"
                        >
                          {copiedCode === `OMT-${txnRefCode}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-400">
                        {lang === 'ar' ? 'صالح للدفع في أي فرع OMT أو تطبيق OMT Pay خلال 24 ساعة' : 'Valid at any OMT branch or in OMT Pay app'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      {lang === 'ar' ? 'رقم الهاتف لاستلام إشعار OMT:' : 'Phone number for OMT notification:'}
                    </label>
                    <input
                      type="tel"
                      value={omtPhone}
                      onChange={(e) => setOmtPhone(e.target.value)}
                      placeholder="+961 03 000 000"
                      className="w-full text-xs p-2.5 border border-sky-200 rounded-lg focus:outline-none focus:border-[#0284C7] font-mono bg-white"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'cash_on_arrival' && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🇱🇧</span>
                    <span className="text-xs font-bold text-emerald-950">
                      {lang === 'ar' ? 'دفع نقدي آمن ومباشر للمضيف' : 'Cash upon Check-in'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {t.booking.cashOnArrivalDesc}. 
                    {lang === 'ar' ? ' يتم تسليم المبلغ مباشرة للمضيف بالدولار الأمريكي الفريش أو بالليرة اللبنانية حسب سعر الصرف المتفق عليه.' : ' You can settle the full amount directly with the host at check-in.'}
                  </p>
                </div>
              )}
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
              {t.booking.instantConfirmNotice}
            </p>

            {/* Confirm CTA */}
            <button
              type="submit"
              disabled={isSelectedDateConflict}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 ${
                isSelectedDateConflict
                  ? 'bg-stone-400 cursor-not-allowed opacity-70'
                  : 'bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 cursor-pointer'
              }`}
            >
              <span>{isSelectedDateConflict ? t.booking.datesConflictNotice : t.booking.confirmBtn}</span>
              <span>(${totalUSD} USD)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
