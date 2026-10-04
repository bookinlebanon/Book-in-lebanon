import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { X, Copy, Check, Share2, Mail, MessageSquare, Smartphone, Globe } from 'lucide-react';
import { Language } from '../types';

export const SITE_URL = 'https://bookinlebanon.github.io/Book-in-lebanon/';
export const APK_URL =
  'https://github.com/bookinlebanon/Book-in-lebanon/releases/latest/download/book-in-lebanon.apk';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onShowToast: (msg: string) => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose, lang, onShowToast }) => {
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const tr = (ar: string, fr: string, en: string) => (lang === 'ar' ? ar : lang === 'fr' ? fr : en);

  const title = 'Book in Lebanon';
  const message = tr(
    `🇱🇧 حمّل تطبيق Book in Lebanon لحجز الشاليهات وبيوت الضيافة والمطاعم في لبنان!\n\n📱 أندرويد (APK):\n${APK_URL}\n\n🍏 آيفون والكمبيوتر:\n${SITE_URL}`,
    `🇱🇧 Téléchargez l’app Book in Lebanon pour réserver chalets, maisons d’hôtes et restaurants au Liban !\n\n📱 Android (APK) :\n${APK_URL}\n\n🍏 iPhone et ordinateur :\n${SITE_URL}`,
    `🇱🇧 Get the Book in Lebanon app to book chalets, guest houses and restaurants in Lebanon!\n\n📱 Android (APK):\n${APK_URL}\n\n🍏 iPhone & computer:\n${SITE_URL}`
  );

  useEffect(() => {
    if (!isOpen || qr) return;
    QRCode.toDataURL(SITE_URL, { width: 320, margin: 1, color: { dark: '#064e3b', light: '#ffffff' } })
      .then(setQr)
      .catch(console.error);
  }, [isOpen, qr]);

  if (!isOpen) return null;

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
      onShowToast(tr('تم نسخ الرابط', 'Lien copié', 'Link copied'));
    } catch {
      onShowToast(tr('تعذّر النسخ', 'Copie impossible', 'Could not copy'));
    }
  };

  const nativeShareAvailable = Capacitor.isNativePlatform() || typeof navigator.share === 'function';

  const shareNative = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({ title, text: message, dialogTitle: tr('شارك التطبيق', 'Partager l’app', 'Share the app') });
      } else {
        await navigator.share({ title, text: message });
      }
    } catch {
      // The person closed the share sheet.
    }
  };

  const open = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');
  const text = encodeURIComponent(message);
  const site = encodeURIComponent(SITE_URL);

  const channels: { key: string; label: string; color: string; icon: React.ReactNode; action: () => void }[] = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      color: 'bg-[#25D366]',
      icon: <span className="text-lg">💬</span>,
      action: () => open(`https://wa.me/?text=${text}`),
    },
    {
      key: 'facebook',
      label: 'Facebook',
      color: 'bg-[#1877F2]',
      icon: <span className="font-black text-lg">f</span>,
      action: () => open(`https://www.facebook.com/sharer/sharer.php?u=${site}`),
    },
    {
      key: 'messenger',
      label: 'Messenger',
      color: 'bg-gradient-to-br from-[#00B2FF] to-[#A033FF]',
      icon: <MessageSquare className="w-5 h-5" />,
      action: () => open(`fb-messenger://share/?link=${site}`),
    },
    {
      key: 'telegram',
      label: 'Telegram',
      color: 'bg-[#229ED9]',
      icon: <span className="text-lg">✈️</span>,
      action: () => open(`https://t.me/share/url?url=${site}&text=${text}`),
    },
    {
      key: 'x',
      label: 'X',
      color: 'bg-stone-900',
      icon: <span className="font-black text-lg">𝕏</span>,
      action: () => open(`https://twitter.com/intent/tweet?text=${text}`),
    },
    {
      key: 'sms',
      label: tr('رسالة SMS', 'SMS', 'SMS'),
      color: 'bg-emerald-600',
      icon: <Smartphone className="w-5 h-5" />,
      action: () => {
        window.location.href = `sms:?&body=${text}`;
      },
    },
    {
      key: 'email',
      label: tr('البريد', 'E-mail', 'Email'),
      color: 'bg-stone-600',
      icon: <Mail className="w-5 h-5" />,
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${text}`;
      },
    },
    {
      key: 'copy',
      label: copied === 'all' ? tr('تم النسخ', 'Copié', 'Copied') : tr('نسخ الرسالة', 'Copier', 'Copy'),
      color: 'bg-amber-500',
      icon: copied === 'all' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />,
      action: () => copy(message, 'all'),
    },
  ];

  const linkRow = (key: string, icon: React.ReactNode, label: string, url: string) => (
    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200">
      <span className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold text-stone-700 block">{label}</span>
        <span className="text-[10px] text-stone-400 font-mono truncate block" dir="ltr">
          {url.replace('https://', '')}
        </span>
      </div>
      <button
        onClick={() => copy(url, key)}
        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 shrink-0"
      >
        {copied === key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied === key ? tr('تم', 'Copié', 'Copied') : tr('نسخ', 'Copier', 'Copy')}
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-stone-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2 sm:hidden" />

        <div className="px-4 sm:px-5 pt-2 sm:pt-5 pb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="./icon-192.png" alt="" className="w-12 h-12 rounded-2xl shadow-xs" />
            <div>
              <h3 className="font-extrabold text-base text-stone-900">
                {tr('شارك التطبيق', 'Partager l’application', 'Share the app')}
              </h3>
              <p className="text-xs text-stone-500">
                {tr('أرسله لأصدقائك ليحمّلوه', 'Envoyez-la à vos amis', 'Send it to friends to install')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={tr('إغلاق', 'Fermer', 'Close')}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 sm:px-5 pb-5 space-y-4">
          {nativeShareAvailable && (
            <button
              onClick={shareNative}
              className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              {tr('مشاركة عبر تطبيقات الهاتف', 'Partager via le téléphone', 'Share via your phone’s apps')}
            </button>
          )}

          <div className="grid grid-cols-4 gap-2.5">
            {channels.map((c) => (
              <button key={c.key} onClick={c.action} className="flex flex-col items-center gap-1.5 group">
                <span
                  className={`w-12 h-12 rounded-2xl ${c.color} text-white flex items-center justify-center shadow-xs group-active:scale-95 transition-transform`}
                >
                  {c.icon}
                </span>
                <span className="text-[10px] font-semibold text-stone-600 text-center leading-tight">{c.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {linkRow('apk', <span className="text-base">📱</span>, tr('رابط أندرويد (APK)', 'Lien Android (APK)', 'Android link (APK)'), APK_URL)}
            {linkRow('site', <Globe className="w-4 h-4 text-emerald-800" />, tr('رابط آيفون والكمبيوتر', 'Lien iPhone et ordinateur', 'iPhone & computer link'), SITE_URL)}
          </div>

          {qr && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-stone-200">
              <img src={qr} alt="QR" className="w-24 h-24 rounded-lg shrink-0" />
              <p className="text-xs text-stone-600 leading-relaxed">
                {tr(
                  'أو اجعل صديقك يمسح هذا الرمز بكاميرا هاتفه ليفتح التطبيق مباشرة.',
                  'Ou faites scanner ce code avec l’appareil photo pour ouvrir l’app.',
                  'Or let a friend scan this code with their phone camera to open the app.'
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
