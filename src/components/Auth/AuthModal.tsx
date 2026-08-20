import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { customerLogin, customerRegister } from '../../utils/authApi';

export const AuthModal: React.FC = () => {
  const { language, t, closeModal, showToast, currentUser, login, logout, isAdmin, isMarketAdmin, openModal, footerSettings } = useShop();
  const [activeTab, setActiveTab] = useState<'customer' | 'register'>('customer');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg('');

    if (activeTab === 'register' && !name.trim()) {
      const msg = t('অনুগ্রহ করে আপনার নাম প্রদান করুন', 'Please provide your full name');
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }
    if (!phone.trim() || !password) {
      const msg = t('অনুগ্রহ করে সকল তথ্য পূরণ করুন', 'Please fill all required fields');
      setErrorMsg(msg);
      showToast(msg, 'error');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'register') {
        const result = await customerRegister(name, phone, password);
        if (result.success && result.user) {
          login({
            id: result.user.id,
            name: result.user.name,
            role: 'customer',
            phone: result.user.phoneOrEmail,
          });
          showToast(t('একাউন্ট সফলভাবে তৈরি হয়েছে!', 'Account created successfully!'));
          closeModal();
        } else {
          setErrorMsg(result.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
          showToast(result.message || 'Registration failed', 'error');
        }
      } else {
        const result = await customerLogin(phone, password);
        if (result.success && result.user) {
          login({
            id: result.user.id,
            name: result.user.name,
            role: 'customer',
            phone: result.user.phoneOrEmail,
          });
          showToast(t('লগইন সফল হয়েছে!', 'Login successful!'));
          closeModal();
        } else {
          setErrorMsg(result.message || 'মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়।');
          showToast(result.message || 'Invalid credentials', 'error');
        }
      }
    } catch {
      const err = t('সার্ভারে যোগাযোগ করা যায়নি।', 'Could not connect to server.');
      setErrorMsg(err);
      showToast(err, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already logged in, show Profile and Logout
  if (currentUser) {
    const isStaff = isAdmin || isMarketAdmin;
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                  isAdmin ? 'bg-amber-600' : isMarketAdmin ? 'bg-rose-600' : 'bg-emerald-600'
                }`}
              >
                {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-extrabold text-base">{currentUser.name}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-400/30'
                      : isMarketAdmin
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-400/30'
                      : 'bg-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {isAdmin
                    ? t('সুপার এডমিন (Super Admin)', 'Store Administrator')
                    : isMarketAdmin
                    ? t('মার্কেট এডমিন (Market Admin)', 'Inventory Manager')
                    : t('গ্রাহক (Customer)', 'Customer Account')}
                </span>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('রোল / পদবী:', 'Account Role:')}</span>
                <span className="font-bold text-slate-900">
                  {isAdmin ? 'Super Admin' : isMarketAdmin ? 'Market Manager' : 'Valued Customer'}
                </span>
              </div>
              {currentUser.email && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('ইমেইল:', 'Email:')}</span>
                  <span className="font-medium text-slate-900">{currentUser.email}</span>
                </div>
              )}
              {currentUser.phone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('মোবাইল:', 'Phone:')}</span>
                  <span className="font-medium text-slate-900">{currentUser.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">{t('নিরাপত্তা স্ট্যাটাস:', 'Security Status:')}</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('এনক্রিপ্টেড সেশন ও ভেরিফাইড', 'Encrypted Session & Verified')}
                </span>
              </div>
            </div>

            {/* Admin Dashboard Entry Button if user is logged in as admin */}
            {isAdmin && (
              <button
                onClick={() => {
                  closeModal();
                  openModal('admin');
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs sm:text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t('এডমিন কন্ট্রোল প্যানেল খুলুন', 'Open Admin Dashboard')}</span>
              </button>
            )}

            {isMarketAdmin && (
              <button
                onClick={() => {
                  closeModal();
                  openModal('market');
                }}
                className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs sm:text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t('মার্কেট প্যানেল খুলুন', 'Open Market Panel')}</span>
              </button>
            )}

            <button
              onClick={() => {
                logout();
                closeModal();
              }}
              className="w-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('লগআউট করুন', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-rose-600/30 rounded-xl blur-md"></div>
              <img
                src={footerSettings?.logoUrl || 'https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png'}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="relative h-10 w-auto object-contain drop-shadow-[0_4px_12px_rgba(225,29,72,0.4)]"
              />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                {activeTab === 'register' ? (
                  <span>{t('নতুন একাউন্ট তৈরি', 'Create Account')}</span>
                ) : (
                  <span>{t('গ্রাহক একাউন্টে লগইন', 'Customer Sign In')}</span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {footerSettings?.storeName || 'জান্নাত কম্পিউটার্স'}
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

        {/* 2-Way Tab Switcher for Customer */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              setActiveTab('customer');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition cursor-pointer ${
              activeTab === 'customer'
                ? 'bg-white text-rose-600 border-b-2 border-rose-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('লগইন (Sign In)', 'Sign In')}
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-rose-600 border-b-2 border-rose-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('নতুন রেজিস্টার (Register)', 'Register')}
          </button>
        </div>

        {/* Customer Login / Register Form */}
        <form onSubmit={handleCustomerSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('আপনার পূর্ণ নাম *', 'Full Name *')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. মোঃ সাকিব হাসান"
                  className="w-full bg-white pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('মোবাইল নম্বর বা ইমেইল *', 'Mobile Number or Email *')}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                disabled={isLoading}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full bg-white pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('পাসওয়ার্ড *', 'Password *')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white pl-9 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('প্রসেসিং হচ্ছে...', 'Processing...')}</span>
              </>
            ) : (
              <>
                <span>{activeTab === 'customer' ? t('লগইন করুন', 'Sign In') : t('একাউন্ট তৈরি করুন', 'Create Account')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab(activeTab === 'customer' ? 'register' : 'customer');
                setErrorMsg('');
              }}
              className="font-bold text-rose-600 hover:underline cursor-pointer"
            >
              {activeTab === 'customer'
                ? t('নতুন গ্রাহক? একটি ফ্রি একাউন্ট তৈরি করুন', 'New Customer? Create a free account')
                : t('ইতিমধ্যে একাউন্ট আছে? লগইন করুন', 'Already have an account? Sign In')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
