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
  PaymentMethod,
  BookingStatus
} from './types';
import * as api from './lib/api';
import { supabase, isSupabaseConfigured } from './lib/supabase';
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

const STORAGE_FAVORITES_KEY = 'book_in_lebanon_favorites';
const STORAGE_LANG_KEY = 'book_in_lebanon_lang';
const STORAGE_CURRENCY_KEY = 'book_in_lebanon_currency';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function errorMessage(e: unknown): string {
  return (e as { message?: string })?.message || String(e);
}

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

  const tr = (ar: string, fr: string, en: string) => (lang === 'ar' ? ar : lang === 'fr' ? fr : en);

  // Server-backed state
  const [rawListings, setListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const listings = useMemo(
    () => rawListings.map((l) => ({ ...l, isUserListing: !!currentUser && l.ownerId === currentUser.id })),
    [rawListings, currentUser?.id]
  );
  const myListings = useMemo(() => listings.filter((l) => l.isUserListing), [listings]);
  const [notificationRows, setNotificationRows] = useState<any[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  // Favorites stay on this device
  const [favorites, setFavorites] = useState<string[]>(() => readStorage(STORAGE_FAVORITES_KEY, []));

  const notifications = useMemo(
    () => notificationRows.map((row) => api.rowToNotification(row, lang)),
    [notificationRows, lang]
  );

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

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isBecomeHostOpen, setIsBecomeHostOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrListingTarget, setQrListingTarget] = useState<Listing | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatConvId, setActiveChatConvId] = useState<string | null>(null);

  // Browse View Mode State (Grid, Interactive Lebanon Map, Split)
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'split'>('grid');

  // Promote / Featured Listing Modal State
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [promoteTargetListing, setPromoteTargetListing] = useState<Listing | null>(null);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const showError = (e: unknown) => {
    console.error(e);
    showToast(tr('حدث خطأ: ', 'Erreur : ', 'Something went wrong: ') + errorMessage(e));
  };

  /** Opens sign-in and returns false when nobody is signed in. */
  const requireAuth = (): boolean => {
    if (currentUser) return true;
    setAuthMode('signin');
    setIsAuthOpen(true);
    showToast(tr('يرجى تسجيل الدخول أولاً', 'Veuillez vous connecter d’abord', 'Please sign in first'));
    return false;
  };

  // ───── Loaders ─────

  const loadListings = async () => {
    try {
      setListings(await api.fetchListings());
    } catch (e) {
      showError(e);
    } finally {
      setIsLoadingListings(false);
    }
  };

  const loadBookings = async () => {
    try {
      setBookings(await api.fetchBookings());
    } catch (e) {
      showError(e);
    }
  };

  const loadConversations = async (userId: string) => {
    try {
      setConversations(await api.fetchConversations(userId, lang));
    } catch (e) {
      showError(e);
    }
  };

  const loadNotifications = async () => {
    try {
      setNotificationRows(await api.fetchNotifications());
    } catch (e) {
      showError(e);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoadingListings(false);
      return;
    }
    loadListings();
  }, []);

  // Track the signed-in user
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const applySession = async (userId: string | null) => {
      if (!userId) {
        setCurrentUser(null);
        return;
      }
      try {
        setCurrentUser(await api.fetchProfile(userId));
      } catch (e) {
        showError(e);
      }
    };
    supabase.auth.getSession().then(({ data }) => applySession(data.session?.user.id ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer so Supabase finishes its own auth work before we query.
      setTimeout(() => applySession(session?.user.id ?? null), 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Per-user data plus live updates
  const userId = currentUser?.id;
  useEffect(() => {
    if (!userId) {
      setBookings([]);
      setConversations([]);
      setNotificationRows([]);
      return;
    }
    loadBookings();
    loadConversations(userId);
    loadNotifications();

    const channel = supabase
      .channel(`user-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () =>
        loadConversations(userId)
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, () =>
        loadConversations(userId)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadBookings();
        loadListings();
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => loadNotifications()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Re-render chat timestamps and listing titles in the new language
  useEffect(() => {
    if (userId) loadConversations(userId);
  }, [lang]);

  // ───── Promotion ─────

  const handleOpenPromote = (targetListing?: Listing | null) => {
    if (!requireAuth()) return;
    if (targetListing && targetListing.ownerId !== currentUser?.id) {
      showToast(tr('يمكن لصاحب الإعلان فقط ترقيته', 'Seul le propriétaire peut booster cette annonce', 'Only the owner can promote this listing'));
      return;
    }
    if (!targetListing && myListings.length === 0) {
      showToast(tr('انشر إعلاناً أولاً لتتمكن من ترقيته', 'Publiez d’abord une annonce', 'Post a listing first to promote it'));
      return;
    }
    setPromoteTargetListing(targetListing || null);
    setIsPromoteOpen(true);
  };

  const handlePromoteSuccess = async (
    listingId: string,
    tier: PromotionTier,
    days: number,
    priceUSD: number,
    paymentMethod: PaymentMethod,
    refCode: string
  ) => {
    try {
      await api.requestPromotion({ listingId, tier, days, priceUSD, paymentMethod, paymentReference: refCode });
      showToast(
        tr(
          'تم استلام طلب الترقية. سيتم تفعيل الإعلان المميز بعد تأكيد الدفع من الإدارة.',
          'Demande reçue. La mise en avant sera activée après vérification du paiement.',
          'Promotion request received. It goes live once the payment is verified.'
        )
      );
    } catch (e) {
      showError(e);
    }
  };

  // ───── Chat ─────

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const handleSendMessage = async (conversationId: string, msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!currentUser) return;
    // Show the message immediately; the reload replaces it with the stored copy.
    const optimistic: ChatMessage = {
      ...msg,
      id: `pending-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-LB' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'sent',
    };
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, messages: [...c.messages, optimistic] } : c))
    );
    try {
      await api.sendMessage(currentUser.id, conversationId, msg);
    } catch (e) {
      showError(e);
    }
    loadConversations(currentUser.id);
  };

  const handleViewConversation = async (conversationId: string) => {
    if (!currentUser) return;
    await api.markConversationRead(conversationId);
    loadConversations(currentUser.id);
  };

  const handleOpenChat = () => {
    if (!requireAuth()) return;
    setIsChatOpen(true);
  };

  const handleStartChatWithHost = async (listing: Listing) => {
    if (!requireAuth() || !currentUser) return;
    if (listing.ownerId === currentUser.id) {
      showToast(tr('هذا إعلانك', 'C’est votre annonce', 'This is your own listing'));
      return;
    }
    try {
      const convId = await api.startConversation(currentUser.id, listing.id);
      await loadConversations(currentUser.id);
      setActiveChatConvId(convId);
      setIsChatOpen(true);
      setSelectedListingDetail(null);
    } catch (e) {
      showError(e);
    }
  };

  // ───── Auth ─────

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await api.signOut();
    setCurrentUser(null);
    showToast(tr('تم تسجيل الخروج بنجاح', 'Déconnexion réussie', 'Signed out successfully'));
  };

  // ───── Notifications ─────

  const handleMarkAllNotificationsRead = async () => {
    if (!currentUser) return;
    setNotificationRows((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.markNotificationsRead(currentUser.id);
    } catch (e) {
      showError(e);
    }
  };

  const handleClearNotifications = async () => {
    if (!currentUser) return;
    setNotificationRows([]);
    try {
      await api.clearNotifications(currentUser.id);
      showToast(tr('تم مسح الإشعارات', 'Notifications effacées', 'Notifications cleared'));
    } catch (e) {
      showError(e);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setNotificationRows((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    if (currentUser) api.markNotificationsRead(currentUser.id, [notif.id]).catch(console.error);
    setIsNotificationsOpen(false);
    if (notif.bookingId) {
      setIsMyBookingsOpen(true);
    } else if (notif.listingId) {
      const found = listings.find((l) => l.id === notif.listingId);
      if (found) setSelectedListingDetail(found);
    }
  };

  const handleOpenNotifications = () => {
    if (!requireAuth()) return;
    setIsNotificationsOpen(true);
  };

  const handleBroadcastNotification = async (title: string, message: string) => {
    try {
      await api.broadcastNotification(title, message);
    } catch (e) {
      showError(e);
    }
  };

  // ───── Admin ─────

  const handleOpenAdmin = () => {
    if (currentUser?.role !== 'admin') {
      showToast(tr('لوحة التحكم للمشرفين فقط', 'Réservé aux administrateurs', 'Admins only'));
      return;
    }
    setIsAdminOpen(true);
  };

  const handleToggleFeatured = async (listingId: string) => {
    const target = listings.find((l) => l.id === listingId);
    if (!target) return;
    try {
      await api.setListingFeatured(listingId, !target.featured);
      setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, featured: !l.featured } : l)));
      showToast(tr('تم تحديث حالة تمييز الإعلان', 'Statut de mise en avant mis à jour', 'Listing featured status updated'));
    } catch (e) {
      showError(e);
    }
  };

  const handleToggleVerifiedHost = async (listingId: string) => {
    const target = listings.find((l) => l.id === listingId);
    if (!target?.ownerId) return;
    try {
      await api.setHostVerified(target.ownerId, !target.host.verified);
      await loadListings();
      showToast(tr('تم تحديث توثيق المضيف', 'Vérification de l’hôte mise à jour', 'Host verification updated'));
    } catch (e) {
      showError(e);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      await api.deleteListing(listingId);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      showToast(tr('تم حذف الإعلان من المنصة', 'Annonce supprimée', 'Listing deleted'));
    } catch (e) {
      showError(e);
    }
  };

  // ───── Favorites ─────

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      showToast(
        exists
          ? tr('تمت الإزالة من المفضلة', 'Retiré des favoris', 'Removed from favorites')
          : tr('تمت الإضافة إلى المفضلة ❤️', 'Ajouté aux favoris ❤️', 'Added to favorites ❤️')
      );
      return next;
    });
  };

  // ───── Bookings ─────

  const handleOpenBooking = (listing: Listing) => {
    if (!requireAuth()) return;
    if (listing.ownerId === currentUser?.id) {
      showToast(tr('لا يمكنك حجز إعلانك', 'Vous ne pouvez pas réserver votre annonce', 'You cannot book your own listing'));
      return;
    }
    setDirectBookingListing(listing);
  };

  const handleConfirmBooking = async (newBooking: Booking): Promise<Booking | null> => {
    try {
      const saved = await api.createBooking(newBooking);
      setBookings((prev) => [saved, ...prev]);
      showToast(
        tr(
          `تم إرسال طلب الحجز للمضيف. رقم الطلب: ${saved.reference}`,
          `Demande envoyée à l’hôte. Réf : ${saved.reference}`,
          `Request sent to the host. Reference: ${saved.reference}`
        )
      );
      return saved;
    } catch (e) {
      showError(e);
      return null;
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      const updated = await api.setBookingStatus(bookingId, status);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
      if (status === 'confirmed') loadListings();
      showToast(
        status === 'confirmed'
          ? tr('تم تأكيد الحجز ✅', 'Réservation confirmée ✅', 'Booking confirmed ✅')
          : status === 'declined'
          ? tr('تم رفض الطلب', 'Demande refusée', 'Request declined')
          : tr('تم إلغاء الحجز', 'Réservation annulée', 'Booking cancelled')
      );
    } catch (e) {
      if (api.isDoubleBookingError(e)) {
        showToast(
          tr(
            'لا يمكن التأكيد: هذه التواريخ محجوزة بحجز مؤكد آخر.',
            'Impossible : ces dates sont déjà réservées.',
            'Cannot confirm: these dates overlap another confirmed booking.'
          )
        );
      } else {
        showError(e);
      }
    }
  };

  const handleCancelBooking = (bookingId: string) => handleUpdateBookingStatus(bookingId, 'cancelled');

  // ───── Listings ─────

  const handleOpenPostAd = () => {
    if (!requireAuth()) return;
    setIsPostAdOpen(true);
  };

  const handleAddListing = async (newListing: Listing): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const saved = await api.createListing(currentUser.id, newListing);
      setListings((prev) => [saved, ...prev]);
      if (currentUser.role === 'guest') {
        await api.becomeHost(currentUser.id);
        setCurrentUser({ ...currentUser, role: 'host' });
      }
      showToast(
        tr(
          'تم نشر إعلانك الجديد بنجاح على Book in Lebanon! 🇱🇧',
          'Votre annonce est publiée avec succès sur Book in Lebanon ! 🇱🇧',
          'Your listing is live on Book in Lebanon! 🇱🇧'
        )
      );
      return true;
    } catch (e) {
      showError(e);
      return false;
    }
  };

  const handleAddReview = async (listingId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    if (!requireAuth()) return;
    try {
      const newRev = await api.addReview(listingId, reviewData);
      setListings((prev) =>
        prev.map((l) => {
          if (l.id !== listingId) return l;
          const updatedReviews = [newRev, ...l.reviews];
          const newAvg = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
          const updated = {
            ...l,
            reviews: updatedReviews,
            reviewsCount: updatedReviews.length,
            rating: Number(newAvg.toFixed(2)),
          };
          if (selectedListingDetail?.id === listingId) setSelectedListingDetail(updated);
          return updated;
        })
      );
      showToast(tr('تمت إضافة تقييمك بنجاح', 'Avis publié avec succès', 'Review published'));
    } catch (e) {
      showError(e);
    }
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

      {!isSupabaseConfigured && (
        <div className="bg-amber-100 text-amber-900 text-xs font-semibold text-center px-4 py-2 border-b border-amber-200">
          {tr('الموقع غير متصل بقاعدة البيانات بعد.', 'Le site n’est pas encore connecté à la base de données.', 'The site is not connected to the database yet.')}
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
        onOpenPostAd={handleOpenPostAd}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenChat={handleOpenChat}
        onOpenPromote={() => handleOpenPromote()}
        unreadMessagesCount={totalUnreadMessages}
        bookingsCount={bookings.filter((b) => b.guestId === currentUser?.id && (b.status === 'confirmed' || b.status === 'pending')).length}
        favoritesCount={favorites.length}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'signin');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenBecomeHost={() => setIsBecomeHostOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenNotifications={handleOpenNotifications}
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
        {isLoadingListings ? (
          <div className="text-center py-16 text-sm font-semibold text-stone-500">
            {tr('جارٍ تحميل الإعلانات...', 'Chargement des annonces...', 'Loading listings...')}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/80 p-8 space-y-4">
            <span className="text-5xl">🇱🇧</span>
            <h3 className="text-base font-bold text-stone-800">
              {tr('لا توجد إعلانات بعد. كن أول من ينشر إعلانه!', 'Aucune annonce pour l’instant. Publiez la première !', 'No listings yet. Be the first to post one!')}
            </h3>
            <button
              onClick={handleOpenPostAd}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              {tr('أضف إعلانك', 'Publier une annonce', 'Post a listing')}
            </button>
          </div>
        ) : filteredListings.length === 0 ? (
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
              onDirectBook={handleOpenBooking}
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
                  onDirectBook={handleOpenBooking}
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
                onDirectBook={handleOpenBooking}
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
                onDirectBook={handleOpenBooking}
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
          handleOpenBooking(l);
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
        currentUser={currentUser}
      />

      {/* Post an Ad Modal (وضع إعلان) */}
      <PostAdModal
        isOpen={isPostAdOpen}
        onClose={() => setIsPostAdOpen(false)}
        lang={lang}
        onAddListing={handleAddListing}
        currentUser={currentUser}
      />

      {/* My Bookings Modal (حجوزاتي) */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
        onUpdateStatus={handleUpdateBookingStatus}
        currentUser={currentUser}
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
        onDirectBook={handleOpenBooking}
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
        onOpenPostAd={handleOpenPostAd}
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
        onOpenPostAd={handleOpenPostAd}
      />

      {/* Mobile Bottom Navigation Bar (Natural Thumb Reach) */}
      <MobileBottomNav
        lang={lang}
        activeTab={mobileActiveTab}
        setActiveTab={setMobileActiveTab}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenPostAd={handleOpenPostAd}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenSettings={() => setIsMobileSettingsOpen(true)}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenChat={handleOpenChat}
        unreadMessagesCount={totalUnreadMessages}
        bookingsCount={bookings.filter((b) => b.guestId === currentUser?.id && (b.status === 'confirmed' || b.status === 'pending')).length}
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
            handleOpenBooking(found);
          }
        }}
        allListings={listings}
        onViewConversation={handleViewConversation}
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
        onOpenAdmin={handleOpenAdmin}
        onOpenNotifications={handleOpenNotifications}
        onOpenPromote={() => handleOpenPromote()}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
      />

      {/* Promote Listing Modal (الاعلانات المميزة وترقية الإعلانات) */}
      <PromoteListingModal
        isOpen={isPromoteOpen}
        onClose={() => setIsPromoteOpen(false)}
        listing={promoteTargetListing}
        allListings={myListings}
        onPromoteSuccess={handlePromoteSuccess}
        lang={lang}
      />
    </div>
  );
}
