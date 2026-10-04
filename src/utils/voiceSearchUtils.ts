import { Category, Region, Language } from '../types';

// SpeechRecognition type declarations for Web Speech API cross-browser support
export interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface VoiceParseResult {
  rawTranscript: string;
  cleanedQuery: string;
  matchedRegion?: Region;
  matchedCategory?: Category;
  detectedSummary?: string;
}

interface RegionKeywordMap {
  region: Region;
  keywords: string[];
  labelAr: string;
  labelEn: string;
}

const REGION_KEYWORDS: RegionKeywordMap[] = [
  {
    region: 'beirut',
    keywords: ['بيروت', 'beirut', 'beyrouth', 'حمرا', 'روشة', 'أشرفية', 'gemmayze', 'mar mikhael', 'down town', 'داون تاون'],
    labelAr: 'بيروت',
    labelEn: 'Beirut',
  },
  {
    region: 'keserwan',
    keywords: ['فاريا', 'faraya', 'فقرا', 'faqra', 'كسروان', 'keserwan', 'كفردبيان', 'kfardebian', 'مزار', 'mzaar', 'حريصا', 'جونيه', 'jounieh'],
    labelAr: 'فاريا وفقرا',
    labelEn: 'Faraya & Faqra',
  },
  {
    region: 'jbeil',
    keywords: ['جبيل', 'byblos', 'jbeil', 'عمشيت', 'amchit', 'بلاط', 'مشمش', 'لحفد'],
    labelAr: 'جبيل',
    labelEn: 'Byblos',
  },
  {
    region: 'batroun',
    keywords: ['بترون', 'البترون', 'batroun', 'كفرعبيدا', 'شكا', 'chekka', 'تنورين', 'tannourine', 'دوما', 'douma'],
    labelAr: 'البترون',
    labelEn: 'Batroun',
  },
  {
    region: 'ehden_cedars',
    keywords: ['إهدن', 'اهدن', 'ehden', 'الأرز', 'ارز', 'cedars', 'بشري', 'bcharre', 'قاديشا', 'qadisha', 'حصرون'],
    labelAr: 'إهدن والأرز',
    labelEn: 'Ehden & Cedars',
  },
  {
    region: 'tripoli_akkar',
    keywords: ['طرابلس', 'tripoli', 'عكار', 'akkar', 'الميناء', 'el mina', 'القبيات'],
    labelAr: 'طرابلس وعكار',
    labelEn: 'Tripoli & Akkar',
  },
  {
    region: 'matn',
    keywords: ['برمانا', 'broummana', 'broumana', 'المتن', 'metn', 'matn', 'بيت مري', 'beit mery', 'ضهور الشوير', 'زعور', 'zaarour', 'بكفيا'],
    labelAr: 'برمانا والمتن',
    labelEn: 'Broummana & Metn',
  },
  {
    region: 'chouf_aley',
    keywords: ['شوف', 'الشوف', 'chouf', 'عاليه', 'aley', 'دير القمر', 'deir el qamar', 'بيت الدين', 'beit eddine', 'باروك', 'barouk', 'بحمدون'],
    labelAr: 'الشوف وعاليه',
    labelEn: 'Chouf & Aley',
  },
  {
    region: 'tyre_south',
    keywords: ['صور', 'tyre', 'sour', 'الجنوب', 'south', 'الناقورة', 'naqoura', 'قانا'],
    labelAr: 'صور والجنوب',
    labelEn: 'Tyre & South',
  },
  {
    region: 'sidon_jezzine',
    keywords: ['صيدا', 'sidon', 'saida', 'جزين', 'jezzine', 'مغدوشة', 'شلالات جزين'],
    labelAr: 'جزين وصيدا',
    labelEn: 'Jezzine & Sidon',
  },
  {
    region: 'zahle_bekaa',
    keywords: ['زحلة', 'zahle', 'البقاع', 'bekaa', 'شتورا', 'chtoura', 'عنجر', 'anjar', 'البردوني'],
    labelAr: 'زحلة والبقاع',
    labelEn: 'Zahle & Bekaa',
  },
  {
    region: 'baalbek_hermel',
    keywords: ['بعلبك', 'baalbek', 'الهرمل', 'hermel', 'قلعة بعلبك', 'العاصي'],
    labelAr: 'بعلبك والهرمل',
    labelEn: 'Baalbek & Hermel',
  },
  {
    region: 'west_bekaa_rashaya',
    keywords: ['راشيا', 'rashaya', 'القرعون', 'qaraoun', 'البقاع الغربي', 'west bekaa', 'عميق', 'ammiq', 'صغبين'],
    labelAr: 'راشيا والقرعون',
    labelEn: 'Rashaya & Qaraoun',
  },
];

interface CategoryKeywordMap {
  category: Category;
  keywords: string[];
  labelAr: string;
  labelEn: string;
}

const CATEGORY_KEYWORDS: CategoryKeywordMap[] = [
  {
    category: 'chalet',
    keywords: ['شاليه', 'شاليهات', 'chalet', 'chalets', 'فيلا', 'مسبح', 'شاليه مع مسبح', 'جاكوزي'],
    labelAr: 'شاليه',
    labelEn: 'Chalet',
  },
  {
    category: 'guesthouse',
    keywords: ['بيت ضيافة', 'بيوت ضيافة', 'guest house', 'guesthouse', 'بيت قروي', 'نزل'],
    labelAr: 'بيت ضيافة',
    labelEn: 'Guesthouse',
  },
  {
    category: 'studio',
    keywords: ['ستوديو', 'استوديو', 'studio', 'شقة صغيرة', 'شقة مخدومة'],
    labelAr: 'ستوديو',
    labelEn: 'Studio',
  },
  {
    category: 'hotel',
    keywords: ['فندق', 'فنادق', 'hotel', 'hotels', 'أوتيل', 'منتجع', 'resort'],
    labelAr: 'فندق',
    labelEn: 'Hotel',
  },
  {
    category: 'restaurant',
    keywords: ['مطعم', 'مطاعم', 'restaurant', 'restaurants', 'عشاء', 'غداء', 'كافيه', 'cafe', 'طاولة', 'أكل'],
    labelAr: 'مطعم',
    labelEn: 'Restaurant',
  },
  {
    category: 'real_estate',
    keywords: ['عقار', 'عقارات', 'شراء', 'بيع', 'إيجار سنوي', 'فيلا للبيع', 'real estate', 'apartment for rent'],
    labelAr: 'عقارات',
    labelEn: 'Real Estate',
  },
];

/**
 * Intelligent parser that extracts region, category, and keywords from voice transcripts
 */
export function parseVoiceTranscript(rawText: string, lang: Language): VoiceParseResult {
  const normalized = rawText.toLowerCase().trim();
  let matchedRegion: Region | undefined = undefined;
  let matchedCategory: Category | undefined = undefined;

  // 1. Detect Region
  for (const item of REGION_KEYWORDS) {
    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        matchedRegion = item.region;
        break;
      }
    }
    if (matchedRegion) break;
  }

  // 2. Detect Category
  for (const item of CATEGORY_KEYWORDS) {
    for (const kw of item.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        matchedCategory = item.category;
        break;
      }
    }
    if (matchedCategory) break;
  }

  // Clean words like "ابحث عن", "بدي", "search for", "find me", "je cherche"
  let cleaned = rawText
    .replace(/^(ابحث عن|بدي|دورلي على|عرض|بدي حجز|حجز|search for|look for|find me|show me|je cherche|trouve-moi)\s+/i, '')
    .trim();

  // Construct short summary for user toast
  const parts: string[] = [];
  if (matchedCategory) {
    const catObj = CATEGORY_KEYWORDS.find((c) => c.category === matchedCategory);
    if (catObj) parts.push(lang === 'ar' ? catObj.labelAr : catObj.labelEn);
  }
  if (matchedRegion) {
    const regObj = REGION_KEYWORDS.find((r) => r.region === matchedRegion);
    if (regObj) parts.push(lang === 'ar' ? `في ${regObj.labelAr}` : `in ${regObj.labelEn}`);
  }

  const detectedSummary = parts.length > 0 ? parts.join(' · ') : rawText;

  return {
    rawTranscript: rawText,
    cleanedQuery: cleaned,
    matchedRegion,
    matchedCategory,
    detectedSummary,
  };
}

/**
 * Checks if browser supports SpeechRecognition API
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindowWithSpeech;
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Gets appropriate BCP-47 language tag for SpeechRecognition
 */
export function getSpeechLangCode(lang: Language): string {
  switch (lang) {
    case 'ar':
      return 'ar-LB'; // Lebanese Arabic first
    case 'fr':
      return 'fr-FR';
    case 'en':
    default:
      return 'en-US';
  }
}
