import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Moon, 
  Sparkles, 
  Check, 
  RotateCcw,
  AlertTriangle,
  Info
} from 'lucide-react';

interface BookingCalendarPickerProps {
  checkInDate: string; // YYYY-MM-DD
  checkOutDate?: string; // YYYY-MM-DD
  onDatesChange: (checkIn: string, checkOut: string) => void;
  onSingleDateChange?: (date: string) => void;
  isSingleDate?: boolean; // For restaurants
  lang: Language;
  bookedDates?: string[]; // Array of YYYY-MM-DD dates that are already booked
  pricePerNight?: number;
  minNights?: number;
}

export const BookingCalendarPicker: React.FC<BookingCalendarPickerProps> = ({
  checkInDate,
  checkOutDate = '',
  onDatesChange,
  onSingleDateChange,
  isSingleDate = false,
  lang,
  bookedDates = [],
  pricePerNight,
  minNights = 1,
}) => {
  // Calendar month state
  const initialDate = checkInDate ? new Date(checkInDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selectingStep, setSelectingStep] = useState<'checkIn' | 'checkOut'>('checkIn');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const t = translations[lang];

  // Localized month names
  const MONTHS_AR = [
    'كانون الثاني (يناير)',
    'شباط (فبراير)',
    'آذار (مارس)',
    'نيسان (أبريل)',
    'أيار (مايو)',
    'حزيران (يونيو)',
    'تموز (يوليو)',
    'آب (أغسطس)',
    'أيلول (سبتمبر)',
    'تشرين الأول (أكتوبر)',
    'تشرين الثاني (نوفمبر)',
    'كانون الأول (ديسمبر)',
  ];

  const MONTHS_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const MONTHS_EN = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const DAYS_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getMonthName = (date: Date) => {
    const m = date.getMonth();
    if (lang === 'ar') return MONTHS_AR[m];
    if (lang === 'fr') return MONTHS_FR[m];
    return MONTHS_EN[m];
  };

  const dayHeaders = lang === 'ar' ? DAYS_AR : lang === 'fr' ? DAYS_FR : DAYS_EN;

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate calendar days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper date format to YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Check if date is booked
  const isDateBooked = (dayStr: string) => {
    return bookedDates.includes(dayStr);
  };

  // Calculate nights
  const getNightsCount = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = getNightsCount();

  // Check if the current selected range contains any booked dates
  const hasRangeConflict = () => {
    if (!checkInDate || !checkOutDate || isSingleDate) return false;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    
    // Check all dates between start and end
    const curr = new Date(start);
    curr.setDate(curr.getDate() + 1);
    while (curr < end) {
      const curStr = curr.toISOString().split('T')[0];
      if (isDateBooked(curStr)) {
        return true;
      }
      curr.setDate(curr.getDate() + 1);
    }
    return isDateBooked(checkInDate);
  };

  const conflict = hasRangeConflict();

  // Handle day click
  const handleDayClick = (dayStr: string) => {
    // If date is already booked, prevent click
    if (isDateBooked(dayStr)) {
      return;
    }

    if (isSingleDate) {
      if (onSingleDateChange) {
        onSingleDateChange(dayStr);
      } else {
        onDatesChange(dayStr, '');
      }
      return;
    }

    if (selectingStep === 'checkIn') {
      // Set check-in date
      onDatesChange(dayStr, '');
      setSelectingStep('checkOut');
    } else {
      // Selecting checkout
      if (dayStr > checkInDate) {
        // Verify no booked dates inside range
        const start = new Date(checkInDate);
        const end = new Date(dayStr);
        let blocked = false;
        const curr = new Date(start);
        curr.setDate(curr.getDate() + 1);
        while (curr < end) {
          if (isDateBooked(curr.toISOString().split('T')[0])) {
            blocked = true;
            break;
          }
          curr.setDate(curr.getDate() + 1);
        }

        if (blocked) {
          // Cannot book across a reserved block: restart with this day as check-in
          onDatesChange(dayStr, '');
          setSelectingStep('checkOut');
        } else {
          onDatesChange(checkInDate, dayStr);
          setSelectingStep('checkIn');
        }
      } else {
        // If user clicked earlier date or same date, reset check-in to this day
        onDatesChange(dayStr, '');
        setSelectingStep('checkOut');
      }
    }
  };

  const handleNextWeekendPreset = () => {
    const d = new Date();
    const day = d.getDay();
    const diffToFriday = (5 - day + 7) % 7 || 7;
    const friday = new Date(d);
    friday.setDate(d.getDate() + diffToFriday);

    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);

    const checkIn = friday.toISOString().split('T')[0];
    const checkOut = sunday.toISOString().split('T')[0];

    // Check if weekend is available
    if (!isDateBooked(checkIn) && !isDateBooked(sunday.toISOString().split('T')[0])) {
      onDatesChange(checkIn, checkOut);
      setCurrentMonth(new Date(friday.getFullYear(), friday.getMonth(), 1));
      setSelectingStep('checkIn');
    }
  };

  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    const dayNum = d.getDate();
    const monthName = getMonthName(d).split(' ')[0];
    return `${dayNum} ${monthName}`;
  };

  return (
    <div className="space-y-3 bg-stone-50/90 p-3.5 sm:p-4 rounded-2xl border border-stone-200">
      {/* Top Header / Selected Dates Overview Cards */}
      <div className="flex items-center gap-2">
        {/* Check-In Card */}
        <button
          type="button"
          onClick={() => setSelectingStep('checkIn')}
          className={`flex-1 p-2.5 rounded-xl border text-left rtl:text-right transition-all cursor-pointer ${
            selectingStep === 'checkIn' && !isSingleDate
              ? 'border-emerald-700 bg-white ring-2 ring-emerald-600/30 shadow-xs'
              : 'border-stone-200 bg-white hover:border-stone-300'
          }`}
        >
          <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            {isSingleDate 
              ? (lang === 'ar' ? 'تاريخ الحجز' : lang === 'fr' ? 'Date de réservation' : 'Reservation Date')
              : (lang === 'ar' ? 'تاريخ الوصول (Check-In)' : lang === 'fr' ? 'Arrivée' : 'Check-In')}
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-stone-900 font-mono mt-0.5 block">
            {formatFriendlyDate(checkInDate)}
          </span>
        </button>

        {!isSingleDate && (
          <>
            {/* Nights Pill Badge */}
            <div className="shrink-0 flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-emerald-100/70 border border-emerald-200/80 text-emerald-900">
              <Moon className="w-3.5 h-3.5 mb-0.5 text-emerald-800" />
              <span className="text-[11px] font-extrabold tabular-nums">
                {nights} {lang === 'ar' ? (nights === 1 ? 'ليلة' : 'ليالٍ') : lang === 'fr' ? 'nuits' : 'nights'}
              </span>
            </div>

            {/* Check-Out Card */}
            <button
              type="button"
              onClick={() => setSelectingStep('checkOut')}
              className={`flex-1 p-2.5 rounded-xl border text-left rtl:text-right transition-all cursor-pointer ${
                selectingStep === 'checkOut'
                  ? 'border-emerald-700 bg-white ring-2 ring-emerald-600/30 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                {lang === 'ar' ? 'تاريخ المغادرة (Check-Out)' : lang === 'fr' ? 'Départ' : 'Check-Out'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-stone-900 font-mono mt-0.5 block">
                {checkOutDate ? formatFriendlyDate(checkOutDate) : (lang === 'ar' ? 'اختر اليوم' : 'Select Day')}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Calendar Navigation & Month Title */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-emerald-800" />
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">
              {getMonthName(currentMonth)} {year}
            </h4>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
              title="Previous Month"
              aria-label="Previous month"
            >
              {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
              title="Next Month"
              aria-label="Next month"
            >
              {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 mb-1">
          {dayHeaders.map((dh, i) => (
            <div key={i} className="py-1">
              {dh}
            </div>
          ))}
        </div>

        {/* Calendar Grid Days */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Empty cells before 1st of month */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 sm:h-11" />
          ))}

          {/* Days in Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayStr = formatDateStr(year, month, dayNum);
            const isPast = dayStr < todayStr;
            const isBooked = isDateBooked(dayStr);
            const isCheckIn = dayStr === checkInDate;
            const isCheckOut = dayStr === checkOutDate;
            const isInRange = 
              checkInDate && 
              checkOutDate && 
              dayStr > checkInDate && 
              dayStr < checkOutDate;

            // Hover preview range
            const isHoverRange = 
              selectingStep === 'checkOut' &&
              checkInDate &&
              hoverDate &&
              hoverDate > checkInDate &&
              dayStr > checkInDate &&
              dayStr <= hoverDate;

            let buttonClass = 'relative flex flex-col items-center justify-center h-10 sm:h-11 rounded-lg transition-all text-xs font-semibold';
            let dayColor = 'text-stone-800';
            let bgClass = 'hover:bg-emerald-50';

            if (isPast) {
              buttonClass += ' cursor-not-allowed opacity-35 bg-stone-50';
              dayColor = 'text-stone-400';
            } else if (isBooked) {
              buttonClass += ' cursor-not-allowed bg-rose-50/80 border border-rose-200/60 opacity-80';
              dayColor = 'text-rose-700 line-through';
            } else if (isCheckIn || isCheckOut) {
              buttonClass += ' bg-emerald-800 text-white font-extrabold shadow-sm scale-[0.98] ring-2 ring-emerald-600/40 z-10';
              dayColor = 'text-white';
            } else if (isInRange) {
              buttonClass += ' bg-emerald-100 text-emerald-950 font-bold rounded-none';
              dayColor = 'text-emerald-950';
            } else if (isHoverRange) {
              buttonClass += ' bg-emerald-50 text-emerald-900 rounded-none';
              dayColor = 'text-emerald-900';
            } else {
              buttonClass += ` ${bgClass} cursor-pointer`;
            }

            return (
              <button
                key={dayStr}
                type="button"
                disabled={isPast || isBooked}
                onClick={() => handleDayClick(dayStr)}
                onMouseEnter={() => !isPast && !isBooked && setHoverDate(dayStr)}
                onMouseLeave={() => setHoverDate(null)}
                className={buttonClass}
                title={
                  isBooked 
                    ? t.booking.booked 
                    : isPast 
                    ? (lang === 'ar' ? 'تاريخ سابق' : lang === 'fr' ? 'Date passée' : 'Past date') 
                    : t.booking.available
                }
              >
                <span className={`text-xs ${dayColor} tabular-nums leading-none`}>
                  {dayNum}
                </span>

                {/* Day status indicator (Booked badge vs Daily Price) */}
                {isBooked ? (
                  <span className="text-[8px] font-bold text-rose-600 mt-0.5 scale-90 leading-none">
                    {t.booking.booked}
                  </span>
                ) : !isPast && !isCheckIn && !isCheckOut && pricePerNight ? (
                  <span className="text-[8px] font-medium text-emerald-700 mt-0.5 scale-90 tabular-nums leading-none">
                    ${pricePerNight}
                  </span>
                ) : isCheckIn ? (
                  <span className="text-[8px] font-bold text-white mt-0.5 leading-none">
                    {lang === 'ar' ? 'وصول' : 'In'}
                  </span>
                ) : isCheckOut ? (
                  <span className="text-[8px] font-bold text-white mt-0.5 leading-none">
                    {lang === 'ar' ? 'مغادرة' : 'Out'}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Legend Bar */}
      <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-stone-600 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-emerald-700"></span>
            <span className="font-medium">{t.booking.available}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-600"></span>
            <span className="font-medium text-rose-700">{t.booking.booked}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-800"></span>
            <span className="font-medium">{t.booking.selectedDates}</span>
          </div>
        </div>

        {/* Quick next weekend preset */}
        {!isSingleDate && (
          <button
            type="button"
            onClick={handleNextWeekendPreset}
            className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            ⚡ {t.booking.nextWeekend}
          </button>
        )}
      </div>

      {/* Availability Status Notice */}
      {conflict ? (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium leading-tight">
            {t.booking.datesConflictNotice}
          </span>
        </div>
      ) : checkInDate && (checkOutDate || isSingleDate) ? (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold leading-tight">
              {t.booking.datesAvailableNotice}
            </span>
          </div>
          {nights > 0 && pricePerNight && (
            <span className="font-bold tabular-nums shrink-0">
              {nights} × ${pricePerNight} = ${nights * pricePerNight}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
};
