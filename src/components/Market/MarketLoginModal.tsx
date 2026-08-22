import React, { useState } from 'react';
import { X, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, Loader2, Database, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { loginRole, getSupabaseCredentials, saveSupabaseCredentials } from '../../utils/authApi';

export const MarketLoginModal: React.FC = () => {
  const { language, t, closeModal, showToast, login, openModal, footerSettings } = useShop();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Supabase quick connect state
  const isConnected = getSupabaseCredentials().isConnected;
  const [showDbConfig, setShowDbConfig] = useState(!isConnected);
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseCredentials().url);
  const [supabaseKey, setSupabaseKey] = useState(() => getSupabaseCredentials().key);
  const [savedDbNotice, setSavedDbNotice] = useState(false);

  const handleSaveDb = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    setSavedDbNotice(true);
    showToast(t('Supabase ডেটাবেজ সেটিংস সেভ হয়েছে!', 'Supabase config saved!'), 'success');
    setTimeout(() => setSavedDbNotice(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg('');
    setIsLoading(true);

    try {
      const result = await loginRole(username, password, 'market');

      if (result.success && result.user) {
        login({
          name: result.user.name,
          role: result.user.role,
          email: 'market@jannatcomputers.com.bd',
        });
        showToast(t('মার্কেট প্যানেলে স্বাগতম!', 'Welcome to Market Panel!'), 'success');
        closeModal();
        openModal('market');
      } else {
        const err = result.message || (language === 'bn' 
          ? 'ভুল ইউজারনেম বা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।' 
          : 'Invalid username or password! Please provide correct credentials.');
        setErrorMsg(err);
        showToast(err, 'error');
      }
    } catch {
      const networkErr = language === 'bn' 
        ? 'সার্ভারে সংযোগ করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।' 
        : 'Could not connect to authentication server. Please try again.';
      setErrorMsg(networkErr);
      showToast(networkErr, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-rose-500">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-rose-500/30 rounded-xl blur-md"></div>
              <img
                src={footerSettings?.logoUrl || 'https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png'}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="relative h-11 w-auto object-contain drop-shadow-[0_4px_12px_rgba(244,63,94,0.5)]"
              />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight">
                {t('মার্কেট প্যানেল লগইন', 'Market Panel Login')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('পণ্য যুক্ত, ক্যাটাগরি, স্টক ও প্রাইজ ম্যানেজমেন্ট', 'Product Addition, Category, Stock & Price Management')}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('মার্কেট ইউজারনেম', 'Market Username')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('ইউজারনেম লিখুন', 'Enter username')}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('মার্কেট পাসওয়ার্ড', 'Market Password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-60 text-white font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('যাচাই করা হচ্ছে...', 'Verifying credentials...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('মার্কেট প্যানেলে প্রবেশ করুন', 'Log In to Market Panel')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Supabase Connection Setup Toggle */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowDbConfig(!showDbConfig)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-semibold text-slate-700 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-rose-600" />
                <span>{t('Supabase ডেটাবেজ সংযোগ সেটিংস', 'Supabase Database Connection')}</span>
                {isConnected ? (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {t('কানেক্টেড (SQL লাইভ)', 'Connected (Live SQL)')}
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {t('সংযোগ প্রয়োজন', 'Setup URL & Key')}
                  </span>
                )}
              </div>
              {showDbConfig ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showDbConfig && (
              <form onSubmit={handleSaveDb} className="p-3.5 bg-white border-t border-slate-200 space-y-2.5">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {t('আপনার Supabase Dashboard -> Settings -> API থেকে URL ও anon key দিয়ে সেভ করলে ওয়েবসাইট সরাসরি আপনার ডেটাবেজে রান করা পাসওয়ার্ড দিয়ে লগইন ভেরিফাই করবে।', 'Save your Supabase URL & Anon Key so logins are verified strictly against your live SQL table.')}
                </p>
                {savedDbNotice && (
                  <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg text-[11px] flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('Supabase ডেটাবেজ সফলভাবে সংযুক্ত হয়েছে!', 'Supabase connected successfully!')}</span>
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Supabase Anon Key
                  </label>
                  <input
                    type="text"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg transition cursor-pointer shadow-sm"
                >
                  {t('ডেটাবেজ কানেকশন সেভ করুন', 'Save Supabase Connection')}
                </button>
              </form>
            )}
          </div>

          <div className="text-center pt-1 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              {t('সুরক্ষিত সার্ভার ভিত্তিক রোল ভেরিফিকেশন দ্বারা সুরক্ষিত।', 'Protected by secure server-side Role-Based Access Control (RBAC).')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
