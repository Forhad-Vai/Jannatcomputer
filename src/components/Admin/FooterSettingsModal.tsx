import React, { useState } from 'react';
import {
  X,
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  Globe,
  QrCode,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  CreditCard,
  Building2,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { FooterSettings } from '../../types';

export const FooterSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { language, t, footerSettings, updateFooterSettings, resetFooterSettings, showToast } = useShop();

  const [formData, setFormData] = useState<FooterSettings>(footerSettings);
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'contact' | 'social' | 'payment'>('general');

  // Keep synced when modal opens
  React.useEffect(() => {
    setFormData(footerSettings);
  }, [footerSettings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof FooterSettings, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFooterSettings(formData);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি ফুটার সেটিংস ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?' : 'Are you sure you want to reset footer settings to default?')) {
      resetFooterSettings();
      setFormData(footerSettings);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-white font-black shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                <span>{t('ওয়েবসাইট ফুটার ও শপ তথ্য সেটিংস', 'Website Footer & Shop Info Settings')}</span>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {t('এডমিন কন্ট্রোল', 'Admin Control')}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t('ফুটারের নাম, ঠিকানা, মোবাইল নম্বর, সোশ্যাল লিংক এবং পেমেন্ট QR কোড পরিবর্তন করুন', 'Customize footer branding, address, phone numbers, social links & payment details')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSubTab('general')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeSubTab === 'general'
                ? 'bg-rose-600 text-white font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>{t('শপ ব্র্যান্ডিং ও বিবরণ', 'Brand & About')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('contact')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeSubTab === 'contact'
                ? 'bg-rose-600 text-white font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t('ঠিকানা ও যোগাযোগ নম্বর', 'Address & Contact')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('social')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeSubTab === 'social'
                ? 'bg-rose-600 text-white font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t('সোশ্যাল মিডিয়া ও লাইসেন্স', 'Social & License')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('payment')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeSubTab === 'payment'
                ? 'bg-rose-600 text-white font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{t('পেমেন্ট QR কোড ও নম্বর', 'Payment QR & Phone')}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: GENERAL */}
          {activeSubTab === 'general' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  <span>{t('দোকান / প্রতিষ্ঠানের নাম ও স্লোগান', 'Store Name & Taglines')}</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t('দোকানের নাম (Store Name)', 'Store Name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.storeName}
                    onChange={(e) => handleChange('storeName', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-bold"
                  />
                </div>

                {/* Official Logo Configuration */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t('অফিশিয়াল লোগো ইমেজ URL (Official Store Logo Image URL)', 'Official Store Logo Image URL')}
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl || ''}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-mono"
                  />
                  {/* Logo Live Preview */}
                  <div className="mt-2 p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      {t('লোগো প্রিভিউ (কালার স্যাডো সহ):', 'Logo Live Preview (with Glow & Shadow):')}
                    </div>
                    <div className="relative flex items-center justify-center p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="absolute inset-0 bg-rose-600/30 rounded-lg blur-md"></div>
                      <img
                        src={formData.logoUrl || 'https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png'}
                        alt="Logo Preview"
                        referrerPolicy="no-referrer"
                        className="relative h-10 w-auto object-contain drop-shadow-[0_4px_12px_rgba(225,29,72,0.45)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('স্লোগান (বাংলা)', 'Tagline (Bangla)')}
                    </label>
                    <input
                      type="text"
                      value={formData.taglineBn}
                      onChange={(e) => handleChange('taglineBn', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('স্লোগান (English)', 'Tagline (English)')}
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => handleChange('tagline', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{t('ফুটার সংক্ষিপ্ত পরিচিতি বিবরণী (About Text)', 'About Store Description')}</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t('পরিচিতি বিবরণ (বাংলা)', 'About Text (Bangla)')}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.aboutTextBn}
                    onChange={(e) => handleChange('aboutTextBn', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t('পরিচিতি বিবরণ (English)', 'About Text (English)')}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.aboutText}
                    onChange={(e) => handleChange('aboutText', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT & ADDRESS */}
          {activeSubTab === 'contact' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{t('দোকানের শোরুমের পূর্ণ ঠিকানা', 'Showroom / Physical Store Address')}</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t('পূর্ণ ঠিকানা (বাংলা) *', 'Full Address (Bangla) *')}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.addressBn}
                    onChange={(e) => handleChange('addressBn', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t('পূর্ণ ঠিকানা (English)', 'Full Address (English)')}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{t('যোগাযোগ নম্বর ও খোলা থাকার সময়', 'Helpline & Business Hours')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('হেল্পলাইন ফোন ১ *', 'Helpline Phone 1 *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone1}
                      onChange={(e) => handleChange('phone1', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('হেল্পলাইন ফোন ২ (ঐচ্ছিক)', 'Helpline Phone 2 (Optional)')}
                    </label>
                    <input
                      type="text"
                      value={formData.phone2}
                      onChange={(e) => handleChange('phone2', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('অফিশিয়াল ইমেইল (Email)', 'Official Email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('দোকান খোলা থাকার সময় (বাংলা)', 'Business Hours (Bangla)')}
                    </label>
                    <input
                      type="text"
                      value={formData.businessHoursBn}
                      onChange={(e) => handleChange('businessHoursBn', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL & LICENSE */}
          {activeSubTab === 'social' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{t('সোশ্যাল মিডিয়া পেজ লিংকসমূহ', 'Social Media Links')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('Facebook পেজ URL', 'Facebook Page URL')}
                    </label>
                    <input
                      type="url"
                      value={formData.facebookUrl}
                      onChange={(e) => handleChange('facebookUrl', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('YouTube চ্যানেল URL', 'YouTube Channel URL')}
                    </label>
                    <input
                      type="url"
                      value={formData.youtubeUrl}
                      onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                      placeholder="https://youtube.com/@yourchannel"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('Instagram প্রোফাইল URL', 'Instagram Profile URL')}
                    </label>
                    <input
                      type="url"
                      value={formData.instagramUrl}
                      onChange={(e) => handleChange('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('LinkedIn পেজ URL', 'LinkedIn Page URL')}
                    </label>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/company/yourpage"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('ট্রেড লাইসেন্স ও মেম্বারশিপ স্বীকৃতি', 'Trade License & Association Membership')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('ট্রেড লাইসেন্স নম্বর (Trade License No)', 'Trade License No')}
                    </label>
                    <input
                      type="text"
                      value={formData.tradeLicense}
                      onChange={(e) => handleChange('tradeLicense', e.target.value)}
                      placeholder="e.g. TRAD/DNCC/042918/2026"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('কম্পিউটার সমিতি / এসোসিয়েশন মেম্বারশিপ', 'Association Membership')}
                    </label>
                    <input
                      type="text"
                      value={formData.bcsMembership}
                      onChange={(e) => handleChange('bcsMembership', e.target.value)}
                      placeholder="e.g. BCS (Bangladesh Computer Samity)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT QR & NUMBER */}
          {activeSubTab === 'payment' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  <span>{t('চেকআউটে পেমেন্ট QR কোড ও বিকাশ/নগদ নম্বর', 'Checkout Payment QR & Mobile Number')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        {t('পেমেন্ট গ্রহণের মোবাইল নম্বর *', 'Payment Mobile Number *')}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.paymentPhone}
                        onChange={(e) => handleChange('paymentPhone', e.target.value)}
                        placeholder="01717220224"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-rose-400 focus:border-rose-500 outline-hidden font-mono font-bold"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {t('চেকআউট পেজে গ্রাহক এই নম্বরে বিকাশ/নগদে টাকা পাঠাবেন।', 'Customers will send money to this number at checkout.')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        {t('QR কোড ইমেজ URL (QR Code Image Link)', 'QR Code Image URL')}
                      </label>
                      <input
                        type="url"
                        required
                        value={formData.qrCodeUrl}
                        onChange={(e) => handleChange('qrCodeUrl', e.target.value)}
                        placeholder="https://.../qr.png"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  {/* QR Preview Card */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-bold text-slate-400 mb-2">
                      {t('লাইভ QR প্রিভিউ:', 'Live QR Preview:')}
                    </span>
                    <div className="bg-white p-2 rounded-lg shadow-md inline-block">
                      <img
                        src={formData.qrCodeUrl}
                        alt="QR Code Preview"
                        className="w-32 h-32 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=01717220224';
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-400 mt-2">
                      {formData.paymentPhone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('ডিফল্ট রিস্টোর', 'Reset Defaults')}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                {t('বাতিল', 'Cancel')}
              </button>

              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black transition cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-950"
              >
                <Save className="w-4 h-4" />
                <span>{t('সেভ ও আপডেট করুন', 'Save & Update')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
