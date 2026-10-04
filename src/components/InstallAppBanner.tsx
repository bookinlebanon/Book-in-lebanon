import React, { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Language } from '../types';
import { APK_URL } from './ShareAppModal';

const DISMISS_KEY = 'book_in_lebanon_install_dismissed';

function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/** Offers "install app": a native prompt on Android/desktop Chrome, instructions on iPhone. */
export const InstallAppBanner: React.FC<{ lang: Language }> = ({ lang }) => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [hidden, setHidden] = useState(
    () => Capacitor.isNativePlatform() || isStandalone() || wasDismissed()
  );

  const tr = (ar: string, fr: string, en: string) => (lang === 'ar' ? ar : lang === 'fr' ? fr : en);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const canInstall = !!installEvent || isIos() || isAndroid();
  if (hidden || !canInstall) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Private browsing: the banner just comes back next visit.
    }
  };

  const install = async () => {
    if (!installEvent && isAndroid()) {
      window.location.href = APK_URL;
      return;
    }
    if (installEvent) {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === 'accepted') setHidden(true);
      setInstallEvent(null);
    } else {
      setShowIosHelp(true);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 rtl:sm:right-auto rtl:sm:left-6 sm:w-96 z-50 bg-white border border-stone-200 rounded-2xl shadow-2xl p-3.5">
      <div className="flex items-start gap-3">
        <img src="./icon-192.png" alt="" className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-stone-900">
            {tr('ثبّت تطبيق Book in Lebanon', 'Installez l’app Book in Lebanon', 'Install the Book in Lebanon app')}
          </p>
          {showIosHelp ? (
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              {tr('اضغط زر المشاركة', 'Touchez le bouton Partager', 'Tap the Share button')}{' '}
              <Share className="inline w-3.5 h-3.5 -mt-0.5 text-sky-600" />{' '}
              {tr(
                'في أسفل Safari، ثم اختر «إضافة إلى الشاشة الرئيسية».',
                'en bas de Safari, puis « Sur l’écran d’accueil ».',
                'at the bottom of Safari, then choose “Add to Home Screen”.'
              )}
            </p>
          ) : (
            <p className="text-xs text-stone-500 mt-0.5">
              {tr('افتحه من شاشتك الرئيسية مثل أي تطبيق', 'Ouvrez-le depuis votre écran d’accueil', 'Open it from your home screen like any app')}
            </p>
          )}
          {!showIosHelp && (
            <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={install}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              {tr('تثبيت', 'Installer', 'Install')}
            </button>
            {isAndroid() && installEvent && (
              <a href={APK_URL} className="mt-2 text-xs font-bold text-emerald-800 underline">
                {tr('أو حمّل ملف APK', 'ou télécharger l’APK', 'or download the APK')}
              </a>
            )}
            </div>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label={tr('إغلاق', 'Fermer', 'Close')}
          className="w-7 h-7 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
