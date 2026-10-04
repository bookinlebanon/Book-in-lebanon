import React, { useState } from 'react';
import { User, UserRole, Language } from '../types';
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

  if (!isOpen) return null;

  // Preset demo accounts for quick testing
  const demoAccounts: { label: string; roleDesc: string; user: User; badgeColor: string }[] = [
    {
      label: lang === 'ar' ? 'مدير ومسؤول المنصة' : lang === 'fr' ? 'Administrateur de la plateforme' : 'Platform Administrator',
      roleDesc: lang === 'ar' ? 'صلاحيات كاملة لإدارة الإعلانات، الحجوزات، والمستخدمين' : lang === 'fr' ? 'Gestion complète des annonces, réservations et utilisateurs' : 'Full access to listings, bookings & users',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      user: {
        id: 'user-admin-01',
        name: lang === 'ar' ? 'زياد حداد' : 'Ziad Haddad',
        email: 'admin@bookinlebanon.com',
        phone: '+961 01 980 000',
        whatsapp: '9611980000',
        role: 'admin',
        isVerifiedHost: true,
        joinedDate: '2025-01-15',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
    },
    {
      label: lang === 'ar' ? 'مضيف شاليهات وبيوت ضيافة' : lang === 'fr' ? 'Hôte de chalets et maisons d’hôtes' : 'Chalet & Guest House Host',
      roleDesc: lang === 'ar' ? 'صاحب شاليه في فاريا وبيت ضيافة بالبترون' : lang === 'fr' ? 'Propriétaire à Faraya et Batroun' : 'Owner of chalets in Faraya & Batroun',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      user: {
        id: 'user-host-01',
        name: lang === 'ar' ? 'شربل الحايك' : 'Charbel El Hayek',
        email: 'charbel@lebanonchalets.com',
        phone: '+961 70 829 110',
        whatsapp: '96170829110',
        role: 'host',
        isVerifiedHost: true,
        joinedDate: '2025-06-10',
        listingsCount: 2,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      },
    },
    {
      label: lang === 'ar' ? 'مسافر وباحث عن إقامة' : lang === 'fr' ? 'Voyageur & Visiteur' : 'Traveler & Guest',
      roleDesc: lang === 'ar' ? 'حجز مباشر واستكشاف الشاليهات والمطاعم' : lang === 'fr' ? 'Réservations directes et découverte du Liban' : 'Direct booking & exploring Lebanon stays',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      user: {
        id: 'user-guest-01',
        name: lang === 'ar' ? 'سارة كرم' : 'Sarah Karam',
        email: 'sarah.karam@gmail.com',
        phone: '+961 71 450 882',
        whatsapp: '96171450882',
        role: 'guest',
        joinedDate: '2026-02-20',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      },
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      const loggedUser: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0] || (lang === 'ar' ? 'مستخدم المنصة' : lang === 'fr' ? 'Utilisateur' : 'Lebanon User'),
        email,
        phone: '+961 70 000 000',
        whatsapp: '96170000000',
        role: email.includes('admin') ? 'admin' : email.includes('host') ? 'host' : 'guest',
        isVerifiedHost: email.includes('host') || email.includes('admin'),
        joinedDate: new Date().toISOString().split('T')[0],
      };
      onLogin(loggedUser);
      onShowToast(lang === 'ar' ? `مرحباً بك ${loggedUser.name}! تم تسجيل الدخول بنجاح` : lang === 'fr' ? `Bienvenue ${loggedUser.name} !` : `Welcome back ${loggedUser.name}!`);
      onClose();
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name || (lang === 'ar' ? 'مستخدم جديد' : lang === 'fr' ? 'Nouvel utilisateur' : 'New User'),
        email,
        phone,
        whatsapp,
        role,
        isVerifiedHost: role === 'host',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      onLogin(newUser);
      onShowToast(lang === 'ar' ? 'تم إنشاء حسابك الجديد بنجاح!' : lang === 'fr' ? 'Votre compte a été créé avec succès !' : 'Your account has been created successfully!');
      onClose();
    }
  };

  const handleSelectDemo = (u: User) => {
    onLogin(u);
    onShowToast(lang === 'ar' ? `تم تسجيل الدخول بحساب: ${u.name}` : lang === 'fr' ? `Connecté en tant que : ${u.name}` : `Logged in as: ${u.name}`);
    onClose();
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 pl-9 rtl:pl-2.5 rtl:pr-9 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm active:scale-98"
            >
              {mode === 'signin'
                ? (lang === 'ar' ? 'دخول فوري' : lang === 'fr' ? 'Se connecter' : 'Sign In')
                : (lang === 'ar' ? 'إتمام إنشاء الحساب' : lang === 'fr' ? 'Finaliser l’inscription' : 'Create Account')}
            </button>
          </form>

          {/* Quick Demo Accounts Banner */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'ar' ? 'حسابات تجريبية سريعة' : lang === 'fr' ? 'Comptes démo instantanés' : 'Quick Demo Accounts'}</span>
            </span>

            <div className="space-y-1.5">
              {demoAccounts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDemo(item.user)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50/70 hover:bg-emerald-50/40 text-left rtl:text-right transition-all flex items-center justify-between group active:scale-98"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={item.user.avatar} 
                      alt={item.user.name} 
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-stone-200" 
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {item.user.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${item.badgeColor}`}>
                          {lang === 'ar' 
                            ? (item.user.role === 'admin' ? 'مشرف' : item.user.role === 'host' ? 'مضيف' : 'ضيف')
                            : lang === 'fr'
                            ? (item.user.role === 'admin' ? 'Admin' : item.user.role === 'host' ? 'Hôte' : 'Voyageur')
                            : item.user.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">{item.roleDesc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    {lang === 'ar' ? 'دخول' : lang === 'fr' ? 'Choisir' : 'Use'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
