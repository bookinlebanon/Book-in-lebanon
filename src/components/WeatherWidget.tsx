import React, { useState, useMemo } from 'react';
import { Region, Language } from '../types';
import { translations } from '../data/translations';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  Compass, 
  Sparkles,
  Info,
  ChevronRight,
  MapPin
} from 'lucide-react';

interface WeatherForecastDay {
  dateLabel: { ar: string; en: string; fr: string };
  dayName: { ar: string; en: string; fr: string };
  temp: number; // in Celsius
  tempHigh: number;
  tempLow: number;
  condition: { ar: string; en: string; fr: string };
  iconType: 'sun' | 'cloud-sun' | 'cloud' | 'cloud-rain' | 'wind';
  humidity: number; // percentage
  windKmH: number;
  uvIndex: number;
  feelsLike: number;
}

interface WeatherWidgetProps {
  city: string;
  region: Region;
  coordinates?: { lat: number; lng: number };
  lang: Language;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  city,
  region,
  coordinates,
  lang,
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  const t = translations[lang];

  // Helper to convert C to F
  const formatTemp = (celsius: number) => {
    if (unit === 'F') {
      const f = Math.round((celsius * 9) / 5 + 32);
      return `${f}°F`;
    }
    return `${celsius}°C`;
  };

  // Determine geographic climate category
  const climateType = useMemo<'alpine' | 'coastal' | 'valley' | 'pine'>(() => {
    const r = region;
    const lowerCity = city.toLowerCase();

    if (
      lowerCity.includes('faraya') ||
      lowerCity.includes('cedars') ||
      lowerCity.includes('أرز') ||
      lowerCity.includes('بشري') ||
      lowerCity.includes('ehden') ||
      lowerCity.includes('إهدن') ||
      lowerCity.includes('zaarour') ||
      lowerCity.includes('زعور') ||
      lowerCity.includes('faqra') ||
      lowerCity.includes('فقرا')
    ) {
      return 'alpine';
    }

    if (
      r === 'beirut' ||
      r === 'jbeil' ||
      r === 'batroun' ||
      lowerCity.includes('batroun') ||
      lowerCity.includes('بترون') ||
      lowerCity.includes('byblos') ||
      lowerCity.includes('جبيل') ||
      lowerCity.includes('tyre') ||
      lowerCity.includes('صور') ||
      lowerCity.includes('sidon') ||
      lowerCity.includes('صيدا') ||
      lowerCity.includes('tripoli') ||
      lowerCity.includes('طرابلس')
    ) {
      return 'coastal';
    }

    if (
      r === 'zahle_bekaa' ||
      r === 'baalbek_hermel' ||
      r === 'west_bekaa_rashaya' ||
      lowerCity.includes('زحلة') ||
      lowerCity.includes('zahle') ||
      lowerCity.includes('بعلبك') ||
      lowerCity.includes('قرعون')
    ) {
      return 'valley';
    }

    if (
      r === 'chouf_aley' ||
      lowerCity.includes('chouf') ||
      lowerCity.includes('شوف') ||
      lowerCity.includes('aley') ||
      lowerCity.includes('عاليه') ||
      lowerCity.includes('broumana') ||
      lowerCity.includes('برمانا') ||
      lowerCity.includes('jezzine') ||
      lowerCity.includes('جزين')
    ) {
      return 'pine';
    }

    // Default based on latitude/region
    if (r === 'keserwan' || r === 'ehden_cedars') return 'alpine';
    if (r === 'tyre_south' || r === 'tripoli_akkar') return 'coastal';
    return 'coastal';
  }, [region, city]);

  // Generate deterministic realistic 3-day forecast for the specific Lebanese location
  const forecast: WeatherForecastDay[] = useMemo(() => {
    const today = new Date();
    const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNamesFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    let baseTemp = 24;
    let baseHigh = 27;
    let baseLow = 18;
    let humidity = 55;
    let wind = 14;
    let uv = 7;
    let conditionToday = { ar: 'مشمس ومعتدل', en: 'Sunny & Pleasant', fr: 'Ensoleillé et agréable' };
    let conditionTomorrow = { ar: 'سماء صافية', en: 'Clear Sky', fr: 'Ciel dégagé' };
    let conditionDayAfter = { ar: 'نسيم لطيف وغائم جزئياً', en: 'Breezy & Partly Cloudy', fr: 'Partiellement nuageux' };
    let icon1: 'sun' | 'cloud-sun' = 'sun';
    let icon2: 'sun' | 'cloud-sun' = 'sun';
    let icon3: 'sun' | 'cloud-sun' = 'cloud-sun';

    if (climateType === 'alpine') {
      baseTemp = 18;
      baseHigh = 22;
      baseLow = 11;
      humidity = 42;
      wind = 16;
      uv = 7;
      conditionToday = { ar: 'أجواء جبلية منعشة وصافية', en: 'Crisp Alpine Sunshine', fr: 'Soleil alpin vivifiant' };
      conditionTomorrow = { ar: 'مشمس مع نسيم بارد', en: 'Sunny with Cool Breeze', fr: 'Ensoleillé avec brise fraîche' };
      conditionDayAfter = { ar: 'غائم جزئياً ورطب خفيف', en: 'Partly Cloudy & Fresh', fr: 'Partiellement nuageux' };
      icon3 = 'cloud-sun';
    } else if (climateType === 'coastal') {
      baseTemp = 27;
      baseHigh = 29;
      baseLow = 22;
      humidity = 66;
      wind = 18;
      uv = 8;
      conditionToday = { ar: 'مشمس ودافئ مع نسيم بحري', en: 'Warm & Sunny Sea Breeze', fr: 'Chaud & brise marine' };
      conditionTomorrow = { ar: 'طقس بحري مثالي للسباحة', en: 'Perfect Beach Weather', fr: 'Météo idéale pour la plage' };
      conditionDayAfter = { ar: 'سماء زرقاء صافية', en: 'Clear Blue Sky', fr: 'Ciel bleu immaculé' };
      icon1 = 'sun';
      icon2 = 'sun';
      icon3 = 'sun';
    } else if (climateType === 'valley') {
      baseTemp = 25;
      baseHigh = 29;
      baseLow = 14;
      humidity = 35;
      wind = 12;
      uv = 8;
      conditionToday = { ar: 'شمس مشرقة وجفاف مريح', en: 'Bright Inland Sunshine', fr: 'Ensoleillement intérieur' };
      conditionTomorrow = { ar: 'دافئ نهاراً ومنعش ليلاً', en: 'Warm Day, Cool Evening', fr: 'Journée chaude, soirée fraîche' };
      conditionDayAfter = { ar: 'صافٍ ومثالي للأنشطة', en: 'Clear & Ideal for Touring', fr: 'Clair et idéal pour visiter' };
      icon1 = 'sun';
      icon2 = 'sun';
      icon3 = 'cloud-sun';
    } else if (climateType === 'pine') {
      baseTemp = 22;
      baseHigh = 25;
      baseLow = 15;
      humidity = 48;
      wind = 13;
      uv = 7;
      conditionToday = { ar: 'نسيم الصنوبر العليل', en: 'Fresh Pine Forest Breeze', fr: 'Brise fraîche de pinède' };
      conditionTomorrow = { ar: 'مشمس ولطيف بين التلال', en: 'Pleasant Hillside Sun', fr: 'Agréable soleil sur les collines' };
      conditionDayAfter = { ar: 'غيوم خفيفة ونسيم منعش', en: 'Mild Clouds & Breeze', fr: 'Nuages légers et brise douce' };
      icon3 = 'cloud-sun';
    }

    return [
      {
        dateLabel: { ar: 'اليوم', en: 'Today', fr: 'Aujourd’hui' },
        dayName: {
          ar: dayNamesAr[today.getDay()],
          en: dayNamesEn[today.getDay()],
          fr: dayNamesFr[today.getDay()],
        },
        temp: baseTemp,
        tempHigh: baseHigh,
        tempLow: baseLow,
        condition: conditionToday,
        iconType: icon1,
        humidity: humidity,
        windKmH: wind,
        uvIndex: uv,
        feelsLike: baseTemp + 1,
      },
      {
        dateLabel: { ar: 'غداً', en: 'Tomorrow', fr: 'Demain' },
        dayName: {
          ar: dayNamesAr[(today.getDay() + 1) % 7],
          en: dayNamesEn[(today.getDay() + 1) % 7],
          fr: dayNamesFr[(today.getDay() + 1) % 7],
        },
        temp: baseTemp + 1,
        tempHigh: baseHigh + 1,
        tempLow: baseLow,
        condition: conditionTomorrow,
        iconType: icon2,
        humidity: humidity - 2,
        windKmH: wind + 1,
        uvIndex: uv,
        feelsLike: baseTemp + 2,
      },
      {
        dateLabel: { ar: 'بعد غد', en: 'Day After', fr: 'Après-demain' },
        dayName: {
          ar: dayNamesAr[(today.getDay() + 2) % 7],
          en: dayNamesEn[(today.getDay() + 2) % 7],
          fr: dayNamesFr[(today.getDay() + 2) % 7],
        },
        temp: baseTemp - 1,
        tempHigh: baseHigh,
        tempLow: baseLow - 1,
        condition: conditionDayAfter,
        iconType: icon3,
        humidity: humidity + 4,
        windKmH: wind - 1,
        uvIndex: Math.max(uv - 1, 5),
        feelsLike: baseTemp - 1,
      },
    ];
  }, [climateType]);

  const current = forecast[selectedDayIdx];

  // Specific stay packing and activity advice
  const stayAdvice = useMemo(() => {
    if (climateType === 'alpine') {
      return {
        ar: 'الأجواء جبلية منعشة؛ نهار دافئ للتجول ومساء بارد رائع للجلسات الخارجية مع سترة خفيفة والجاكوزي الدافئ.',
        en: 'Crisp mountain climate; warm daytime for exploration and brisk evenings perfect for a light jacket and fireside / heated jacuzzi sessions.',
        fr: 'Climat montagnard vivifiant ; journées douces et soirées fraîches idéales avec une veste légère autour du jacuzzi chauffé.',
      };
    }
    if (climateType === 'coastal') {
      return {
        ar: 'طقس ساحلي مشمس ومثالي للسباحة والتشمس والأنشطة البحرية مع استمتاع كامل بغروب الشمس على البحر المتوسط.',
        en: 'Optimal sunny coastal conditions for swimming, tanning, seaside dining, and stunning Mediterranean sunsets.',
        fr: 'Conditions balnéaires idéales pour la baignade, le bronzage, les dîners en bord de mer et les couchers de soleil méditerranéens.',
      };
    }
    if (climateType === 'valley') {
      return {
        ar: 'طقس بقاعي جاف وممتع؛ شمس ساطعة طوال النهار مع نسيم لطيف جداً في المساء مثالي لجلسات الشواء والتراس.',
        en: 'Dry and sunny Bekaa valley weather; brilliant sunshine all day with refreshing cool breezes on evening terraces and vineyards.',
        fr: 'Climat ensoleillé et sec de la Békaa ; journées éclatantes et soirées rafraîchissantes parfaites en terrasse et vignobles.',
      };
    }
    return {
      ar: 'طقس معتدل ونقي بين غابات الصنوبر؛ مثالي للتنزه في الهواء الطلق والاسترخاء في أحضان الطبيعة الجبلية.',
      en: 'Gentle, fragrant pine breeze; perfect for outdoor walking, mountain relaxing, and sunset drinks on the terrace.',
      fr: 'Brise douce parmi les pinèdes ; idéal pour les promenades en plein air et la détente sur la terrasse.',
    };
  }, [climateType]);

  const renderWeatherIcon = (iconType: string, className: string = 'w-6 h-6') => {
    switch (iconType) {
      case 'sun':
        return <Sun className={`${className} text-amber-500 fill-amber-400 animate-spin-slow`} />;
      case 'cloud-sun':
        return <CloudSun className={`${className} text-amber-500`} />;
      case 'cloud':
        return <Cloud className={`${className} text-sky-400`} />;
      case 'cloud-rain':
        return <CloudRain className={`${className} text-blue-500`} />;
      case 'wind':
        return <Wind className={`${className} text-teal-500`} />;
      default:
        return <Sun className={`${className} text-amber-500 fill-amber-400`} />;
    }
  };

  return (
    <div className="border border-stone-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-sky-50/70 via-stone-50/50 to-amber-50/40 shadow-xs relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-sky-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar: Location + 3-day Title + Unit switch */}
      <div className="flex items-center justify-between gap-3 mb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white shadow-2xs border border-sky-200/80 flex items-center justify-center text-amber-500 shrink-0">
            {renderWeatherIcon(current.iconType, 'w-5 h-5')}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                {t.weather.title}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800 border border-sky-200">
                {city} 🇱🇧
              </span>
            </div>
            <p className="text-[11px] text-stone-500 line-clamp-1">
              {t.weather.subtitle}
            </p>
          </div>
        </div>

        {/* Celsius / Fahrenheit Toggle */}
        <div className="flex items-center bg-white/90 border border-stone-200 rounded-lg p-0.5 text-[11px] font-bold shadow-2xs shrink-0">
          <button
            type="button"
            onClick={() => setUnit('C')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              unit === 'C' ? 'bg-sky-700 text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            °C
          </button>
          <button
            type="button"
            onClick={() => setUnit('F')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              unit === 'F' ? 'bg-sky-700 text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            °F
          </button>
        </div>
      </div>

      {/* 3-Day Forecast Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-3.5 relative z-10">
        {forecast.map((f, idx) => {
          const isSelected = selectedDayIdx === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDayIdx(idx)}
              className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                isSelected
                  ? 'bg-white border-sky-400 ring-2 ring-sky-400/30 shadow-xs scale-[1.01]'
                  : 'bg-white/70 hover:bg-white border-stone-200/90 text-stone-600'
              }`}
            >
              <div className="flex items-center justify-between w-full text-[11px] mb-1">
                <span className="font-extrabold text-stone-900">
                  {f.dateLabel[lang] || f.dateLabel.en}
                </span>
                <span className="text-[10px] text-stone-400 hidden xs:inline">
                  {f.dayName[lang] || f.dayName.en}
                </span>
              </div>

              <div className="flex items-center gap-1.5 my-1">
                {renderWeatherIcon(f.iconType, 'w-5 h-5')}
                <span className="text-sm sm:text-base font-black text-stone-900 tabular-nums">
                  {formatTemp(f.temp)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-stone-500 tabular-nums">
                <span className="font-bold text-stone-700">{formatTemp(f.tempHigh)}</span>
                <span>/</span>
                <span className="text-stone-400">{formatTemp(f.tempLow)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Active Day Weather Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 border border-stone-200 shadow-xs space-y-3 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-xs">
              {renderWeatherIcon(current.iconType, 'w-7 h-7 stroke-[2.2]')}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-stone-900 tabular-nums">
                  {formatTemp(current.temp)}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  {current.condition[lang] || current.condition.en}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                <span>{t.weather.feelsLike}: <b className="text-stone-700 font-bold">{formatTemp(current.feelsLike)}</b></span>
                <span>·</span>
                <span>{t.weather.high}: <b className="text-stone-800">{formatTemp(current.tempHigh)}</b></span>
                <span>·</span>
                <span>{t.weather.low}: <b className="text-stone-600">{formatTemp(current.tempLow)}</b></span>
              </div>
            </div>
          </div>

          <div className="text-right rtl:text-left text-xs font-medium text-stone-500">
            <span className="block font-bold text-stone-800">
              {current.dayName[lang] || current.dayName.en}
            </span>
            <span className="text-[11px] text-emerald-800 font-semibold">
              🇱🇧 {city}
            </span>
          </div>
        </div>

        {/* Microclimate Weather Stats: Humidity, Wind, UV */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {/* Humidity */}
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-sky-700 mb-0.5">
              <Droplets className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold text-stone-500">{t.weather.humidity}</span>
            </div>
            <span className="font-extrabold text-stone-900 tabular-nums text-xs sm:text-sm">
              {current.humidity}%
            </span>
          </div>

          {/* Wind */}
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-teal-700 mb-0.5">
              <Wind className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold text-stone-500">{t.weather.wind}</span>
            </div>
            <span className="font-extrabold text-stone-900 tabular-nums text-xs sm:text-sm">
              {current.windKmH} km/h
            </span>
          </div>

          {/* UV Index */}
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-amber-700 mb-0.5">
              <Sun className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold text-stone-500">{t.weather.uvIndex}</span>
            </div>
            <span className="font-extrabold text-stone-900 tabular-nums text-xs sm:text-sm">
              {current.uvIndex} / 10
            </span>
          </div>
        </div>

        {/* Stay & Packing Advice for Guests */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-sky-50 via-emerald-50/50 to-stone-50 border border-sky-200/70 text-xs flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-stone-900 block mb-0.5">
              💡 {t.weather.stayAdvice}:
            </span>
            <p className="text-stone-600 text-[11px] sm:text-xs leading-relaxed">
              {stayAdvice[lang] || stayAdvice.en}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
