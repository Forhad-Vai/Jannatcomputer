import React from 'react';
import { Phone, Truck, Layers, Globe } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const TopBar: React.FC = () => {
  const { language, toggleLanguage, t, openModal, compareList, isAdmin, isMarketAdmin } = useShop();

  return (
    <div id="top-bar" className="bg-slate-900 text-slate-200 text-xs border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Contact */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-medium">
            <Phone className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <a
              href="tel:01717220224"
              className="text-white hover:text-rose-400 font-semibold transition"
            >
              01717 220 224
            </a>
            <span className="text-slate-500">,</span>
            <a
              href="tel:01316768044"
              className="text-white hover:text-rose-400 font-semibold transition"
            >
              01316 768 044
            </a>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden lg:inline text-slate-400">
            {t('সকাল ৯:০০ - রাত ৮:৩০ (৬৪ জেলায় হোম ডেলিভারি)', '9:00 AM - 8:30 PM (64 Districts Delivery)')}
          </span>
        </div>

        {/* Right Side: Links & Toggles */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap ml-auto">
          {/* Order Tracking */}
          <button
            onClick={() => openModal('orderTrack')}
            className="flex items-center gap-1 hover:text-rose-400 transition cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('অর্ডার ট্র্যাকিং', 'Track Order')}</span>
          </button>

          <span className="text-slate-600">|</span>

          <button
            onClick={() => openModal('compare')}
            className="flex items-center gap-1 hover:text-rose-400 transition relative cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('কম্পেয়ার', 'Compare')}</span>
            {compareList.length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {compareList.length}
              </span>
            )}
          </button>

          <span className="text-slate-600">|</span>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded border border-slate-700 transition cursor-pointer font-medium"
            title="Toggle Language"
          >
            <Globe className="w-3 h-3 text-rose-400" />
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          <span className="text-slate-600">|</span>

          {/* Quick Admin / Market Portal Links */}
          <button
            onClick={() => openModal(isAdmin ? 'admin' : 'adminLogin')}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition cursor-pointer font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded"
            title="Admin Dashboard"
          >
            <span>👑 {t('এডমিন', 'Admin')}</span>
          </button>

          <button
            onClick={() => openModal(isMarketAdmin ? 'market' : 'marketLogin')}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition cursor-pointer font-bold bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded"
            title="Market Inventory Panel"
          >
            <span>📦 {t('মার্কেট', 'Market')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
