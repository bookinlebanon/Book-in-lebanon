import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { Listing, Language } from '../types';
import { translations } from '../data/translations';
import { 
  X, 
  Camera, 
  Upload, 
  FlipHorizontal, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  ArrowRight,
  ExternalLink,
  Search
} from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  lang: Language;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  listings,
  onSelectListing,
  lang,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<Listing | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [manualError, setManualError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = translations[lang];

  // Stop video stream and scanning loop
  const stopStream = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Start camera stream
  const startCamera = async () => {
    stopStream();
    setCameraError(null);
    setScannedResult(null);

    // Verify browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        lang === 'ar'
          ? 'المتصفح لا يدعم الوصول المباشر للكاميرا. يمكنك اختيار صورة من جهازك.'
          : lang === 'fr'
          ? 'La caméra n’est pas prise en charge par ce navigateur. Vous pouvez importer une photo.'
          : 'Camera is not supported on this browser. You can upload an image instead.'
      );
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().then(() => {
          setIsScanning(true);
          scanFrame();
        }).catch((err) => {
          console.warn('Video play failed:', err);
        });
      }
    } catch (err: unknown) {
      console.warn('Camera access denied or failed:', err);
      setCameraError(
        lang === 'ar'
          ? 'تعذر تشغيل الكاميرا (يرجى التحقق من أذونات الكاميرا). يمكنك رفع صورة QR أو اختيار تجربة سريعة.'
          : lang === 'fr'
          ? 'Impossible d’accéder à la caméra. Vérifiez les autorisations ou importez une photo.'
          : 'Could not access camera. Please check permissions or upload a QR image.'
      );
    }
  };

  // Frame processing loop
  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      handleCodeDetected(code.data);
      return; // Stop scanning once detected
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Process the QR raw data to find matching listing
  const handleCodeDetected = (rawData: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch {
      // Ignore vibration error
    }

    const trimmed = rawData.trim();

    // Check if it's JSON
    let matchedListing: Listing | undefined;
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        const id = parsed.id || parsed.listingId;
        if (id) {
          matchedListing = listings.find((l) => l.id === id);
        }
      } catch {
        // Not valid JSON, continue with string search
      }
    }

    // Check if it's a URL like .../?listing=ID or ...#listing-ID
    if (!matchedListing) {
      const urlMatch = trimmed.match(/[?&]listing=([^&#]+)/) || trimmed.match(/\/listing\/([^/?#]+)/);
      if (urlMatch && urlMatch[1]) {
        matchedListing = listings.find((l) => l.id === urlMatch[1]);
      }
    }

    // Direct ID match
    if (!matchedListing) {
      matchedListing = listings.find(
        (l) => l.id.toLowerCase() === trimmed.toLowerCase() || trimmed.toLowerCase().includes(l.id.toLowerCase())
      );
    }

    // Title match fallback
    if (!matchedListing) {
      matchedListing = listings.find(
        (l) =>
          l.title.ar.toLowerCase().includes(trimmed.toLowerCase()) ||
          l.title.en.toLowerCase().includes(trimmed.toLowerCase())
      );
    }

    if (matchedListing) {
      stopStream();
      setScannedResult(matchedListing);
      // Automatically redirect after brief visual celebration
      setTimeout(() => {
        onClose();
        onSelectListing(matchedListing!);
      }, 900);
    } else {
      setCameraError(
        lang === 'ar'
          ? `تم قراءة الرمز (${trimmed.slice(0, 30)}) ولكن لم يتم العثور على عقار مسجل بهذا المعرّف.`
          : lang === 'fr'
          ? `Code détecté (${trimmed.slice(0, 30)}) mais aucun bien trouvé.`
          : `Code scanned (${trimmed.slice(0, 30)}) but no matching property found.`
      );
    }
  };

  // Handle image upload from device/phone gallery
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleCodeDetected(code.data);
        } else {
          setCameraError(
            lang === 'ar'
              ? 'لم يتم التعرف على رمز QR داخل هذه الصورة. حاول رفع صورة أكثر وضوحاً.'
              : lang === 'fr'
              ? 'Aucun code QR détecté dans cette image. Essayez avec une photo plus nette.'
              : 'No QR code found in this image. Please try a clearer picture.'
          );
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Toggle front/back camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Manual code submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const found = listings.find(
      (l) =>
        l.id.toLowerCase() === manualCode.trim().toLowerCase() ||
        l.title.en.toLowerCase().includes(manualCode.trim().toLowerCase()) ||
        l.title.ar.toLowerCase().includes(manualCode.trim().toLowerCase())
    );
    if (found) {
      setManualError(false);
      stopStream();
      onClose();
      onSelectListing(found);
    } else {
      setManualError(true);
    }
  };

  // Quick scan simulation for testing
  const handleSimulateScan = (listing: Listing) => {
    stopStream();
    setScannedResult(listing);
    setTimeout(() => {
      onClose();
      onSelectListing(listing);
    }, 700);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setScannedResult(null);
      setCameraError(null);
      setManualCode('');
      setManualError(false);
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-stone-900 text-white rounded-none sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-stone-800 flex flex-col h-full sm:h-auto max-h-none sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800/80 bg-stone-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <QrCode className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>{lang === 'ar' ? 'مسح رمز QR للعقار' : lang === 'fr' ? 'Scanner le QR Code' : 'Scan Property QR Code'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">Live</span>
              </h2>
              <p className="text-[11px] text-stone-400">
                {lang === 'ar' ? 'امسح الرمز الموجود في الموقع الفعلي' : lang === 'fr' ? 'Scannez le code affiché sur place' : 'Scan on-site at the property'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport Section */}
        <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
          {/* Hidden Canvas for QR processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* HTML5 Video Element */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Success Overlay when detected */}
          {scannedResult ? (
            <div className="absolute inset-0 z-20 bg-emerald-950/90 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase mb-1">
                {lang === 'ar' ? 'تم التعرف بنجاح!' : lang === 'fr' ? 'Propriété trouvée !' : 'Property Recognized!'}
              </span>
              <h3 className="text-base font-extrabold text-white mb-1">
                {scannedResult.title[lang] || scannedResult.title.en}
              </h3>
              <p className="text-xs text-stone-300 mb-3">
                {scannedResult.city[lang] || scannedResult.city.en} · ${scannedResult.priceUSD} USD
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                <span>{lang === 'ar' ? 'جارٍ فتح تفاصيل العقار...' : lang === 'fr' ? 'Ouverture des détails...' : 'Opening property details...'}</span>
              </div>
            </div>
          ) : (
            /* Target Viewfinder Reticle */
            <div className="relative z-10 w-64 h-64 border border-white/20 rounded-2xl flex items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

              {/* Animated Laser Scan Bar */}
              <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[pulse_2s_infinite]" 
                style={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />

              {/* Centered instruction if no video yet */}
              {cameraError && (
                <div className="p-4 bg-stone-900/90 rounded-xl text-center max-w-[220px] border border-stone-700">
                  <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-[11px] text-stone-300 leading-tight">
                    {cameraError}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Camera controls toolbar overlaid at bottom of video */}
          <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between">
            {/* Flip camera */}
            <button
              onClick={handleFlipCamera}
              className="p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-200 backdrop-blur-md border border-stone-700 active:scale-95 transition-all text-xs flex items-center gap-1.5"
              title="Flip camera"
            >
              <FlipHorizontal className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">
                {lang === 'ar' ? 'تبديل الكاميرا' : 'Flip'}
              </span>
            </button>

            {/* Upload from Phone Gallery or Computer */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white backdrop-blur-md shadow-md active:scale-95 transition-all text-xs font-bold flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>
                {lang === 'ar' ? 'اختر صورة من الاستوديو' : lang === 'fr' ? 'Importer photo' : 'Upload QR Image'}
              </span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Interactive Bottom Sheet Area: Quick Demos & Manual ID */}
        <div className="p-4 overflow-y-auto space-y-4 bg-stone-900 text-stone-200">
          
          {/* Quick Demo Scanner Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {lang === 'ar' ? 'تجربة سريعة للرموز (بدون طباعة):' : lang === 'fr' ? 'Tester avec un exemple :' : 'Quick Test Real Listings:'}
                </span>
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {listings.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSimulateScan(item)}
                  className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 text-left rtl:text-right transition-all active:scale-95 group text-xs flex flex-col justify-between h-18"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-semibold text-emerald-400 line-clamp-1">
                      {item.city[lang] || item.city.en}
                    </span>
                    <QrCode className="w-3 h-3 text-stone-400 group-hover:text-emerald-400" />
                  </div>
                  <span className="font-bold text-white text-[11px] line-clamp-1 group-hover:text-emerald-300">
                    {item.title[lang] || item.title.en}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    ${item.priceUSD} USD
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual ID Input */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-stone-800">
            <label className="block text-[11px] font-medium text-stone-400 mb-1.5">
              {lang === 'ar' ? 'أو أدخل كود العقار يدوياً:' : lang === 'fr' ? 'Ou entrez l’ID du bien :' : 'Or enter property ID manually:'}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value);
                    if (manualError) setManualError(false);
                  }}
                  placeholder={lang === 'ar' ? 'مثال: bil-chalet-faraya-01' : 'e.g. bil-chalet-faraya-01'}
                  className="w-full bg-stone-800 text-white placeholder-stone-500 text-xs py-2 px-8 rounded-xl border border-stone-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shrink-0"
              >
                {lang === 'ar' ? 'فتح' : lang === 'fr' ? 'Voir' : 'Open'}
              </button>
            </div>
            {manualError && (
              <p className="text-[11px] text-rose-400 mt-1">
                {lang === 'ar' ? 'لم يتم العثور على عقار بهذا الكود.' : 'Property not found with this code.'}
              </p>
            )}
          </form>

        </div>
      </div>
    </div>
  );
};
