import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  Truck,
  Headphones,
  Facebook,
  Youtube,
  Instagram,
  Linkedin,
  KeyRound,
  LayoutDashboard,
  Package,
  Edit3,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const Footer: React.FC = () => {
  const {
    language,
    t,
    openModal,
    openPolicyModal,
    setFilters,
    isAdmin,
    isMarketAdmin,
    footerSettings,
  } = useShop();

  const handleCategoryFilter = (catId: string) => {
    setFilters((prev) => ({
      ...prev,
      category: catId,
      subcategory: 'all',
    }));
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-300 border-t-4 border-rose-600 mt-12">
      {/* Top Value Strip */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/30">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">
                <a href={`tel:${footerSettings.phone1}`} className="hover:text-rose-400 transition">
                  {footerSettings.phone1}
                </a>{' '}
                {footerSettings.phone2 && (
                  <a href={`tel:${footerSettings.phone2}`} className="hover:text-rose-400 transition text-xs font-semibold">
                    , {footerSettings.phone2}
                  </a>
                )}
              </div>
              <div className="text-xs text-slate-400">
                {language === 'bn' ? footerSettings.businessHoursBn : footerSettings.businessHours}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openPolicyModal('warranty')}
            className="flex items-center gap-3.5 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:bg-emerald-600/30 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition">
                {t('১০০% অফিশিয়াল ওয়ারেন্টি', '100% Official Warranty')}
              </div>
              <div className="text-xs text-slate-400">
                {t('ব্র্যান্ডের অথেনটিক পণ্য নিশ্চয়তা', 'Authorized brand distributor parts')}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => openPolicyModal('emi')}
            className="flex items-center gap-3.5 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 group-hover:bg-amber-600/30 transition">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white group-hover:text-amber-400 transition">
                {t('০% সহজ ব্যাংক ইএমআই', '0% Bank EMI Facility')}
              </div>
              <div className="text-xs text-slate-400">
                {t('শীর্ষ ২৫টি ব্যাংকের ক্রেডিট কার্ডে', 'Up to 36 months EMI')}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => openPolicyModal('delivery')}
            className="flex items-center gap-3.5 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:bg-blue-600/30 transition">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white group-hover:text-blue-400 transition">
                {t('সারাদেশে দ্রুততম ডেলিভারি', 'Fast Nationwide Delivery')}
              </div>
              <div className="text-xs text-slate-400">
                {t('ক্যাশ অন ডেলিভারি ও হোম সার্ভিস', 'Cash on delivery across Bangladesh')}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                {/* Glowing aura */}
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-600 via-amber-500 to-rose-400 rounded-xl blur-lg opacity-40 group-hover:opacity-75 transition duration-300"></div>
                <img
                  src={footerSettings.logoUrl || 'https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png'}
                  alt="Jannat Computers Official Logo"
                  referrerPolicy="no-referrer"
                  className="relative h-12 w-auto max-w-[150px] object-contain drop-shadow-[0_4px_16px_rgba(244,63,94,0.5)] group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-white tracking-tight leading-none">
                  {footerSettings.storeName}
                </span>
                <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400 mt-1">
                  {language === 'bn' ? footerSettings.taglineBn : footerSettings.tagline}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'bn' ? footerSettings.aboutTextBn : footerSettings.aboutText}
            </p>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  {language === 'bn' ? footerSettings.addressBn : footerSettings.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  <a href={`tel:${footerSettings.phone1}`} className="hover:text-rose-400 font-semibold transition">
                    {footerSettings.phone1}
                  </a>
                  {footerSettings.phone2 && (
                    <>
                      , <a href={`tel:${footerSettings.phone2}`} className="hover:text-rose-400 font-semibold transition">{footerSettings.phone2}</a>
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-500 shrink-0" />
                <a href={`mailto:${footerSettings.email}`} className="hover:text-rose-400 transition">
                  {footerSettings.email}
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {footerSettings.facebookUrl && (
                <a
                  href={footerSettings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {footerSettings.youtubeUrl && (
                <a
                  href={footerSettings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {footerSettings.instagramUrl && (
                <a
                  href={footerSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {footerSettings.linkedinUrl && (
                <a
                  href={footerSettings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Top Categories */}
          <div>
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4 border-l-2 border-rose-500 pl-2">
              {t('জনপ্রিয় ক্যাটাগরি', 'Top Categories')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => handleCategoryFilter('laptop')}
                  className="hover:text-rose-400 transition cursor-pointer text-left"
                >
                  {t('ল্যাপটপ ও নোটবুক', 'Laptops & MacBooks')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryFilter('component')}
                  className="hover:text-rose-400 transition cursor-pointer text-left"
                >
                  {t('প্রসেসর ও মাদারবোর্ড', 'Processors & Motherboards')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryFilter('component')}
                  className="hover:text-rose-400 transition cursor-pointer text-left"
                >
                  {t('গ্রাফিক্স কার্ড (জিপিইউ)', 'Graphics Cards (GPU)')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryFilter('monitor')}
                  className="hover:text-rose-400 transition cursor-pointer text-left"
                >
                  {t('গেমিং ও ৪কে মনিটর', 'Gaming & 4K Monitors')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryFilter('desktop')}
                  className="hover:text-rose-400 transition cursor-pointer text-left"
                >
                  {t('ব্র্যান্ড ও অল-ইন-ওয়ান পিসি', 'Brand & All-in-One PCs')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal('pcBuilder')}
                  className="text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer text-left flex items-center gap-1"
                >
                  <span>⚡ {t('পিসি বিল্ডার টুল', 'Custom PC Builder')}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Services */}
          <div>
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4 border-l-2 border-rose-500 pl-2">
              {t('কাস্টমার সার্ভিস', 'Customer Service')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => openModal('orderTrack')}
                  className="hover:text-rose-400 transition cursor-pointer text-left"
                >
                  {t('লাইভ অর্ডার ট্র্যাকিং', 'Live Order Tracking')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal('aiAdvisor')}
                  className="hover:text-rose-400 transition cursor-pointer text-left"
                >
                  {t('AI পিসি কনসালটেন্ট', 'AI PC Consultant')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openModal('compare')}
                  className="hover:text-rose-400 transition cursor-pointer text-left"
                >
                  {t('পণ্য তুলনা (Compare)', 'Product Comparison')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicyModal('warranty')}
                  className="hover:text-rose-400 transition cursor-pointer text-left"
                >
                  {t('অফিশিয়াল ওয়ারেন্টি পলিসি', 'Official Warranty Policy')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicyModal('emi')}
                  className="hover:text-rose-400 transition cursor-pointer text-left"
                >
                  {t('০% কিস্তি ও ব্যাংক তালিকা', '0% EMI Bank Partners')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicyModal('corporate')}
                  className="hover:text-rose-400 transition cursor-pointer text-left"
                >
                  {t('কর্পোরেট আইটি সেলস', 'Corporate IT Sales')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Terms & Policies */}
          <div>
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4 border-l-2 border-rose-500 pl-2">
              {t('পলিসি ও তথ্য', 'Policy & Info')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => openPolicyModal('about')}
                  className="hover:text-rose-400 transition cursor-pointer text-left block"
                >
                  {t('আমাদের সম্পর্কে', 'About Us')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicyModal('terms')}
                  className="hover:text-rose-400 transition cursor-pointer text-left block"
                >
                  {t('টার্মস অ্যান্ড কন্ডিশনস', 'Terms & Conditions')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicyModal('privacy')}
                  className="hover:text-rose-400 transition cursor-pointer text-left block"
                >
                  {t('প্রাইভেসি পলিসি', 'Privacy Policy')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicyModal('refund')}
                  className="hover:text-rose-400 transition cursor-pointer text-left block"
                >
                  {t('রিটার্ন ও রিফান্ড নীতি', 'Return & Refund Policy')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openPolicyModal('delivery')}
                  className="hover:text-rose-400 transition cursor-pointer text-left block"
                >
                  {t('পেমেন্ট ও ডেলিভারি পদ্ধতি', 'Payment & Delivery Info')}
                </button>
              </li>
              <li className="pt-3 mt-2 border-t border-slate-800 space-y-2">
                {/* Dedicated Market Panel Button */}
                <button
                  onClick={() => openModal(isMarketAdmin ? 'market' : 'marketLogin')}
                  className="w-full flex items-center justify-between gap-2 bg-gradient-to-r from-rose-900/40 to-red-900/30 hover:from-rose-800/50 hover:to-red-800/40 border border-rose-500/40 text-rose-300 hover:text-white px-3 py-2 rounded-lg font-bold transition cursor-pointer text-left group shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                    <span>{t('মার্কেট প্যানেল (পণ্য ও স্টক)', 'Market Panel (Products & Stock)')}</span>
                  </div>
                  <span className="text-[10px] bg-rose-600/30 border border-rose-400/40 px-1.5 py-0.5 rounded text-rose-200 uppercase font-black">
                    {t('পণ্য ম্যানেজ', 'Manage')}
                  </span>
                </button>

                {/* Dedicated Admin Portal Button */}
                <button
                  onClick={() => openModal(isAdmin ? 'admin' : 'adminLogin')}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 font-medium text-xs transition cursor-pointer text-left pl-1"
                >
                  {isAdmin ? (
                    <>
                      <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t('⚡ এডমিন ড্যাশবোর্ড (অর্ডার ও ফুটার সেটিংস)', '⚡ Admin Dashboard (Orders & Footer)')}</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 hover:text-amber-400" />
                      <span>{t('এডমিন পোর্টাল লগইন (অর্ডার ও রিপোর্ট)', 'Admin Portal Login (Orders & Report)')}</span>
                    </>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Partner Logos Strip */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-semibold block mb-2.5 text-center md:text-left">
              {t('নিরাপদ পেমেন্ট পার্টনারসমূহ (MFS, কার্ড ও ক্যাশ অন ডেলিভারি):', 'Accepted Payment Methods (MFS, Cards & COD):')}
            </span>
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
              {[
                { name: 'bKash / বিকাশ', bg: 'bg-[#D12053]/20 border-[#D12053]/50 text-[#ff7597]' },
                { name: 'Nagad / নগদ', bg: 'bg-[#F7931E]/20 border-[#F7931E]/50 text-[#ffb05c]' },
                { name: 'Rocket / রকেট', bg: 'bg-[#8C3494]/20 border-[#8C3494]/50 text-[#df82e8]' },
                { name: 'Upay / উপায়', bg: 'bg-[#005BAA]/20 border-[#005BAA]/50 text-[#60b6ff]' },
                { name: 'Visa & Master', bg: 'bg-blue-950/60 border-blue-600/40 text-blue-300' },
                { name: 'DBBL Nexus', bg: 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300' },
                { name: 'Cash on Delivery', bg: 'bg-slate-800 border-slate-700 text-slate-300' },
              ].map((pm) => (
                <span
                  key={pm.name}
                  className={`font-bold text-[11px] px-2.5 py-1 rounded-lg border shadow-xs ${pm.bg}`}
                >
                  {pm.name}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-xs text-slate-400">
              Trade License: <span className="text-slate-300 font-mono">{footerSettings.tradeLicense}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Member: {footerSettings.bcsMembership}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="bg-black py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div>
            © 2026 <strong className="text-slate-300">{footerSettings.storeName}</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Market Panel Button */}
            <button
              onClick={() => openModal(isMarketAdmin ? 'market' : 'marketLogin')}
              className="text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 px-2.5 py-1 rounded text-xs inline-flex items-center gap-1.5 transition cursor-pointer font-bold"
              title={t('মার্কেট প্যানেল - পণ্য ও স্টক ম্যানেজমেন্ট', 'Market Panel - Products & Stock Management')}
            >
              <Package className="w-3.5 h-3.5 text-rose-400" />
              <span>{isMarketAdmin ? t('মার্কেট প্যানেল (পণ্য)', 'Market Panel') : t('মার্কেট লগইন', 'Market Login')}</span>
            </button>
            <span className="text-slate-700">•</span>
            {/* Admin Dashboard Button */}
            <button
              onClick={() => openModal(isAdmin ? 'admin' : 'adminLogin')}
              className="text-slate-400 hover:text-amber-400 inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAdmin ? t('এডমিন ড্যাশবোর্ড', 'Admin Dashboard') : t('এডমিন লগইন', 'Admin Login')}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
