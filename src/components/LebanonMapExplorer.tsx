import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Listing, Language, Region, Currency } from '../types';
import { translations } from '../data/translations';
import { 
  getListingCoordinates, 
  LEBANON_REGION_COORDINATES 
} from '../utils/lebanonLocations';
import { 
  MapPin, 
  Maximize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Star, 
  Calendar, 
  ArrowRight,
  ExternalLink,
  X,
  Compass,
  Building2,
  Sparkles
} from 'lucide-react';

interface LebanonMapExplorerProps {
  listings: Listing[];
  selectedListing?: Listing | null;
  onSelectListing: (listing: Listing) => void;
  onDirectBook?: (listing: Listing) => void;
  lang: Language;
  currency: Currency;
  activeRegion?: Region;
  onSelectRegion?: (region: Region) => void;
  className?: string;
  isCompact?: boolean;
}

export const LebanonMapExplorer: React.FC<LebanonMapExplorerProps> = ({
  listings,
  selectedListing,
  onSelectListing,
  onDirectBook,
  lang,
  currency,
  activeRegion = 'all',
  onSelectRegion,
  className = '',
  isCompact = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [activeListing, setActiveListing] = useState<Listing | null>(selectedListing || null);
  const [tileTheme, setTileTheme] = useState<'standard' | 'light' | 'terrain'>('standard');

  const t = translations[lang];

  // Tile layer URL options
  const tileUrls = {
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  };

  // Quick region zoom targets across Lebanon
  const regionShortcuts: { region: Region; label: string; icon: string }[] = [
    { region: 'all', label: lang === 'ar' ? 'كل لبنان' : 'All Lebanon', icon: '🇱🇧' },
    { region: 'beirut', label: lang === 'ar' ? 'بيروت' : 'Beirut', icon: '🏙️' },
    { region: 'keserwan', label: lang === 'ar' ? 'فاريا' : 'Faraya', icon: '⛷️' },
    { region: 'batroun', label: lang === 'ar' ? 'البترون' : 'Batroun', icon: '🏖️' },
    { region: 'jbeil', label: lang === 'ar' ? 'جبيل' : 'Byblos', icon: '🏰' },
    { region: 'ehden_cedars', label: lang === 'ar' ? 'الأرز وإهدن' : 'Cedars', icon: '🌲' },
    { region: 'tyre_south', label: lang === 'ar' ? 'صور' : 'Tyre', icon: '🌊' },
    { region: 'zahle_bekaa', label: lang === 'ar' ? 'زحلة' : 'Zahle', icon: '🍇' },
    { region: 'chouf_aley', label: lang === 'ar' ? 'الشوف' : 'Chouf', icon: '🌿' },
  ];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center for Lebanon
    const defaultCenter: [number, number] = [33.8547, 35.8623];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: isCompact ? 9 : 10,
      zoomControl: false,
      attributionControl: false,
      minZoom: 8,
      maxZoom: 18,
    });

    mapInstanceRef.current = map;

    // Base tile layer
    const tileLayer = L.tileLayer(tileUrls[tileTheme], {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Layer group for property markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Lebanon geographic boundary bounds
    const southWest = L.latLng(33.05, 35.05);
    const northEast = L.latLng(34.75, 36.65);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer if theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    L.tileLayer(tileUrls[tileTheme], {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstanceRef.current);
  }, [tileTheme]);

  // Update Markers when listings change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (listings.length === 0) return;

    const bounds = L.latLngBounds([]);

    listings.forEach((listing) => {
      const coords = getListingCoordinates(
        listing.coordinates,
        listing.region,
        listing.city.en || listing.city.ar,
        listing.id
      );

      const latLng: [number, number] = [coords.lat, coords.lng];
      bounds.extend(latLng);

      const isSelected = activeListing?.id === listing.id;
      const localizedTitle = listing.title[lang] || listing.title.en || listing.title.ar;
      const localizedCity = listing.city[lang] || listing.city.en || listing.city.ar;
      const categoryIcon = 
        listing.category === 'chalet' ? '🏡' :
        listing.category === 'restaurant' ? '🍽️' :
        listing.category === 'guesthouse' ? '🌿' :
        listing.category === 'studio' ? '🛋️' :
        listing.category === 'hotel' ? '🏨' : '🔑';

      // Custom HTML pill marker like Airbnb / Booking
      const markerHtml = `
        <div class="relative group cursor-pointer transition-all duration-200 transform ${
          isSelected ? 'scale-115 z-30' : 'hover:scale-110 z-10'
        }">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg border-2 transition-all font-mono font-bold text-xs ${
            isSelected 
              ? 'bg-emerald-800 text-white border-white ring-4 ring-emerald-500/40' 
              : 'bg-white text-stone-900 border-stone-200 hover:border-emerald-700 hover:text-emerald-900'
          }">
            <span class="text-xs leading-none select-none">${categoryIcon}</span>
            <span class="tabular-nums font-extrabold leading-none">$${listing.priceUSD}</span>
          </div>
          <div class="w-2 h-2 mx-auto rotate-45 -mt-1 shadow-xs ${
            isSelected ? 'bg-emerald-800' : 'bg-white'
          }"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'bg-transparent border-0',
        html: markerHtml,
        iconSize: [80, 36],
        iconAnchor: [40, 36],
      });

      const marker = L.marker(latLng, { icon: customIcon });

      marker.on('click', () => {
        setActiveListing(listing);
        mapInstanceRef.current?.flyTo(latLng, Math.max(mapInstanceRef.current.getZoom(), 13), {
          duration: 0.8,
        });
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // Fit map bounds if region is 'all' or when listings change
    if (activeRegion === 'all' && listings.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [listings, activeListing, lang]);

  // Sync activeRegion pan
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (activeRegion && activeRegion !== 'all') {
      const targetCoords = LEBANON_REGION_COORDINATES[activeRegion];
      if (targetCoords) {
        mapInstanceRef.current.flyTo([targetCoords.lat, targetCoords.lng], 12, {
          duration: 1.2,
        });
      }
    } else if (activeRegion === 'all' && listings.length > 0) {
      const bounds = L.latLngBounds(
        listings.map((l) => {
          const c = getListingCoordinates(l.coordinates, l.region, l.city.en, l.id);
          return [c.lat, c.lng];
        })
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [activeRegion]);

  // Controls Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetLebanonView = () => {
    if (!mapInstanceRef.current) return;
    if (onSelectRegion) onSelectRegion('all');
    mapInstanceRef.current.flyTo([33.8547, 35.8623], isCompact ? 9 : 9.5, { duration: 1 });
  };

  const handleRegionClick = (r: Region) => {
    if (onSelectRegion) onSelectRegion(r);
    const coords = LEBANON_REGION_COORDINATES[r];
    if (coords && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], r === 'all' ? 9.5 : 12.5, {
        duration: 1,
      });
    }
  };

  return (
    <div className={`relative rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 shadow-lg bg-stone-100 flex flex-col ${className}`}>
      
      {/* Top Floating Region Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between gap-2 pointer-events-none">
        {/* Scrollable Region Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-stone-200 shadow-md max-w-full">
          {regionShortcuts.map((chip) => {
            const isActive = activeRegion === chip.region;
            return (
              <button
                key={chip.region}
                type="button"
                onClick={() => handleRegionClick(chip.region)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Places Count Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/85 backdrop-blur-md text-white text-xs font-bold shadow-md shrink-0 pointer-events-auto">
          <span>🇱🇧</span>
          <span className="tabular-nums font-mono">{listings.length}</span>
          <span>{lang === 'ar' ? 'مكان' : 'places'}</span>
        </div>
      </div>

      {/* Floating Action Controls on Right Side (Zoom + Reset + Tile Style) */}
      <div className="absolute bottom-20 sm:bottom-6 right-3 sm:right-4 z-[400] flex flex-col items-center gap-2">
        {/* Zoom Controls */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-lg p-1 flex flex-col items-center">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
            title={t.filter.showMap}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-5 h-px bg-stone-200 my-0.5" />
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Fit Bounds / Reset to whole Lebanon */}
        <button
          type="button"
          onClick={handleResetLebanonView}
          className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-lg flex items-center justify-center text-stone-700 hover:text-emerald-800 hover:bg-emerald-50 transition-all cursor-pointer"
          title={t.filter.fitBounds}
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Actual Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full flex-1 min-h-[460px] sm:min-h-[560px] z-0" 
      />

      {/* Selected Property Bottom Preview Card (Floating Sheet, elevated above mobile bottom nav) */}
      {activeListing && (
        <div className="absolute bottom-20 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-auto sm:w-96 z-[400] animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-stone-200 relative text-left rtl:text-right">
            {/* Close card button */}
            <button
              type="button"
              onClick={() => setActiveListing(null)}
              className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3">
              <img
                src={activeListing.images[0]}
                alt={activeListing.title[lang] || activeListing.title.en}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 border border-stone-200"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 mb-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">
                    {activeListing.city[lang] || activeListing.city.en} · {t.regions[activeListing.region]}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-black text-stone-900 truncate leading-snug">
                  {activeListing.title[lang] || activeListing.title.en}
                </h4>

                <div className="flex items-center gap-1.5 my-1 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{activeListing.rating}</span>
                  </div>
                  <span className="text-stone-300">·</span>
                  <span className="font-extrabold text-stone-900 tabular-nums">
                    ${activeListing.priceUSD} USD
                  </span>
                  <span className="text-[10px] text-stone-400">
                    / {activeListing.category === 'restaurant' ? t.card.person : t.card.night}
                  </span>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => onSelectListing(activeListing)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold text-center transition-colors cursor-pointer"
                  >
                    {t.card.viewDetails}
                  </button>

                  {onDirectBook && (
                    <button
                      type="button"
                      onClick={() => onDirectBook(activeListing)}
                      className="py-1.5 px-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t.card.bookNow}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
