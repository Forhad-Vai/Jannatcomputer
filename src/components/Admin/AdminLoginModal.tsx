import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { loginRole } from '../../utils/authApi';

export const AdminLoginModal: React.FC = () => {
  const { language, t, closeModal, showToast, login, openModal, footerSettings } = useShop();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg('');
    setIsLoading(true);

    try {
      const result = await loginRole(username, password, 'admin');

      if (result.success && result.user) {
        login({
          name: result.user.name,
          role: result.user.role,
          email: 'admin@jannatcomputers.com.bd',
        });
        closeModal();
        openModal('admin');
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
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-amber-500/30 rounded-xl blur-md"></div>
              <img
                src={footerSettings?.logoUrl || 'https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png'}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="relative h-11 w-auto object-contain drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]"
              />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight">
                {t('এডমিন পোর্টাল লগইন', 'Admin Portal Login')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('অর্ডার প্রসেসিং, ইনভয়েস ও সেলস ড্যাশবোর্ড', 'Order Processing, Invoices & Sales Dashboard')}
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
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('এডমিন ইউজারনেম', 'Admin Username')}
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('এডমিন পাসওয়ার্ড', 'Admin Password')}
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 text-slate-950 font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('যাচাই করা হচ্ছে...', 'Verifying credentials...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('এডমিন প্যানেলে প্রবেশ করুন', 'Log In to Admin Dashboard')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              {t('সুরক্ষিত সার্ভার ভিত্তিক রোল ভেরিফিকেশন দ্বারা সুরক্ষিত।', 'Protected by secure server-side Role-Based Access Control (RBAC).')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
