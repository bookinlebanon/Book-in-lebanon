import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { supabase } from './supabase';
import {
  AppNotification,
  Booking,
  BookingStatus,
  ChatConversation,
  ChatMessage,
  Language,
  Listing,
  PaymentMethod,
  PromotionTier,
  Review,
  User,
  UserRole,
} from '../types';

// ───────────────────────── Media ─────────────────────────

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'audio/webm': 'webm',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
};

/** Uploads a local data:/blob: URL to storage and returns its public URL; remote URLs pass through. */
export async function uploadMedia(userId: string, url: string, folder: string): Promise<string> {
  if (!url.startsWith('data:') && !url.startsWith('blob:')) return url;
  const blob = await (await fetch(url)).blob();
  const type = blob.type || 'application/octet-stream';
  const ext = EXTENSIONS[type.split(';')[0]] || 'bin';
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(path, blob, { contentType: type });
  if (error) throw error;
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}

// ───────────────────────── Profiles & auth ─────────────────────────

function rowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    role: row.role as UserRole,
    avatar: row.avatar || undefined,
    isVerifiedHost: row.is_verified_host,
    joinedDate: (row.created_at || '').split('T')[0],
  };
}

export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data ? rowToUser(data) : null;
}

export async function signUp(input: {
  email: string;
  password: string;
  name: string;
  phone: string;
  whatsapp: string;
  role: UserRole;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: window.location.origin + window.location.pathname,
      data: { name: input.name, phone: input.phone, whatsapp: input.whatsapp, role: input.role },
    },
  });
  if (error) throw error;
  return { needsEmailConfirmation: !data.session };
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export const NATIVE_AUTH_CALLBACK = 'com.bookinlebanon.app://login-callback';

/**
 * Google sign-in. The website redirects in place; the Android app opens the
 * system browser (Google refuses embedded web views) and returns via a deep link.
 */
export async function signInWithGoogle() {
  const native = Capacitor.isNativePlatform();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: native ? NATIVE_AUTH_CALLBACK : window.location.origin + window.location.pathname,
      skipBrowserRedirect: native,
    },
  });
  if (error) throw error;
  if (native && data.url) await Browser.open({ url: data.url });
}

/** Completes Google sign-in when the Android app is reopened by the callback link. */
export async function finishNativeSignIn(url: string) {
  if (!url.startsWith(NATIVE_AUTH_CALLBACK)) return;
  await Browser.close().catch(() => {});
  const code = new URL(url).searchParams.get('code');
  if (!code) throw new Error(new URL(url).searchParams.get('error_description') || 'Sign-in was cancelled');
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function becomeHost(userId: string) {
  const { error } = await supabase.from('profiles').update({ role: 'host' }).eq('id', userId);
  if (error) throw error;
}

export async function setHostVerified(ownerId: string, verified: boolean) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_verified_host: verified })
    .eq('id', ownerId);
  if (error) throw error;
}

// ───────────────────────── Listings ─────────────────────────

function rowToReview(row: any): Review {
  return {
    id: row.id,
    author: row.author_name,
    rating: row.rating,
    comment: row.comment,
    date: (row.created_at || '').split('T')[0],
  };
}

function nightsBetween(checkIn: string, checkOut: string): string[] {
  const dates: string[] = [];
  const curr = new Date(checkIn + 'T00:00:00Z');
  const end = new Date(checkOut + 'T00:00:00Z');
  while (curr < end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return dates;
}

function rowToListing(row: any, bookedDates: string[] = []): Listing {
  const reviews: Review[] = (row.reviews || [])
    .map(rowToReview)
    .sort((a: Review, b: Review) => b.date.localeCompare(a.date));
  const rating = reviews.length
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2))
    : 0;
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    category: row.category,
    region: row.region,
    city: row.city,
    address: row.address,
    priceUSD: Number(row.price_usd),
    priceUnit: row.price_unit,
    rating,
    reviewsCount: reviews.length,
    images: row.images?.length ? row.images : ['images/lebanon_mountain_chalet_1790760821579.jpg'],
    videos: row.videos?.length ? row.videos : undefined,
    description: row.description,
    amenities: row.amenities || [],
    maxGuests: row.max_guests ?? undefined,
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    host: {
      name: row.host_name,
      phone: row.host_phone,
      whatsapp: row.host_whatsapp,
      verified: row.host_verified,
    },
    coordinates: row.lat != null && row.lng != null ? { lat: row.lat, lng: row.lng } : undefined,
    reviews,
    featured: row.featured,
    promotionTier: row.promotion_tier || undefined,
    promotedUntil: row.promoted_until || undefined,
    bookedDates,
    createdAt: row.created_at,
  };
}

export async function fetchListings(): Promise<Listing[]> {
  const [{ data, error }, { data: ranges, error: rangesError }] = await Promise.all([
    supabase.from('listings').select('*, reviews(*)').order('created_at', { ascending: false }),
    supabase.rpc('booked_ranges'),
  ]);
  if (error) throw error;
  if (rangesError) console.error('Could not load booked dates', rangesError);

  const booked: Record<string, string[]> = {};
  for (const r of (ranges as any[]) || []) {
    (booked[r.listing_id] ||= []).push(...nightsBetween(r.check_in, r.check_out));
  }
  return (data || []).map((row) => rowToListing(row, booked[row.id]));
}

export async function createListing(userId: string, listing: Listing): Promise<Listing> {
  const images = await Promise.all(listing.images.map((u) => uploadMedia(userId, u, 'listings')));
  const videos = await Promise.all(
    (listing.videos || []).map((u) => uploadMedia(userId, u, 'listings'))
  );
  const { data, error } = await supabase
    .from('listings')
    .insert({
      owner_id: userId,
      title: listing.title,
      category: listing.category,
      region: listing.region,
      city: listing.city,
      address: listing.address,
      price_usd: listing.priceUSD,
      price_unit: listing.priceUnit,
      images,
      videos,
      description: listing.description,
      amenities: listing.amenities,
      max_guests: listing.maxGuests ?? null,
      bedrooms: listing.bedrooms ?? null,
      bathrooms: listing.bathrooms ?? null,
      lat: listing.coordinates?.lat ?? null,
      lng: listing.coordinates?.lng ?? null,
      host_name: listing.host.name,
      host_phone: listing.host.phone,
      host_whatsapp: listing.host.whatsapp,
    })
    .select('*, reviews(*)')
    .single();
  if (error) throw error;
  return rowToListing(data);
}

export async function deleteListing(listingId: string) {
  const { error } = await supabase.from('listings').delete().eq('id', listingId);
  if (error) throw error;
}

export async function setListingFeatured(listingId: string, featured: boolean) {
  const { error } = await supabase.from('listings').update({ featured }).eq('id', listingId);
  if (error) throw error;
}

export async function addReview(
  listingId: string,
  review: Omit<Review, 'id' | 'date'>
): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      listing_id: listingId,
      author_name: review.author,
      rating: review.rating,
      comment: review.comment,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToReview(data);
}

export async function requestPromotion(input: {
  listingId: string;
  tier: PromotionTier;
  days: number;
  priceUSD: number;
  paymentMethod: PaymentMethod;
  paymentReference: string;
}) {
  const { error } = await supabase.from('promotion_requests').insert({
    listing_id: input.listingId,
    tier: input.tier,
    days: input.days,
    price_usd: input.priceUSD,
    payment_method: input.paymentMethod,
    payment_reference: input.paymentReference,
  });
  if (error) throw error;
}

// ───────────────────────── Bookings ─────────────────────────

function rowToBooking(row: any): Booking {
  return {
    id: row.id,
    reference: row.reference,
    guestId: row.guest_id,
    hostId: row.host_id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    listingImage: row.listing_image,
    category: row.category,
    city: row.city,
    guestName: row.guest_name,
    guestPhone: row.guest_phone,
    guestEmail: row.guest_email,
    checkInDate: row.check_in,
    checkOutDate: row.check_out || undefined,
    reservationTime: row.reservation_time || undefined,
    guestsCount: row.guests_count,
    nightsCount: row.nights_count,
    pricePerNightUSD: Number(row.price_per_night_usd),
    subtotalUSD: Number(row.subtotal_usd),
    serviceFeeUSD: Number(row.service_fee_usd),
    totalUSD: Number(row.total_usd),
    totalLBP: Number(row.total_lbp),
    paymentMethod: row.payment_method || undefined,
    paymentStatus: row.payment_method === 'cash_on_arrival' ? 'cash' : 'pending',
    paymentReference: row.payment_reference || undefined,
    notes: row.notes || undefined,
    status: row.status as BookingStatus,
    createdAt: row.created_at,
  };
}

export async function fetchBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToBooking);
}

export async function createBooking(b: Booking): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      reference: b.reference,
      listing_id: b.listingId,
      listing_title: b.listingTitle,
      listing_image: b.listingImage,
      category: b.category,
      city: b.city,
      guest_name: b.guestName,
      guest_phone: b.guestPhone,
      guest_email: b.guestEmail,
      check_in: b.checkInDate,
      check_out: b.checkOutDate ?? null,
      reservation_time: b.reservationTime ?? null,
      guests_count: b.guestsCount,
      nights_count: b.nightsCount,
      price_per_night_usd: b.pricePerNightUSD,
      subtotal_usd: b.subtotalUSD,
      service_fee_usd: b.serviceFeeUSD,
      total_usd: b.totalUSD,
      total_lbp: b.totalLBP,
      payment_method: b.paymentMethod ?? null,
      payment_reference: b.paymentReference ?? null,
      notes: b.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToBooking(data);
}

export async function setBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();
  if (error) throw error;
  return rowToBooking(data);
}

/** True when Postgres rejected a booking because it overlaps a confirmed stay. */
export function isDoubleBookingError(error: unknown): boolean {
  return (error as { code?: string })?.code === '23P01';
}

// ───────────────────────── Chat ─────────────────────────

function formatTime(iso: string, lang: Language): string {
  const d = new Date(iso);
  const locale = lang === 'ar' ? 'ar-LB' : lang === 'fr' ? 'fr-FR' : 'en-US';
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

export function rowToMessage(row: any, userId: string, lang: Language): ChatMessage {
  return {
    id: row.id,
    sender: row.sender_id === userId ? 'user' : 'host',
    type: row.type,
    text: row.text || undefined,
    mediaUrl: row.media_url || undefined,
    mediaDuration: row.media_duration ?? undefined,
    fileName: row.file_name || undefined,
    timestamp: formatTime(row.created_at, lang),
    status: row.sender_id === userId ? (row.read_at ? 'read' : 'delivered') : undefined,
  };
}

function rowToConversation(row: any, userId: string, lang: Language): ChatConversation {
  const isGuest = row.guest_id === userId;
  const listing = row.listing || {};
  const messages = [...(row.messages || [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );
  const last = messages[messages.length - 1];
  return {
    id: row.id,
    hostName: isGuest ? row.host_name : row.guest_name,
    hostPhone: isGuest ? listing.host_phone || '' : '',
    hostWhatsapp: isGuest ? listing.host_whatsapp || undefined : undefined,
    hostVerified: isGuest ? !!listing.host_verified : false,
    listingId: row.listing_id,
    listingTitle: listing.title ? listing.title[lang] || listing.title.ar : '',
    listingImage: listing.images?.[0] || '',
    listingPriceUSD: listing.price_usd != null ? Number(listing.price_usd) : undefined,
    listingCity: listing.city ? listing.city[lang] || listing.city.ar : '',
    unreadCount: messages.filter((m) => m.sender_id !== userId && !m.read_at).length,
    lastMessageTime: formatTime(last?.created_at || row.created_at, lang),
    messages: messages.map((m) => rowToMessage(m, userId, lang)),
  };
}

const CONVERSATION_SELECT =
  '*, listing:listings(title, images, price_usd, city, host_phone, host_whatsapp, host_verified), messages(*)';

export async function fetchConversations(userId: string, lang: Language): Promise<ChatConversation[]> {
  const { data, error } = await supabase.from('conversations').select(CONVERSATION_SELECT);
  if (error) throw error;
  return (data || [])
    .map((row) => ({ row, conv: rowToConversation(row, userId, lang) }))
    .sort((a, b) => lastActivity(b.row).localeCompare(lastActivity(a.row)))
    .map(({ conv }) => conv);
}

function lastActivity(row: any): string {
  return (row.messages || []).reduce(
    (max: string, m: any) => (m.created_at > max ? m.created_at : max),
    row.created_at
  );
}

/** Finds or creates the signed-in guest's conversation about a listing. */
export async function startConversation(userId: string, listingId: string): Promise<string> {
  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listingId)
    .eq('guest_id', userId)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('conversations')
    .insert({ listing_id: listingId, guest_id: userId, host_id: userId })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  msg: Omit<ChatMessage, 'id' | 'timestamp'>
) {
  const mediaUrl = msg.mediaUrl ? await uploadMedia(userId, msg.mediaUrl, 'chat') : null;
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    type: msg.type,
    text: msg.text ?? null,
    media_url: mediaUrl,
    media_duration: msg.mediaDuration ?? null,
    file_name: msg.fileName ?? null,
  });
  if (error) throw error;
}

export async function markConversationRead(conversationId: string) {
  const { error } = await supabase.rpc('mark_conversation_read', { conv: conversationId });
  if (error) console.error('Could not mark conversation read', error);
}

// ───────────────────────── Notifications ─────────────────────────

const NOTIFICATION_TEXT: Record<
  string,
  Record<Language, (d: any) => { title: string; message: string }>
> = {
  booking_requested: {
    ar: (d) => ({ title: 'طلب حجز جديد 📩', message: `${d.guest_name} طلب حجز "${d.listing_title}" بتاريخ ${d.check_in}. افتح حجوزاتي للقبول أو الرفض.` }),
    en: (d) => ({ title: 'New booking request 📩', message: `${d.guest_name} requested "${d.listing_title}" on ${d.check_in}. Open My Bookings to accept or decline.` }),
    fr: (d) => ({ title: 'Nouvelle demande de réservation 📩', message: `${d.guest_name} a demandé "${d.listing_title}" le ${d.check_in}. Ouvrez Mes réservations pour accepter ou refuser.` }),
  },
  booking_confirmed: {
    ar: (d) => ({ title: 'تم تأكيد حجزك ✅', message: `وافق المضيف على حجزك في "${d.listing_title}" (رقم ${d.reference}).` }),
    en: (d) => ({ title: 'Booking confirmed ✅', message: `The host accepted your booking at "${d.listing_title}" (ref ${d.reference}).` }),
    fr: (d) => ({ title: 'Réservation confirmée ✅', message: `L’hôte a accepté votre réservation à "${d.listing_title}" (réf ${d.reference}).` }),
  },
  booking_declined: {
    ar: (d) => ({ title: 'تعذّر قبول الحجز', message: `اعتذر المضيف عن طلبك في "${d.listing_title}" (رقم ${d.reference}).` }),
    en: (d) => ({ title: 'Booking declined', message: `The host declined your request at "${d.listing_title}" (ref ${d.reference}).` }),
    fr: (d) => ({ title: 'Réservation refusée', message: `L’hôte a refusé votre demande à "${d.listing_title}" (réf ${d.reference}).` }),
  },
  booking_cancelled: {
    ar: (d) => ({ title: 'تم إلغاء حجز', message: `أُلغي الحجز رقم ${d.reference} في "${d.listing_title}".` }),
    en: (d) => ({ title: 'Booking cancelled', message: `Booking ${d.reference} at "${d.listing_title}" was cancelled.` }),
    fr: (d) => ({ title: 'Réservation annulée', message: `La réservation ${d.reference} à "${d.listing_title}" a été annulée.` }),
  },
};

export function rowToNotification(row: any, lang: Language): AppNotification {
  const d = row.data || {};
  const text =
    row.kind === 'broadcast'
      ? { title: d.title, message: d.message }
      : NOTIFICATION_TEXT[row.kind]?.[lang](d) || { title: row.kind, message: '' };
  return {
    id: row.id,
    title: text.title,
    message: text.message,
    date: formatTime(row.created_at, lang),
    read: row.read,
    type: row.kind === 'broadcast' ? 'promo' : 'booking',
    listingId: d.listing_id,
    bookingId: d.booking_id,
  };
}

export async function fetchNotifications(): Promise<any[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function markNotificationsRead(userId: string, ids?: string[]) {
  let q = supabase.from('notifications').update({ read: true }).eq('user_id', userId);
  if (ids) q = q.in('id', ids);
  const { error } = await q;
  if (error) throw error;
}

export async function clearNotifications(userId: string) {
  const { error } = await supabase.from('notifications').delete().eq('user_id', userId);
  if (error) throw error;
}

export async function broadcastNotification(title: string, message: string) {
  const { error } = await supabase.rpc('admin_broadcast', { title, message });
  if (error) throw error;
}
