export type Language = 'ar' | 'fr' | 'en';
export type Currency = 'USD' | 'LBP';

export type Category = 
  | 'all'
  | 'chalet' 
  | 'real_estate' 
  | 'guesthouse' 
  | 'studio' 
  | 'hotel' 
  | 'restaurant';

export type Region = 
  | 'all'
  | 'beirut' 
  | 'keserwan' 
  | 'jbeil' 
  | 'batroun' 
  | 'ehden_cedars' 
  | 'tripoli_akkar' 
  | 'matn' 
  | 'chouf_aley' 
  | 'tyre_south' 
  | 'sidon_jezzine' 
  | 'zahle_bekaa' 
  | 'baalbek_hermel' 
  | 'west_bekaa_rashaya';

export type Amenity = 
  | 'generator_247' 
  | 'pool' 
  | 'sea_view' 
  | 'mountain_view' 
  | 'wifi' 
  | 'jacuzzi' 
  | 'parking' 
  | 'kitchen' 
  | 'breakfast' 
  | 'terrace' 
  | 'pet_friendly';

export type PriceUnit = 'per_night' | 'per_person' | 'per_month' | 'min_spend';

export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
}

export interface Listing {
  id: string;
  title: {
    ar: string;
    fr: string;
    en: string;
  };
  category: Category;
  region: Region;
  city: {
    ar: string;
    fr: string;
    en: string;
  };
  address: string;
  priceUSD: number;
  priceUnit: PriceUnit;
  rating: number;
  reviewsCount: number;
  images: string[];
  videos?: string[];
  description: {
    ar: string;
    fr: string;
    en: string;
  };
  amenities: Amenity[];
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  host: {
    name: string;
    phone: string;
    whatsapp: string;
    verified: boolean;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  reviews: Review[];
  featured?: boolean;
  promotionTier?: PromotionTier;
  promotedUntil?: string;
  bookedDates?: string[];
  isUserListing?: boolean;
  ownerId?: string;
  createdAt: string;
}

export type PromotionTier = 'vip' | 'spotlight' | 'weekend';

export interface PromotionRecord {
  id: string;
  listingId: string;
  listingTitle: string;
  tier: PromotionTier;
  days: number;
  priceUSD: number;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired';
}

export type PaymentMethod = 'cards' | 'whish_pay' | 'omt_pay' | 'cash_on_arrival';

export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled';

export interface Booking {
  id: string;
  reference: string;
  guestId?: string;
  hostId?: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  category: Category;
  city: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate?: string;
  reservationTime?: string;
  guestsCount: number;
  nightsCount: number;
  pricePerNightUSD: number;
  subtotalUSD: number;
  serviceFeeUSD: number;
  totalUSD: number;
  totalLBP: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'paid' | 'pending' | 'cash';
  paymentReference?: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface FilterState {
  query: string;
  category: Category;
  region: Region;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  amenities: Amenity[];
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'rating';
}

export type UserRole = 'guest' | 'host' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  role: UserRole;
  avatar?: string;
  isVerifiedHost?: boolean;
  joinedDate: string;
  listingsCount?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'booking' | 'inquiry' | 'system' | 'review' | 'promo';
  linkAction?: string;
  listingId?: string;
  bookingId?: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'call_log';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'host';
  text?: string;
  type: MessageType;
  mediaUrl?: string;
  mediaDuration?: number;
  fileName?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatConversation {
  id: string;
  hostName: string;
  hostPhone: string;
  hostWhatsapp?: string;
  hostAvatar?: string;
  hostVerified?: boolean;
  listingId?: string;
  listingTitle?: string;
  listingImage?: string;
  listingPriceUSD?: number;
  listingCity?: string;
  unreadCount: number;
  lastMessageTime: string;
  messages: ChatMessage[];
}

