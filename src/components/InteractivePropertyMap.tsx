import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Language, Region } from '../types';
import { getListingCoordinates, LocationCoords } from '../utils/lebanonLocations';
import { MapPin, Navigation, Copy, Check, ExternalLink, Compass, ZoomIn, ZoomOut } from 'lucide-react';

interface InteractivePropertyMapProps {
  coordinates?: { lat: number; lng: number };
  region?: Region;
  title: string;
  city: string;
  address: string;
  lang: Language;
  priceUSD?: number;
  thumbnailUrl?: string;
}

export const InteractivePropertyMap: React.FC<InteractivePropertyMapProps> = ({
  coordinates,
  region,
  title,
  city,
  address,
  lang,
  priceUSD,
  thumbnailUrl,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [copied, setCopied] = useState(false);

  const coords: LocationCoords = getListingCoordinates(coordinates, region, city);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy prior map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const { lat, lng } = coords;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
      scrollWheelZoom: false, // Prevents scroll hijacking on mobile/desktop modal
      zoomControl: false, // We provide modern custom controls
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // High quality, fast, and responsive OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Custom Lebanon Pin
    const pinHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-pointer group">
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-500 opacity-60"></span>
        <div class="relative flex items-center justify-center w-10 h-10 bg-emerald-800 text-white rounded-full shadow-xl border-2 border-white transform transition-transform group-hover:scale-110">
          <span class="text-base leading-none select-none">🇱🇧</span>
        </div>
        <div class="w-2.5 h-2.5 bg-emerald-900 rotate-45 -mt-1.5 shadow-md border-r border-b border-white"></div>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'bg-transparent border-0',
      html: pinHtml,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -48],
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    markerRef.current = marker;

    // Rich popup inside map
    const safeTitle = title.replace(/"/g, '&quot;');
    const safeCity = city.replace(/"/g, '&quot;');
    const popupContent = `
      <div style="font-family: inherit; direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; text-align: ${lang === 'ar' ? 'right' : 'left'}; max-width: 220px;">
        ${thumbnailUrl ? `<img src="${thumbnailUrl}" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" alt="${safeTitle}"/>` : ''}
        <div style="font-size: 13px; font-weight: 800; color: #1c1917; line-height: 1.3; margin-bottom: 3px;">${safeTitle}</div>
        <div style="font-size: 11px; color: #065f46; font-weight: 700; margin-bottom: 2px;">📍 ${safeCity}</div>
        ${priceUSD ? `<div style="font-size: 12px; font-weight: 800; color: #047857;">$${priceUSD} USD</div>` : ''}
      </div>
    `;

    marker.bindPopup(popupContent, {
      closeButton: false,
      offset: [0, -10],
    });

    // Ensure map tiles adjust properly inside dialog modal
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords.lat, coords.lng, lang, title, city, priceUSD, thumbnailUrl]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 14, { animate: true });
      markerRef.current?.openPopup();
    }
  };

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyCoords = () => {
    const text = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-t border-stone-200 pt-5 space-y-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-800" />
            <span>
              {lang === 'ar' 
                ? 'موقع العقار على الخريطة التفاعلية' 
                : lang === 'fr' 
                ? 'Localisation sur la carte interactive' 
                : 'Property Location on Interactive Map'}
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {address} · {city} (لبنان 🇱🇧)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Copy Coordinates */}
          <button
            type="button"
            onClick={handleCopyCoords}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title={lang === 'ar' ? 'نسخ الإحداثيات' : 'Copy Coordinates'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-800 font-bold">
                  {lang === 'ar' ? 'تم النسخ!' : lang === 'fr' ? 'Copié !' : 'Copied!'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>
                  {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </span>
              </>
            )}
          </button>

          {/* Open Directions in Google Maps */}
          <button
            type="button"
            onClick={handleOpenGoogleMaps}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>
              {lang === 'ar' 
                ? 'التوجيه في خرائط Google' 
                : lang === 'fr' 
                ? 'Itinéraire Google Maps' 
                : 'Google Maps Directions'}
            </span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>
        </div>
      </div>

      {/* Map Container Box */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-stone-300 shadow-inner bg-stone-100 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Custom Modern Map Controls */}
        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 flex flex-col gap-1.5 bg-white/95 backdrop-blur-sm p-1 rounded-xl shadow-md border border-stone-200">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-700 font-bold transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="h-px bg-stone-200 my-0.5" />

          <button
            type="button"
            onClick={handleRecenter}
            className="w-8 h-8 rounded-lg hover:bg-emerald-50 text-emerald-800 flex items-center justify-center transition-colors cursor-pointer"
            title={lang === 'ar' ? 'إعادة التوسيط على العقار' : 'Recenter on Property'}
            aria-label="Recenter"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle Map Status Overlay Footer */}
        <div className="absolute bottom-2 left-2 rtl:left-auto rtl:right-2 z-10 px-2.5 py-1 rounded-lg bg-black/65 backdrop-blur-sm text-white text-[11px] font-medium flex items-center gap-1.5 pointer-events-none shadow-xs">
          <span>🇱🇧</span>
          <span>{city}</span>
          <span className="opacity-60">· OpenStreetMap</span>
        </div>
      </div>
    </div>
  );
};
