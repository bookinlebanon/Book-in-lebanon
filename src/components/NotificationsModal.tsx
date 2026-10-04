import React, { useState } from 'react';
import { isSoundEnabled, setSoundEnabled, playNotificationSound } from '../utils/notificationSound';
import { AppNotification, Language } from '../types';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  MessageCircle, 
  CalendarCheck, 
  ShieldCheck, 
  Star, 
  Sparkles,
  ExternalLink,
  Volume2,
  VolumeX
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onNotificationClick: (notif: AppNotification) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  lang,
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
  onNotificationClick,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [soundOn, setSoundOn] = useState(isSoundEnabled);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playNotificationSound();
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === 'all' ? notifications : notifications.filter((n) => !n.read);

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'inquiry':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#25D366] flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 fill-current" />
          </div>
        );
      case 'booking':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-4 h-4" />
          </div>
        );
      case 'system':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
      case 'review':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
        );
      case 'promo':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className="w-5 h-5 text-emerald-900" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900">
                {lang === 'ar' ? 'مركز الإشعارات' : lang === 'fr' ? 'Centre de notifications' : 'Notifications Center'}
              </h3>
              <p className="text-xs text-stone-500">
                {unreadCount > 0 
                  ? (lang === 'ar' ? `لديك ${unreadCount} إشعارات جديدة غير مقروءة` : lang === 'fr' ? `${unreadCount} nouvelles alertes non lues` : `${unreadCount} unread updates`)
                  : (lang === 'ar' ? 'جميع الإشعارات مقروءة' : lang === 'fr' ? 'Toutes les alertes sont lues' : 'All caught up')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                soundOn ? 'text-emerald-800 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-100'
              }`}
              title={lang === 'ar' ? 'صوت الإشعارات' : lang === 'fr' ? 'Son des notifications' : 'Notification sound'}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>
                {soundOn
                  ? (lang === 'ar' ? 'الصوت مفعّل' : lang === 'fr' ? 'Son activé' : 'Sound on')
                  : (lang === 'ar' ? 'الصوت مطفأ' : lang === 'fr' ? 'Son coupé' : 'Sound off')}
              </span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1"
                title={lang === 'ar' ? 'تحديد الكل كمقروء' : lang === 'fr' ? 'Tout marquer comme lu' : 'Mark all as read'}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'ar' ? 'قراءة الكل' : lang === 'fr' ? 'Tout lire' : 'Mark read'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-4 py-2 bg-stone-100/60 border-b border-stone-200 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {lang === 'ar' ? 'الكل' : lang === 'fr' ? 'Toutes' : 'All'} ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filter === 'unread'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {lang === 'ar' ? 'غير مقروءة' : lang === 'fr' ? 'Non lues' : 'Unread'} ({unreadCount})
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={onClearNotifications}
              className="text-stone-400 hover:text-rose-600 transition-colors p-1"
              title={lang === 'ar' ? 'مسح الإشعارات' : lang === 'fr' ? 'Effacer tout' : 'Clear all'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-2 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <span className="text-3xl">📭</span>
              <p className="text-xs font-semibold text-stone-500">
                {lang === 'ar' ? 'لا توجد إشعارات حالياً' : lang === 'fr' ? 'Aucune notification pour le moment' : 'No notifications found'}
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onNotificationClick(item)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  !item.read
                    ? 'bg-emerald-50/50 border-emerald-200/90 shadow-xs hover:bg-emerald-50'
                    : 'bg-white border-stone-200/80 hover:bg-stone-50'
                }`}
              >
                {getIcon(item.type)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="text-xs font-bold text-stone-900 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-stone-400 font-mono shrink-0">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.message}
                  </p>
                </div>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-emerald-700 shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
