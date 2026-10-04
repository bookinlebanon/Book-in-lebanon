import React, { useState, useEffect, useMemo } from 'react';
import { 
  Language, 
  Currency, 
  Category, 
  Region, 
  Amenity, 
  Listing, 
  Booking, 
  FilterState, 
  Review,
  User,
  AppNotification,
  ChatConversation,
  ChatMessage,
  PromotionTier,
  PaymentMethod
} from './types';
import { initialListings } from './data/initialListings';
import { initialConversations } from './data/initialConversations';
import { translations, LBP_RATE } from './data/translations';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { ListingCard } from './components/ListingCard';
import { FilterDrawer } from './components/FilterDrawer';
import { ListingDetailModal } from './components/ListingDetailModal';
import { DirectBookingModal } from './components/DirectBookingModal';
import { PostAdModal } from './components/PostAdModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { FavoritesModal } from './components/FavoritesModal';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';
import { BecomeHostModal } from './components/BecomeHostModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AdminModal } from './components/AdminModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileSettingsSheet } from './components/MobileSettingsSheet';
import { Footer } from './components/Footer';
import { QrScannerModal } from './components/QrScannerModal';
import { PropertyQrModal } from './components/PropertyQrModal';
import { ChatModal } from './components/ChatModal';
import { PromoteListingModal } from './components/PromoteListingModal';
import { FeaturedSection } from './components/FeaturedSection';
import { LebanonMapExplorer } from './components/LebanonMapExplorer';
import { SlidersHorizontal, RotateCcw, Sparkles, Crown, LayoutGrid, Map, Columns } from 'lucide-react';

const STORAGE_LISTINGS_KEY = 'book_in_lebanon_custom_listings';
const STORAGE_BOOKINGS_KEY = 'book_in_lebanon_bookings';
const STORAGE_FAVORITES_KEY = 'book_in_lebanon_favorites';
const STORAGE_LANG_KEY = 'book_in_lebanon_lang';
const STORAGE_CURRENCY_KEY = 'book_in_lebanon_currency';
const STORAGE_USER_KEY = 'book_in_lebanon_user';
const STORAGE_NOTIFICATIONS_KEY = 'book_in_lebanon_notifications';
const STORAGE_CONVERSATIONS_KEY = 'book_in_lebanon_conversations';

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'طلب استفسار عبر واتساب 💬',
    message: 'استفسار جديد من زائر مهتم بشاليه الأرز الفاخر في فاريا مزار لعطلة نهاية الأسبوع.',
    date: 'منذ 15 دقيقة',
    read: false,
    type: 'inquiry',
  },
  {
    id: 'notif-2',
    title: 'تأكيد حجز مباشر في البترون 🏖️',
    message: 'تم تسجيل وتأكيد حجز ضيف في بيت ضيافة البترون التراثي القديم (2 ليلة).',
    date: 'منذ ساعتين',
    read: false,
    type: 'booking',
  },
  {
    id: 'notif-3',
    title: 'شارة مضيف موثق ومعتمد 🛡️',
    message: 'تهانينا! حسابك مؤهل لشارة الموثوقية الرسمية لزيادة ثقة المستأجرين بنسبة 40%.',
    date: 'اليوم 10:30 ص',
    read: false,
    type: 'system',
  },
  {
    id: 'notif-4',
    title: 'موسم الشتاء والسياحة في جبال لبنان ❄️',
    message: 'ارتفاع الطلب على شاليهات التزلج في فاريا وفقرا والأرز. احجز مسبقاً قبل نفاد الأماكن.',
    date: 'أمس',
    read: true,
    type: 'promo',
  },
];

export default function App() {
  // Language & Direction
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    return (saved as Language) || 'ar';
  });

  // Currency
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem(STORAGE_CURRENCY_KEY);
    return (saved as Currency) || 'USD';
  });

  // Sync HTML dir and lang
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_LANG_KEY, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CURRENCY_KEY, currency);
  }, [currency]);

  // Listings State
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LISTINGS_KEY);
      if (stored) {
        const custom: Listing[] = JSON.parse(stored);
        return [...custom, ...initialListings].map(l => ({
          ...l,
          images: l.images.map(img => img.replace('/src/assets/images/', 'images/'))
        }));
      }
    } catch (e) {
      console.error('Error loading stored listings', e);
    }
    return initialListings;
  });

  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_BOOKINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading bookings', e);
    }
    return [];
  });

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_FAVORITES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading favorites', e);
    }
    return [];
  });

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    category: 'all',
    region: 'all',
    minPrice: 0,
    maxPrice: 600,
    minRating: 0,
    amenities: [],
    sortBy: 'featured',
  });

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading stored user', e);
    }
    return {
      id: 'user-charbel-01',
      name: 'شربل الحايك',
      email: 'charbel@lebanonchalets.com',
      phone: '+961 70 829 110',
      whatsapp: '96170829110',
      role: 'host',
      isVerifiedHost: true,
      joinedDate: '2025-06-10',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    };
  });

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading notifications', e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  // Modals Visibility
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareListing, setShareListing] = useState<Listing | null>(null);
  const [mobileActiveTab, setMobileActiveTab] = useState<'explore' | 'favorites' | 'bookings'>('explore');
  const [selectedListingDetail, setSelectedListingDetail] = useState<Listing | null>(null);
  const [directBookingListing, setDirectBookingListing] = useState<Listing | null>(null);

  // New Modals for requested features
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isBecomeHostOpen, setIsBecomeHostOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrListingTarget, setQrListingTarget] = useState<Listing | null>(null);

  // In-App Chat & Messaging State
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
      if (stored) {
        const parsed: ChatConversation[] = JSON.parse(stored);
        return parsed.map((c) => ({
          ...c,
          listingImage: c.listingImage?.replace('/src/assets/images/', 'images/'),
          messages: c.messages.map((m) => ({
            ...m,
            mediaUrl: m.mediaUrl?.replace('/src/assets/images/', 'images/'),
          })),
        }));
      }
    } catch (e) {
      console.error('Error loading conversations', e);
    }
    return initialConversations;
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatConvId, setActiveChatConvId] = useState<string | null>(null);

  // Browse View Mode State (Grid, Interactive Lebanon Map, Split)
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'split'>('grid');

  // Promote / Featured Listing Modal State
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [promoteTargetListing, setPromoteTargetListing] = useState<Listing | null>(null);

  const handleOpenPromote = (targetListing?: Listing | null) => {
    setPromoteTargetListing(targetListing || null);
    setIsPromoteOpen(true);
  };

  const handlePromoteSuccess = (
    listingId: string,
    tier: PromotionTier,
    days: number,
    priceUSD: number,
    paymentMethod: PaymentMethod,
    refCode: string
  ) => {
    const promotedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setListings(prev => {
      const updated = prev.map(l => {
        if (l.id === listingId) {
          return {
            ...l,
            featured: true,
            promotionTier: tier,
            promotedUntil,
          };
        }
        return l;
      });
      try {
        localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(updated.filter(l => l.isUserListing)));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (selectedListingDetail?.id === listingId) {
      setSelectedListingDetail(prev => prev ? {
        ...prev,
        featured: true,
        promotionTier: tier,
        promotedUntil,
      } : null);
    }

    // Add celebration notification
    const newNotif: AppNotification = {
      id: `notif-promote-${Date.now()}`,
      title: lang === 'ar' ? '⭐ تم ترقية الإعلان بنجاح!' : '⭐ Listing Promoted Successfully!',
      message: lang === 'ar' 
        ? `أصبح إعلانك الآن في صدارة الإعلانات المميزة على منصة Book in Lebanon لمدة ${days} يوماً.`
        : `Your listing is now featured in the top spotlight on Book in Lebanon for ${days} days.`,
      date: new Date().toISOString().split('T')[0],
      read: false,
      type: 'promo',
      listingId,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const handleSendMessage = (conversationId: string, msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString(lang === 'ar' ? 'ar-LB' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeStr,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessageTime: timeStr,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );
  };

  const handleStartChatWithHost = (listing: Listing) => {
    let conv = conversations.find(
      (c) => c.listingId === listing.id || (c.hostPhone && c.hostPhone === listing.host.phone)
    );

    if (!conv) {
      const newConv: ChatConversation = {
        id: `conv-${listing.id}-${Date.now()}`,
        hostName: listing.host.name,
        hostPhone: listing.host.phone,
        hostWhatsapp: listing.host.whatsapp,
        hostVerified: listing.host.verified,
        listingId: listing.id,
        listingTitle: listing.title[lang] || listing.title.en,
        listingImage: listing.images[0] || '',
        listingPriceUSD: listing.priceUSD,
        listingCity: listing.city[lang] || listing.city.en,
        unreadCount: 0,
        lastMessageTime: 'الآن',
        messages: [
          {
            id: `msg-init-${Date.now()}`,
            sender: 'host',
            type: 'text',
            text: lang === 'ar' 
              ? `أهلاً بك! أنا ${listing.host.name}، مضيف ${listing.title[lang] || listing.title.en}. يسعدني الإجابة على استفساراتك وتأكيد التواريخ أو ترتيب أي تفاصيل خاصة 🇱🇧`
              : `Welcome! I am ${listing.host.name}, host of ${listing.title.en}. I'm happy to assist with any questions or bookings!`,
            timestamp: 'الآن',
            status: 'delivered',
          }
        ]
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveChatConvId(newConv.id);
    } else {
      setActiveChatConvId(conv.id);
    }

    setIsChatOpen(true);
    setSelectedListingDetail(null);
  };

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // User auth handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    showToast(
      lang === 'ar' 
        ? 'تم تسجيل الخروج بنجاح' 
        : lang === 'fr' 
        ? 'Déconnexion réussie' 
        : 'Signed out successfully'
    );
  };

  // Notifications handlers
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify([]));
    showToast(
      lang === 'ar' 
        ? 'تم مسح الإشعارات' 
        : lang === 'fr' 
        ? 'Notifications effacées' 
        : 'Notifications cleared'
    );
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setIsNotificationsOpen(false);
    if (notif.type === 'booking') {
      setIsMyBookingsOpen(true);
    } else if (listings.length > 0) {
      setSelectedListingDetail(listings[0]);
    }
  };

  const handleBroadcastNotification = (title: string, message: string) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      date: lang === 'ar' ? 'الآن' : lang === 'fr' ? 'À l’instant' : 'Just now',
      read: false,
      type: 'promo',
    };
    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Admin handlers
  const handleToggleFeatured = (listingId: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, featured: !l.featured } : l))
    );
    showToast(
      lang === 'ar' 
        ? 'تم تحديث حالة تمييز الإعلان' 
        : lang === 'fr' 
        ? 'Statut de mise en avant mis à jour' 
        : 'Listing featured status updated'
    );
  };

  const handleToggleVerifiedHost = (listingId: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId
          ? { ...l, host: { ...l.host, verified: !l.host.verified } }
          : l
      )
    );
    showToast(
      lang === 'ar' 
        ? 'تم تحديث توثيق المضيف' 
        : lang === 'fr' 
        ? 'Vérification de l’hôte mise à jour' 
        : 'Host verification updated'
    );
  };

  const handleDeleteListing = (listingId: string) => {
    setListings((prev) => prev.filter((l) => l.id !== listingId));
    showToast(
      lang === 'ar' 
        ? 'تم حذف الإعلان من المنصة' 
        : lang === 'fr' 
        ? 'Annonce supprimée' 
        : 'Listing deleted'
    );
  };

  // Toggle favorite handler
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(next));
      showToast(
        exists
          ? lang === 'ar'
            ? 'تمت الإزالة من المفضلة'
            : lang === 'fr'
            ? 'Retiré des favoris'
            : 'Removed from favorites'
          : lang === 'ar'
          ? 'تمت الإضافة إلى المفضلة ❤️'
          : lang === 'fr'
          ? 'Ajouté aux favoris ❤️'
          : 'Added to favorites ❤️'
      );
      return next;
    });
  };

  // Confirm booking handler
  const handleConfirmBooking = (newBooking: Booking) => {
    setBookings((prev) => {
      const next = [newBooking, ...prev];
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(next));
      return next;
    });
    showToast(
      lang === 'ar'
        ? `تم تأكيد حجزك بنجاح! رقم الحجز: ${newBooking.id}`
        : lang === 'fr'
        ? `Réservation confirmée ! Réf: ${newBooking.id}`
        : `Booking confirmed! Reference: ${newBooking.id}`
    );
  };

  // Cancel booking handler
  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) => {
      const next = prev.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      );
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(next));
      return next;
    });
    showToast(
      lang === 'ar' 
        ? 'تم إلغاء الحجز' 
        : lang === 'fr' 
        ? 'Réservation annulée' 
        : 'Booking cancelled'
    );
  };

  // Add listing handler
  const handleAddListing = (newListing: Listing) => {
    setListings((prev) => {
      const next = [newListing, ...prev];
      // Store only custom ones in storage
      const userListings = next.filter((l) => l.isUserListing);
      localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(userListings));
      return next;
    });
    showToast(
      lang === 'ar'
        ? 'تم نشر إعلانك الجديد بنجاح على Book in Lebanon! 🇱🇧'
        : lang === 'fr'
        ? 'Votre annonce est publiée avec succès sur Book in Lebanon ! 🇱🇧'
        : 'Your listing is live on Book in Lebanon! 🇱🇧'
    );
  };

  // Add review handler
  const handleAddReview = (listingId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: reviewData.author,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: new Date().toISOString().split('T')[0],
    };

    setListings((prev) =>
      prev.map((l) => {
        if (l.id === listingId) {
          const updatedReviews = [newRev, ...l.reviews];
          const newAvg =
            updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
          const updated = {
            ...l,
            reviews: updatedReviews,
            reviewsCount: updatedReviews.length,
            rating: Number(newAvg.toFixed(2)),
          };
          if (selectedListingDetail?.id === listingId) {
            setSelectedListingDetail(updated);
          }
          return updated;
        }
        return l;
      })
    );
    showToast(
      lang === 'ar' 
        ? 'تمت إضافة تقييمك بنجاح' 
        : lang === 'fr' 
        ? 'Avis publié avec succès' 
        : 'Review published'
    );
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      region: 'all',
      minPrice: 0,
      maxPrice: 600,
      minRating: 0,
      amenities: [],
      sortBy: 'featured',
    });
  };

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.query.trim() !== '' ||
      filters.category !== 'all' ||
      filters.region !== 'all' ||
      filters.minPrice > 0 ||
      filters.maxPrice < 600 ||
      filters.minRating > 0 ||
      filters.amenities.length > 0 ||
      filters.sortBy !== 'featured'
    );
  }, [filters]);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        // Query search
        if (filters.query.trim()) {
          const q = filters.query.toLowerCase().trim();
          const matchTitle =
            listing.title.ar.toLowerCase().includes(q) ||
            listing.title.en.toLowerCase().includes(q) ||
            listing.title.fr.toLowerCase().includes(q);
          const matchCity =
            listing.city.ar.toLowerCase().includes(q) ||
            listing.city.en.toLowerCase().includes(q) ||
            listing.city.fr.toLowerCase().includes(q);
          const matchAddress = listing.address.toLowerCase().includes(q);
          const matchDesc =
            listing.description.ar.toLowerCase().includes(q) ||
            listing.description.en.toLowerCase().includes(q);

          if (!matchTitle && !matchCity && !matchAddress && !matchDesc) {
            return false;
          }
        }

        // Category
        if (filters.category !== 'all' && listing.category !== filters.category) {
          return false;
        }

        // Region
        if (filters.region !== 'all' && listing.region !== filters.region) {
          return false;
        }

        // Price USD
        if (listing.priceUSD < filters.minPrice || listing.priceUSD > filters.maxPrice) {
          return false;
        }

        // Rating
        if (filters.minRating > 0 && listing.rating < filters.minRating) {
          return false;
        }

        // Amenities
        if (filters.amenities.length > 0) {
          const hasAllAmenities = filters.amenities.every((a) =>
            listing.amenities.includes(a)
          );
          if (!hasAllAmenities) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_asc':
            return a.priceUSD - b.priceUSD;
          case 'price_desc':
            return b.priceUSD - a.priceUSD;
          case 'rating':
            return b.rating - a.rating;
          case 'featured':
          default:
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return b.rating - a.rating;
        }
      });
  }, [listings, filters]);

  // Favorite listings full objects
  const favoriteListings = useMemo(() => {
    return listings.filter((l) => favorites.includes(l.id));
  }, [listings, favorites]);

  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#1E293B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 rtl:right-auto rtl:left-4 sm:rtl:left-6 z-60 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span>🇱🇧</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Header
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
        selectedCategory={filters.category}
        onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
        onOpenPostAd={() => setIsPostAdOpen(true)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenPromote={() => handleOpenPromote()}
        unreadMessagesCount={totalUnreadMessages}
        bookingsCount={bookings.filter((b) => b.status === 'confirmed').length}
        favoritesCount={favorites.length}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'signin');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenBecomeHost={() => setIsBecomeHostOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
      />

      {/* Hero Section with Search Bar */}
      <HeroSearch
        lang={lang}
        searchQuery={filters.query}
        setSearchQuery={(q) => setFilters((prev) => ({ ...prev, query: q }))}
        selectedRegion={filters.region}
        setSelectedRegion={(r) => setFilters((prev) => ({ ...prev, region: r }))}
        selectedCategory={filters.category}
        setSelectedCategory={(c) => setFilters((prev) => ({ ...prev, category: c }))}
        onOpenAdvancedFilters={() => setIsFilterDrawerOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Browse Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-28 md:pb-12">
        
        {/* Featured / Promoted VIP Listings Showcase Section */}
        {filters.category === 'all' && filters.region === 'all' && !filters.query && (
          <FeaturedSection
            listings={listings}
            lang={lang}
            currency={currency}
            onSelectListing={(l) => setSelectedListingDetail(l)}
            onOpenPromoteModal={() => handleOpenPromote()}
          />
        )}

        {/* Results Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              {filters.category === 'all'
                ? lang === 'ar'
                  ? 'أبرز الشاليهات والأماكن المميزة'
                  : lang === 'fr'
                  ? 'Chalets et adresses incontournables'
                  : 'Featured Stays & Dining'
                : t.categories[filters.category]}
            </h2>
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mt-1">
              <span className="tabular-nums font-semibold text-stone-800">
                {filteredListings.length}
              </span>
              <span>{t.filter.resultsCount}</span>
              {filters.region !== 'all' && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span>{t.regions[filters.region]}</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Filter & View Mode Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Segmented Switcher */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title={t.filter.gridView}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.filter.gridView}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title={t.filter.mapView}
              >
                <Map className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.filter.mapView}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title={t.filter.splitView}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{t.filter.splitView}</span>
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.filter.clearFilters}</span>
              </button>
            )}

            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-white border border-stone-200 rounded-lg hover:border-stone-300 hover:bg-stone-50 transition-colors shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-800" />
              <span>{t.filter.title}</span>
            </button>
          </div>
        </div>

        {/* Listings Display: Map View, Split View, or Grid View */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/80 p-8 space-y-4">
            <span className="text-5xl">🇱🇧</span>
            <h3 className="text-base font-bold text-stone-800">{t.filter.noResults}</h3>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.filter.clearFilters}</span>
            </button>
          </div>
        ) : viewMode === 'map' ? (
          /* Fullscreen Interactive Lebanon Map View */
          <div className="space-y-4">
            <LebanonMapExplorer
              listings={filteredListings}
              selectedListing={selectedListingDetail}
              onSelectListing={(l) => setSelectedListingDetail(l)}
              onDirectBook={(l) => setDirectBookingListing(l)}
              lang={lang}
              currency={currency}
              activeRegion={filters.region}
              onSelectRegion={(r) => setFilters((prev) => ({ ...prev, region: r }))}
              className="w-full h-[76vh] min-h-[500px]"
            />
          </div>
        ) : viewMode === 'split' ? (
          /* Split View: Listings on One Side, Interactive Lebanon Map on the Other */
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[82vh] overflow-y-auto pr-1 pb-4">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  lang={lang}
                  currency={currency}
                  isFavorite={favorites.includes(listing.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectListing={(l) => setSelectedListingDetail(l)}
                  onDirectBook={(l) => setDirectBookingListing(l)}
                  onShareListing={(l) => {
                    setShareListing(l);
                    setIsShareModalOpen(true);
                  }}
                  onPromoteListing={handleOpenPromote}
                />
              ))}
            </div>

            <div className="w-full lg:w-1/2 sticky top-20 h-[82vh]">
              <LebanonMapExplorer
                listings={filteredListings}
                selectedListing={selectedListingDetail}
                onSelectListing={(l) => setSelectedListingDetail(l)}
                onDirectBook={(l) => setDirectBookingListing(l)}
                lang={lang}
                currency={currency}
                activeRegion={filters.region}
                onSelectRegion={(r) => setFilters((prev) => ({ ...prev, region: r }))}
                className="w-full h-full"
                isCompact
              />
            </div>
          </div>
        ) : (
          /* Standard Responsive Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                lang={lang}
                currency={currency}
                isFavorite={favorites.includes(listing.id)}
                onToggleFavorite={handleToggleFavorite}
                onSelectListing={(l) => setSelectedListingDetail(l)}
                onDirectBook={(l) => setDirectBookingListing(l)}
                onShareListing={(l) => {
                  setShareListing(l);
                  setIsShareModalOpen(true);
                }}
                onPromoteListing={handleOpenPromote}
              />
            ))}
          </div>
        )}

        {/* Floating Quick Map / Grid Toggle Pill (Tablet & Desktop) */}
        <div className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-stone-900/95 hover:bg-stone-900 text-white font-bold text-xs sm:text-sm shadow-2xl border border-stone-700/80 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            {viewMode === 'map' ? (
              <>
                <LayoutGrid className="w-4 h-4 text-emerald-400" />
                <span>{t.filter.gridView}</span>
              </>
            ) : (
              <>
                <Map className="w-4 h-4 text-emerald-400" />
                <span>{t.filter.mapView}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </>
            )}
          </button>
        </div>

      </main>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
        lang={lang}
        resultsCount={filteredListings.length}
      />

      {/* Listing Detail Modal */}
      <ListingDetailModal
        listing={selectedListingDetail}
        isOpen={!!selectedListingDetail}
        onClose={() => setSelectedListingDetail(null)}
        lang={lang}
        currency={currency}
        isFavorite={selectedListingDetail ? favorites.includes(selectedListingDetail.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onDirectBook={(l) => {
          setSelectedListingDetail(null);
          setDirectBookingListing(l);
        }}
        onAddReview={handleAddReview}
        onShareListing={(l) => {
          setShareListing(l);
          setIsShareModalOpen(true);
        }}
        onOpenQrCode={(l) => setQrListingTarget(l)}
        onStartChatWithHost={handleStartChatWithHost}
        onPromoteListing={handleOpenPromote}
      />

      {/* Direct Booking Modal (خاصية الحجز المباشر) */}
      <DirectBookingModal
        listing={directBookingListing}
        isOpen={!!directBookingListing}
        onClose={() => setDirectBookingListing(null)}
        lang={lang}
        onConfirmBooking={handleConfirmBooking}
        existingBookings={bookings}
      />

      {/* Post an Ad Modal (وضع إعلان) */}
      <PostAdModal
        isOpen={isPostAdOpen}
        onClose={() => setIsPostAdOpen(false)}
        lang={lang}
        onAddListing={handleAddListing}
      />

      {/* My Bookings Modal (حجوزاتي) */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
        lang={lang}
        currency={currency}
      />

      {/* Favorites Modal (المفضلة) */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favoriteListings}
        lang={lang}
        currency={currency}
        onToggleFavorite={handleToggleFavorite}
        onSelectListing={(l) => setSelectedListingDetail(l)}
        onDirectBook={(l) => setDirectBookingListing(l)}
        onShareListing={(l) => {
          setShareListing(l);
          setIsShareModalOpen(true);
        }}
      />

      {/* Social Share Modal (مشاركة فيسبوك، انستا، تيك توك، واتساب، نسخ الرابط) */}
      <ShareModal
        listing={shareListing}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        lang={lang}
        currency={currency}
        onShowToast={showToast}
      />

      {/* Auth Modal (تسجيل الدخول / إنشاء حساب) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        lang={lang}
        initialMode={authMode}
        onLogin={handleLogin}
        onShowToast={showToast}
      />

      {/* Become a Host Modal (انضم كمضيف مع التفاصيل والحاسبة) */}
      <BecomeHostModal
        isOpen={isBecomeHostOpen}
        onClose={() => setIsBecomeHostOpen(false)}
        lang={lang}
        currency={currency}
        onOpenPostAd={() => setIsPostAdOpen(true)}
      />

      {/* Notifications Modal (مركز الإشعارات والتنبيهات) */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        lang={lang}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onClearNotifications={handleClearNotifications}
        onNotificationClick={handleNotificationClick}
      />

      {/* Admin Panel Modal (لائحة المشرف والأدمن) */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        lang={lang}
        currency={currency}
        listings={listings}
        bookings={bookings}
        onToggleFeatured={handleToggleFeatured}
        onToggleVerifiedHost={handleToggleVerifiedHost}
        onDeleteListing={handleDeleteListing}
        onCancelBooking={handleCancelBooking}
        onBroadcastNotification={handleBroadcastNotification}
        onShowToast={showToast}
      />

      {/* Footer */}
      <Footer
        lang={lang}
        onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
        onOpenPostAd={() => setIsPostAdOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar (Natural Thumb Reach) */}
      <MobileBottomNav
        lang={lang}
        activeTab={mobileActiveTab}
        setActiveTab={setMobileActiveTab}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenPostAd={() => setIsPostAdOpen(true)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenSettings={() => setIsMobileSettingsOpen(true)}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        unreadMessagesCount={totalUnreadMessages}
        bookingsCount={bookings.filter((b) => b.status === 'confirmed').length}
        favoritesCount={favorites.length}
        onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
      />

      {/* QR Code Camera Scanner Modal for Physical Locations */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        listings={listings}
        lang={lang}
        onSelectListing={(matched) => {
          setSelectedListingDetail(matched);
          showToast(
            lang === 'ar'
              ? `✓ تم التعرف على: ${matched.title[lang] || matched.title.en}`
              : `✓ Recognized: ${matched.title[lang] || matched.title.en}`
          );
        }}
      />

      {/* Property QR Code Viewer Modal (Download, Print & Share) */}
      <PropertyQrModal
        isOpen={!!qrListingTarget}
        listing={qrListingTarget}
        onClose={() => setQrListingTarget(null)}
        lang={lang}
      />

      {/* In-App Chat & Messages Modal (Voice Notes, Photos, Videos, and HD Calls) */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setActiveChatConvId(null);
        }}
        lang={lang}
        conversations={conversations}
        activeConversationId={activeChatConvId}
        onSendMessage={handleSendMessage}
        onSelectListing={(listingId) => {
          const found = listings.find((l) => l.id === listingId);
          if (found) {
            setIsChatOpen(false);
            setSelectedListingDetail(found);
          }
        }}
        onDirectBook={(listingId) => {
          const found = listings.find((l) => l.id === listingId);
          if (found) {
            setIsChatOpen(false);
            setDirectBookingListing(found);
          }
        }}
        allListings={listings}
      />

      {/* Mobile Settings Sheet (Language & Currency switcher & Account) */}
      <MobileSettingsSheet
        isOpen={isMobileSettingsOpen}
        onClose={() => setIsMobileSettingsOpen(false)}
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'signin');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenBecomeHost={() => setIsBecomeHostOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenPromote={() => handleOpenPromote()}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
      />

      {/* Promote Listing Modal (الاعلانات المميزة وترقية الإعلانات) */}
      <PromoteListingModal
        isOpen={isPromoteOpen}
        onClose={() => setIsPromoteOpen(false)}
        listing={promoteTargetListing}
        allListings={listings}
        onPromoteSuccess={handlePromoteSuccess}
        lang={lang}
      />
    </div>
  );
}
