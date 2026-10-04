import React, { useState } from 'react';
import { User, UserRole, Language } from '../types';
import { signIn, signUp } from '../lib/api';
import { X, User as UserIcon, Lock, Mail, Phone, ShieldCheck, Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialMode?: 'signin' | 'signup';
  onLogin: (user: User) => void;
  onShowToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialMode = 'signin',
  onLogin,
  onShowToast,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+961 ');
  const [whatsapp, setWhatsapp] = useState('961');
  const [role, setRole] = useState<UserRole>('guest');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [infoText, setInfoText] = useState<string | null>(null);

  if (!isOpen) return null;

  const tr = (ar: string, fr: string, en: string) => (lang === 'ar' ? ar : lang === 'fr' ? fr : en);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
        onShowToast(tr('مرحباً بك! تم تسجيل الدخول بنجاح', 'Bienvenue ! Connexion réussie', 'Welcome back! Signed in'));
        onClose();
      } else {
        const { needsEmailConfirmation } = await signUp({
          email: email.trim(),
          password,
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.replace(/[^0-9]/g, ''),
          role,
        });
        if (needsEmailConfirmation) {
          setInfoText(
            tr(
              'أرسلنا رسالة تأكيد إلى بريدك الإلكتروني. افتحها واضغط على الرابط، ثم سجّل الدخول.',
              'Nous avons envoyé un e-mail de confirmation. Cliquez sur le lien puis connectez-vous.',
              'We sent a confirmation email. Click the link in it, then sign in.'
            )
          );
          setMode('signin');
        } else {
          onShowToast(tr('تم إنشاء حسابك الجديد بنجاح!', 'Votre compte a été créé avec succès !', 'Your account has been created!'));
          onClose();
        }
      }
    } catch (err) {
      const msg = (err as { message?: string })?.message || '';
      setErrorText(
        msg.includes('Invalid login credentials')
          ? tr('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'E-mail ou mot de passe incorrect', 'Wrong email or password')
          : msg.includes('Email not confirmed')
          ? tr('يرجى تأكيد بريدك الإلكتروني أولاً من الرسالة التي أرسلناها', 'Veuillez d’abord confirmer votre e-mail', 'Please confirm your email first')
          : msg.includes('already registered')
          ? tr('هذا البريد مسجّل مسبقاً، سجّل الدخول بدلاً من ذلك', 'Cet e-mail est déjà inscrit', 'This email is already registered, sign in instead')
          : msg.includes('Password should be')
          ? tr('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'Le mot de passe doit contenir au moins 6 caractères', 'Password must be at least 6 characters')
          : msg || tr('حدث خطأ، حاول مجدداً', 'Une erreur est survenue', 'Something went wrong')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🇱🇧</span>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900">
                {mode === 'signin' 
                  ? (lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Connexion' : 'Sign In') 
                  : (lang === 'ar' ? 'إنشاء حساب جديد' : lang === 'fr' ? 'Créer un compte' : 'Create Account')}
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {lang === 'ar' 
                ? 'شاليهات، بيوت ضيافة، استوديوهات ومطاعم في لبنان' 
                : lang === 'fr'
                ? 'Chalets, maisons d’hôtes et restaurants au Liban'
                : 'Chalets, guest houses & dining in Lebanon'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-3 bg-stone-100/70 border-b border-stone-200/80 flex gap-1">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Connexion' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'ar' ? 'إنشاء حساب' : lang === 'fr' ? 'Créer un compte' : 'Sign Up'}
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'ar' ? 'الاسم الكامل' : lang === 'fr' ? 'Nom complet' : 'Full Name'} *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: زياد خوري' : lang === 'fr' ? 'ex. Ziad Khoury' : 'e.g. Ziad Khoury'}
                      className="w-full text-xs p-2.5 pl-9 rtl:pl-2.5 rtl:pr-9 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {lang === 'ar' ? 'نوع الحساب' : lang === 'fr' ? 'Type de compte' : 'Account Type'} *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('guest')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left rtl:text-right flex items-center justify-between transition-all ${
                        role === 'guest'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-700'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>🧳</span>
                          <span>{lang === 'ar' ? 'مسافر / ضيف' : lang === 'fr' ? 'Voyageur' : 'Guest / Traveler'}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 block font-normal mt-0.5">
                          {lang === 'ar' ? 'حجز واستكشاف' : lang === 'fr' ? 'Réserver et visiter' : 'Book & explore'}
                        </span>
                      </div>
                      {role === 'guest' && <Check className="w-3.5 h-3.5 text-emerald-800" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('host')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left rtl:text-right flex items-center justify-between transition-all ${
                        role === 'host'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-700'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>🏡</span>
                          <span>{lang === 'ar' ? 'مضيف / مالك' : lang === 'fr' ? 'Hôte / Propriétaire' : 'Host / Owner'}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">
                          {lang === 'ar' ? '0% عمولة' : lang === 'fr' ? '0% commission' : '0% Commission'}
                        </span>
                      </div>
                      {role === 'host' && <Check className="w-3.5 h-3.5 text-emerald-800" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {lang === 'ar' ? 'رقم الهاتف' : lang === 'fr' ? 'Téléphone' : 'Phone'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+961 70 000 000"
                      className="w-full text-xs p-2.5 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-900 mb-1">
                      {lang === 'ar' ? 'رقم الواتساب' : lang === 'fr' ? 'Numéro WhatsApp' : 'WhatsApp Number'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="96170000000"
                      className="w-full text-xs p-2.5 border border-emerald-600 rounded-xl focus:outline-none focus:border-emerald-800 font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === 'ar' ? 'البريد الإلكتروني' : lang === 'fr' ? 'Adresse e-mail' : 'Email Address'} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full text-xs p-2.5 pl-9 rtl:pl-2.5 rtl:pr-9 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {lang === 'ar' ? 'كلمة المرور' : lang === 'fr' ? 'Mot de passe' : 'Password'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 pl-9 rtl:pl-2.5 rtl:pr-9 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            {errorText && (
              <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5">{errorText}</p>
            )}
            {infoText && (
              <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">{infoText}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 disabled:opacity-60 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm active:scale-98"
            >
              {isSubmitting
                ? tr('جارٍ الإرسال...', 'Envoi...', 'Please wait...')
                : mode === 'signin'
                ? (lang === 'ar' ? 'دخول فوري' : lang === 'fr' ? 'Se connecter' : 'Sign In')
                : (lang === 'ar' ? 'إتمام إنشاء الحساب' : lang === 'fr' ? 'Finaliser l’inscription' : 'Create Account')}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
