import React, { useState, useRef } from 'react';
import { Category, Region, Amenity, Language, Listing, PriceUnit } from '../types';
import { translations } from '../data/translations';
import { 
  X, 
  Plus, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  CheckCircle2,
  Upload,
  Video,
  Trash2,
  Film,
  Smartphone,
  Laptop,
  Loader2,
  Star,
  Play
} from 'lucide-react';
import { optimizeImageFile, processVideoFile, formatFileSize } from '../utils/mediaUtils';
import { LEBANON_REGION_COORDINATES } from '../utils/lebanonLocations';

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAddListing: (newListing: Listing) => void;
}

interface UploadedMediaItem {
  id: string;
  url: string;
  name: string;
  size: string;
}

export const PostAdModal: React.FC<PostAdModalProps> = ({
  isOpen,
  onClose,
  lang,
  onAddListing,
}) => {
  const t = translations[lang];

  const [category, setCategory] = useState<Category>('chalet');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [region, setRegion] = useState<Region>('keserwan');
  const [cityAr, setCityAr] = useState('');
  const [cityEn, setCityEn] = useState('');
  const [address, setAddress] = useState('');
  const [priceUSD, setPriceUSD] = useState(150);
  const [priceUnit, setPriceUnit] = useState<PriceUnit>('per_night');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [maxGuests, setMaxGuests] = useState(4);
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([
    'generator_247',
    'wifi',
    'parking',
  ]);
  const [hostName, setHostName] = useState('');
  const [hostPhone, setHostPhone] = useState('+961 ');
  const [hostWhatsapp, setHostWhatsapp] = useState('961');
  const [selectedImage, setSelectedImage] = useState('/images/lebanon_mountain_chalet_1790760821579.jpg');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Phone & Computer Media Upload State
  const [uploadedImages, setUploadedImages] = useState<UploadedMediaItem[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedMediaItem[]>([]);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const presetImages = [
    {
      url: '/images/lebanon_mountain_chalet_1790760821579.jpg',
      label: lang === 'ar' ? 'شاليه جبلي فاخر' : lang === 'fr' ? 'Chalet de montagne' : 'Mountain Chalet',
    },
    {
      url: '/images/lebanon_cedars_cabin_1790761973183.jpg',
      label: lang === 'ar' ? 'كوخ أرز الرب' : lang === 'fr' ? 'Cabane des Cèdres' : 'Cedars Alpine Cabin',
    },
    {
      url: '/images/lebanon_coastal_guesthouse_1790760833819.jpg',
      label: lang === 'ar' ? 'بيت ضيافة بحري' : lang === 'fr' ? 'Maison d’hôtes côtière' : 'Coastal Guest House',
    },
    {
      url: '/images/lebanon_jezzine_pine_villa_1790761985220.jpg',
      label: lang === 'ar' ? 'فيلا صنوبر جزين' : lang === 'fr' ? 'Villa aux pins' : 'Jezzine Pine Villa',
    },
    {
      url: '/images/lebanon_beirut_modern_studio_1790760845048.jpg',
      label: lang === 'ar' ? 'استوديو بيروت' : lang === 'fr' ? 'Studio moderne' : 'Modern Beirut Studio',
    },
    {
      url: '/images/lebanon_terrace_restaurant_1790760857859.jpg',
      label: lang === 'ar' ? 'مطعم وتراس' : lang === 'fr' ? 'Restaurant terrasse' : 'Terrace Restaurant',
    },
  ];

  const amenityList: { key: Amenity; label: string }[] = [
    { key: 'generator_247', label: t.amenities.generator_247 },
    { key: 'pool', label: t.amenities.pool },
    { key: 'sea_view', label: t.amenities.sea_view },
    { key: 'mountain_view', label: t.amenities.mountain_view },
    { key: 'wifi', label: t.amenities.wifi },
    { key: 'jacuzzi', label: t.amenities.jacuzzi },
    { key: 'parking', label: t.amenities.parking },
    { key: 'kitchen', label: t.amenities.kitchen },
    { key: 'breakfast', label: t.amenities.breakfast },
    { key: 'terrace', label: t.amenities.terrace },
    { key: 'pet_friendly', label: t.amenities.pet_friendly },
  ];

  const toggleAmenity = (key: Amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Handle Image Upload from Studio (Phone Gallery or Computer)
  const handleImageFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsProcessingMedia(true);
    try {
      const newItems: UploadedMediaItem[] = [];
      for (const file of fileArray) {
        const optimizedUrl = await optimizeImageFile(file);
        newItems.push({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: optimizedUrl,
          name: file.name,
          size: formatFileSize(file.size),
        });
      }
      setUploadedImages(prev => [...prev, ...newItems]);
    } catch (err) {
      console.error('Error optimizing image:', err);
    } finally {
      setIsProcessingMedia(false);
    }
  };

  // Handle Video Upload from Studio (Phone Gallery or Computer)
  const handleVideoFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('video/') || f.name.match(/\.(mp4|mov|webm|m4v)$/i));
    if (fileArray.length === 0) return;

    setIsProcessingMedia(true);
    try {
      const newItems: UploadedMediaItem[] = [];
      for (const file of fileArray) {
        const videoUrl = await processVideoFile(file);
        newItems.push({
          id: `vid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: videoUrl,
          name: file.name,
          size: formatFileSize(file.size),
        });
      }
      setUploadedVideos(prev => [...prev, ...newItems]);
    } catch (err) {
      console.error('Error processing video:', err);
    } finally {
      setIsProcessingMedia(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const videoFiles = files.filter(f => f.type.startsWith('video/') || f.name.match(/\.(mp4|mov|webm|m4v)$/i));

    if (imageFiles.length > 0) {
      await handleImageFiles(imageFiles);
    }
    if (videoFiles.length > 0) {
      await handleVideoFiles(videoFiles);
    }
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSetCoverImage = (id: string) => {
    setUploadedImages(prev => {
      const target = prev.find(img => img.id === id);
      if (!target) return prev;
      return [target, ...prev.filter(img => img.id !== id)];
    });
  };

  const handleRemoveVideo = (id: string) => {
    setUploadedVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim()) return;

    const finalImages = uploadedImages.length > 0
      ? uploadedImages.map(img => img.url)
      : customImageUrl.trim()
      ? [customImageUrl.trim()]
      : [selectedImage];

    const finalVideos = uploadedVideos.length > 0
      ? uploadedVideos.map(v => v.url)
      : undefined;

    const finalTitle = titleAr.trim();
    const finalCity = cityAr.trim() || (lang === 'ar' ? 'لبنان' : 'Lebanon');

    const newListing: Listing = {
      id: `bil-user-${Date.now()}`,
      title: {
        ar: finalTitle,
        en: finalTitle,
        fr: finalTitle,
      },
      category,
      region,
      city: {
        ar: finalCity,
        en: finalCity,
        fr: finalCity,
      },
      address: address.trim() || finalCity,
      priceUSD: Number(priceUSD),
      priceUnit,
      rating: 5.0,
      reviewsCount: 1,
      images: finalImages,
      videos: finalVideos,
      description: {
        ar: descriptionAr.trim() || finalTitle,
        en: descriptionAr.trim() || finalTitle,
        fr: descriptionAr.trim() || finalTitle,
      },
      amenities: selectedAmenities,
      maxGuests: category !== 'restaurant' ? Number(maxGuests) : undefined,
      bedrooms: category !== 'restaurant' ? Number(bedrooms) : undefined,
      bathrooms: category !== 'restaurant' ? Number(bathrooms) : undefined,
      coordinates: LEBANON_REGION_COORDINATES[region] || { lat: 33.8938, lng: 35.5018 },
      host: {
        name: hostName.trim() || (lang === 'ar' ? 'المضيف' : 'Host'),
        phone: hostPhone.trim(),
        whatsapp: hostWhatsapp.replace(/[^0-9]/g, '') || '96170000000',
        verified: true,
      },
      reviews: [
        {
          id: `rev-initial-${Date.now()}`,
          author: 'Book in Lebanon Quality Team',
          date: new Date().toISOString().split('T')[0],
          rating: 5,
          comment: lang === 'ar' ? 'إعلان جديد موثق على المنصة.' : 'New verified listing published on Book in Lebanon.',
        }
      ],
      featured: true,
      isUserListing: true,
      createdAt: new Date().toISOString(),
    };

    onAddListing(newListing);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5">
      <div 
        className="relative bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border-t sm:border border-stone-200 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2 sm:hidden shrink-0"></div>

        {/* Modal Top Bar */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 sticky top-0 z-10">
          <div>
            <h2 className="text-base font-bold text-stone-900">{t.postAd.title}</h2>
            <p className="text-xs text-stone-500">{t.postAd.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 sm:bg-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-extrabold text-stone-900">
              {t.postAd.successMessage}
            </h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 min-h-0 p-4 sm:p-6 space-y-5">
            {/* Category / Property Type */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.postAd.propertyType} *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'chalet', label: t.categories.chalet },
                  { key: 'guesthouse', label: t.categories.guesthouse },
                  { key: 'studio', label: t.categories.studio },
                  { key: 'hotel', label: t.categories.hotel },
                  { key: 'restaurant', label: t.categories.restaurant },
                  { key: 'real_estate', label: t.categories.real_estate },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCategory(item.key as Category)}
                    className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                      category === item.key
                        ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.postAd.adTitleAr} *
                </label>
                <input
                  type="text"
                  required
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'مثال: شاليه مودرن مع مسبح خاص في فاريا'
                      : lang === 'fr'
                      ? 'ex. Chalet moderne avec piscine privée à Faraya'
                      : 'e.g. Modern Sunset Chalet with Pool in Faraya'
                  }
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.postAd.city} *
                </label>
                <input
                  type="text"
                  required
                  value={cityAr}
                  onChange={(e) => setCityAr(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'مثال: فاريا، البترون، جبيل، صور...'
                      : lang === 'fr'
                      ? 'ex. Faraya, Batroun, Byblos, Tyr...'
                      : 'e.g. Faraya, Batroun, Byblos, Tyre...'
                  }
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            {/* Region & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.postAd.region} *
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 bg-white"
                >
                  <option value="beirut">{t.regions.beirut}</option>
                  <option value="keserwan">{t.regions.keserwan}</option>
                  <option value="jbeil">{t.regions.jbeil}</option>
                  <option value="batroun">{t.regions.batroun}</option>
                  <option value="ehden_cedars">{t.regions.ehden_cedars}</option>
                  <option value="tripoli_akkar">{t.regions.tripoli_akkar}</option>
                  <option value="matn">{t.regions.matn}</option>
                  <option value="chouf_aley">{t.regions.chouf_aley}</option>
                  <option value="tyre_south">{t.regions.tyre_south}</option>
                  <option value="sidon_jezzine">{t.regions.sidon_jezzine}</option>
                  <option value="zahle_bekaa">{t.regions.zahle_bekaa}</option>
                  <option value="baalbek_hermel">{t.regions.baalbek_hermel}</option>
                  <option value="west_bekaa_rashaya">{t.regions.west_bekaa_rashaya}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.postAd.address}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'قرب الساحة العامة، الشارع الرئيسي، مفرق التزلج...'
                      : lang === 'fr'
                      ? 'Près de la place principale, route du ski...'
                      : 'Near main square, central road, ski junction...'
                  }
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            {/* Price & Capacity */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.postAd.priceUSD} *
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.postAd.priceUnit}
                </label>
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value as PriceUnit)}
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 bg-white"
                >
                  <option value="per_night">{t.card.night}</option>
                  <option value="per_person">{t.card.person}</option>
                  <option value="per_month">{t.card.month}</option>
                  <option value="min_spend">{t.card.minSpend}</option>
                </select>
              </div>

              {category !== 'restaurant' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t.postAd.bedrooms}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t.postAd.maxGuests}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={maxGuests}
                      onChange={(e) => setMaxGuests(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 tabular-nums"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Amenities Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                {t.postAd.amenitiesSelect}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amenityList.map(({ key, label }) => {
                  const isChecked = selectedAmenities.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleAmenity(key)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs text-left rtl:text-right transition-all ${
                        isChecked
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-semibold'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <span className="truncate">{label}</span>
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                        isChecked ? 'bg-emerald-800 border-emerald-800 text-white' : 'border-stone-300'
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.postAd.descriptionAr} *
              </label>
              <textarea
                rows={3}
                required
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'صف تفاصيل المكان، الإطلالة، نظام الكهرباء، القرب من المعالم السياحية...'
                    : lang === 'fr'
                    ? 'Décrivez le lieu, la vue, l’électricité 24/24, proximité des sites...'
                    : 'Describe the property, scenic views, 24/7 power, proximity to landmarks...'
                }
                className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>

            {/* Host Details */}
            <div className="space-y-3 p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]"></span>
                <h4 className="text-xs font-bold text-stone-900">
                  {lang === 'ar' 
                    ? 'بيانات التواصل للإعلان (عبر واتساب المباشر)' 
                    : lang === 'fr'
                    ? 'Coordonnées de contact direct (WhatsApp)'
                    : 'Direct WhatsApp Contact Information'}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.postAd.hostName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: طوني عبود' : lang === 'fr' ? 'ex. Tony Abboud' : 'e.g. Tony Abboud'}
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.postAd.hostPhone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={hostPhone}
                    onChange={(e) => setHostPhone(e.target.value)}
                    placeholder="+961 70 000 000"
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center justify-between">
                    <span>{t.postAd.hostWhatsapp} *</span>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      {lang === 'ar' ? 'واتساب مباشر' : lang === 'fr' ? 'WhatsApp direct' : 'Direct WhatsApp'}
                    </span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={hostWhatsapp}
                    onChange={(e) => setHostWhatsapp(e.target.value)}
                    placeholder="96170000000"
                    className="w-full text-xs p-2.5 border-2 border-emerald-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono bg-white"
                  />
                </div>
              </div>

              <p className="text-[11px] text-emerald-800 font-medium">
                {lang === 'ar' 
                  ? '✓ سيتواصل معك الضيوف مباشرة عبر رقم الواتساب هذا فور تصفح الإعلان دون أي وسطاء أو عمولات.'
                  : lang === 'fr'
                  ? '✓ Les voyageurs vous contacteront directement sur ce numéro WhatsApp sans commission.'
                  : '✓ Guests will contact you directly on this WhatsApp number with zero commission.'}
              </p>
            </div>

            {/* Studio Photos & Video Upload Section */}
            <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-800" />
                    <Laptop className="w-4 h-4 text-emerald-800" />
                    <span>{t.postAd.uploadFromDeviceTitle}</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {lang === 'ar'
                      ? 'اختر صور وفيديوهات العقار مباشرة من استوديو هاتفك أو جهاز الكمبيوتر'
                      : lang === 'fr'
                      ? 'Sélectionnez photos et vidéos directement depuis la galerie de votre téléphone ou PC'
                      : 'Choose property photos and videos directly from your phone gallery or computer'}
                  </p>
                </div>

                {(uploadedImages.length > 0 || uploadedVideos.length > 0) && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    {uploadedImages.length > 0 && `${uploadedImages.length} ${lang === 'ar' ? 'صور' : lang === 'fr' ? 'photos' : 'photos'}`}
                    {uploadedImages.length > 0 && uploadedVideos.length > 0 && ' • '}
                    {uploadedVideos.length > 0 && `${uploadedVideos.length} ${lang === 'ar' ? 'فيديو' : lang === 'fr' ? 'vidéo' : 'video'}`}
                  </span>
                )}
              </div>

              {/* Hidden file inputs for phone camera roll / computer files */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleImageFiles(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleVideoFiles(e.target.files);
                    e.target.value = '';
                  }
                }}
              />

              {/* Drag & Drop Upload Zone & Action Buttons */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                  isDragging
                    ? 'border-emerald-700 bg-emerald-50/70 scale-[0.99]'
                    : 'border-stone-300 hover:border-emerald-600 bg-white'
                }`}
              >
                {isProcessingMedia ? (
                  <div className="py-4 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-800" />
                    <span className="text-xs font-semibold text-stone-700">
                      {lang === 'ar'
                        ? 'جاري استيراد وتحسين ملفات الصور والفيديو من الاستوديو...'
                        : lang === 'fr'
                        ? 'Importation et optimisation des médias depuis la galerie...'
                        : 'Importing and optimizing photos & video from studio...'}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                      {/* Upload Photos from Studio Button */}
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>{t.postAd.uploadPhotosBtn}</span>
                      </button>

                      {/* Upload Video from Studio Button */}
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        <span>{t.postAd.uploadVideoBtn}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500">
                      {t.postAd.dragDropNotice}
                    </p>
                  </div>
                )}
              </div>

              {/* Uploaded Images Gallery Preview */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-800" />
                      <span>{t.postAd.photosSelected} ({uploadedImages.length})</span>
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {lang === 'ar' ? 'انقر على النجمة لجعل الصورة غلافاً رئيسياً' : lang === 'fr' ? 'Cliquez sur l’étoile pour choisir la couverture' : 'Click star to set as main cover'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {uploadedImages.map((img, idx) => {
                      const isCover = idx === 0;
                      return (
                        <div
                          key={img.id}
                          className={`group relative rounded-xl overflow-hidden border-2 aspect-[4/3] bg-stone-100 shadow-xs transition-all ${
                            isCover ? 'border-amber-500 ring-2 ring-amber-400' : 'border-stone-200'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />

                          {/* Cover Badge */}
                          {isCover && (
                            <span className="absolute top-1.5 right-1.5 rtl:right-auto rtl:left-1.5 bg-amber-500 text-stone-950 font-bold text-[10px] px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                              <Star className="w-3 h-3 fill-stone-950" />
                              <span>{t.postAd.mainCover}</span>
                            </span>
                          )}

                          {/* Hover / Touch actions */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(img.id)}
                                className="px-2 py-1 rounded bg-amber-400 text-stone-900 font-bold text-[10px] hover:bg-amber-300 shadow-xs flex items-center gap-1"
                                title={t.postAd.setAsCover}
                              >
                                <Star className="w-3 h-3" />
                                <span>{t.postAd.setAsCover}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.id)}
                              className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-xs"
                              title={t.postAd.removeMedia}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* File info footer */}
                          <div className="absolute bottom-0 inset-x-0 bg-stone-950/70 text-white text-[9px] px-1.5 py-0.5 truncate flex justify-between">
                            <span className="truncate">{img.name}</span>
                            <span className="shrink-0 text-stone-300 font-mono ml-1">{img.size}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Uploaded Videos Preview */}
              {uploadedVideos.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span className="flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-purple-700" />
                      <span>{t.postAd.videosSelected} ({uploadedVideos.length})</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uploadedVideos.map((vid) => (
                      <div
                        key={vid.id}
                        className="relative rounded-xl overflow-hidden border-2 border-purple-400 bg-black shadow-sm group"
                      >
                        <div className="aspect-[16/9] w-full">
                          <video
                            src={vid.url}
                            controls
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Top bar with file name and remove button */}
                        <div className="p-2 bg-stone-900 text-white flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <Video className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="truncate font-medium text-[11px]">{vid.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono">({vid.size})</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(vid.id)}
                            className="text-stone-400 hover:text-rose-400 transition-colors p-1"
                            title={t.postAd.removeMedia}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curated Presets & Custom URL fallback */}
              {uploadedImages.length === 0 && (
                <div className="pt-2 border-t border-stone-200">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                    {t.postAd.imagePresetTitle}
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                    {presetImages.map(img => (
                      <div
                        key={img.url}
                        onClick={() => {
                          setSelectedImage(img.url);
                          setCustomImageUrl('');
                        }}
                        className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-[16/10] ${
                          selectedImage === img.url && !customImageUrl
                            ? 'border-emerald-800 ring-2 ring-emerald-800'
                            : 'border-stone-200 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 inset-x-1 text-[10px] font-bold bg-black/60 text-white px-1 py-0.5 rounded text-center truncate">
                          {img.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder={lang === 'ar' ? 'أو ضع رابط صورة جاهزة من الإنترنت (https://...)' : 'Or paste online image URL (https://...)'}
                    className="w-full text-xs p-2 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-700 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <div className="pt-3 border-t border-stone-200">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold text-sm shadow-md transition-colors"
              >
                {t.postAd.submitBtn}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
