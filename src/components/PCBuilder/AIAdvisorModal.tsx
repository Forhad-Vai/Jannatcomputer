import React, { useState } from 'react';
import { Sparkles, Bot, Send, CheckCircle, ArrowRight, X, Cpu, DollarSign, Zap } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AIAdvisorModal: React.FC = () => {
  const { language, t, closeModal, applyPrebuiltRig, openModal } = useShop();
  const [budget, setBudget] = useState('60000');
  const [purpose, setPurpose] = useState<'gaming' | 'editing' | 'office' | 'programming'>('gaming');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    title: string;
    summary: string;
    specs: string[];
    rigType: 'gaming' | 'creator' | 'budget';
    totalCost: string;
  } | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      if (purpose === 'gaming' || Number(budget) > 120000) {
        setRecommendation({
          title: language === 'bn' ? 'হাই-এফপিএস গেমিং ও স্ট্রিমিং কনফিগারেশন' : 'High-FPS 1440p Gaming Rig',
          summary:
            language === 'bn'
              ? 'এএমডি রাইজেন ৭৮০০এক্স৩ডি এবং আরটিএক্স ৪০৭০ সুপার গ্রাফিক্স কার্ডের সাহায্যে সব আধুনিক গেম ২কে ম্যাক্স সেটিংসে ৬০+ এফপিএস এ চলবে।'
              : 'Powered by AMD Ryzen 7800X3D with RTX 4070 SUPER GPU for high-refresh 1440p & 4K gaming.',
          specs: [
            'AMD Ryzen 7 7800X3D Processor',
            'ASUS TUF Gaming B650-PLUS WIFI Motherboard',
            'Corsair Vengeance RGB 32GB DDR5 6000MHz RAM',
            'ASUS TUF Gaming RTX 4070 SUPER 12GB GPU',
            'Samsung 990 PRO 1TB PCIe 4.0 NVMe SSD',
            'Corsair RM750e 750W 80+ Gold Modular PSU',
            'Lian Li O11 Dynamic EVO RGB Casing',
          ],
          rigType: 'gaming',
          totalCost: '৳২,৪০,০০০',
        });
      } else if (purpose === 'editing') {
        setRecommendation({
          title: language === 'bn' ? '৪কে ভিডিও এডিটিং ও ৩ডি রেন্ডারিং রিগ' : '4K Video Editing & 3D Render Rig',
          summary:
            language === 'bn'
              ? 'ইন্টেল কোর আই৭-১৪৭০০কে ২০-কোর প্রসেসর এবং স্যাফায়ার পালস ১৬জিবি ভি-র‍্যাম গ্রাফিক্স কার্ড অ্যাডোবি প্রিমিয়ার ও ব্লেন্ডারের জন্য সেরা।'
              : 'Intel Core i7-14700K 20-Core processor with Sapphire Pulse 16GB VRAM GPU delivers zero-stutter timeline scrubbing.',
          specs: [
            'Intel 14th Gen Core i7-14700K 20-Core Processor',
            'MSI MAG B760 TOMAHAWK WIFI DDR5 Motherboard',
            'Corsair Vengeance RGB 32GB DDR5 RAM',
            'Sapphire Pulse AMD Radeon RX 7800 XT 16GB GPU',
            'Samsung 990 PRO 1TB PCIe 4.0 SSD',
            'DeepCool AK620 Digital Air Cooler',
            'Montech AIR 903 MAX Casing',
          ],
          rigType: 'creator',
          totalCost: '৳১,৮৫,০০০',
        });
      } else {
        setRecommendation({
          title: language === 'bn' ? 'স্মার্ট অফিস ও কোডিং বাজেট কনফিগারেশন' : 'Best Value Multitask & Coding Rig',
          summary:
            language === 'bn'
              ? 'ইন্টেল কোর আই৫ ১৪তম জেন প্রসেসর এবং দ্রুতগতির এনভিএমই এসএসডি দিয়ে নির্বিঘ্ন অফিস, প্রোগ্রামিং ও হালকা ফটোশপের কাজ সম্পন্ন হবে।'
              : 'Intel Core i5 14th Gen with high-speed Kingston DDR5 RAM & NVMe SSD for snappy multitasking.',
          specs: [
            'Intel Core i5-14400F 10-Core Processor',
            'Gigabyte B650M Gaming X AX Motherboard',
            'Kingston Fury Beast 16GB DDR5 5600MHz RAM',
            'Kingston KC3000 1TB NVMe SSD',
            'DeepCool PK650D 650W 80+ Bronze PSU',
            'Montech AIR 903 MAX Casing',
          ],
          rigType: 'budget',
          totalCost: '৳৭৫,০০০',
        });
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <span>{t('জান্নাত AI পিসি কনসালটেন্ট', 'Jannat AI PC Consultant')}</span>
                <span className="bg-rose-500/30 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/40">
                  Smart AI
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t('আপনার বাজেট ও কাজের ধরন বলুন, AI পারফেক্ট কনফিগারেশন তৈরি করে দেবে।', 'Tell us your budget & usage, AI will configure the balanced rig.')}
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

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {t('আপনার বাজেট কত? (টাকায়)', 'What is your Budget? (in BDT)')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full bg-white pl-8 pr-4 py-2 text-sm rounded-lg border border-slate-300 outline-hidden font-bold text-slate-900 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {t('পিসির মূল ব্যবহারের ক্ষেত্র:', 'Primary Purpose:')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'gaming', label: t('🎮 গেমিং', '🎮 Gaming') },
                  { id: 'editing', label: t('🎬 ভিডিও এডিটিং', '🎬 Video Editing') },
                  { id: 'programming', label: t('💻 কোডিং/অফিস', '💻 Coding / Office') },
                  { id: 'office', label: t('📚 স্টুডেন্ট/হোম', '📚 Student / Home') },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPurpose(item.id as any)}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                      purpose === item.id
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {t('অতিরিক্ত পছন্দ বা সফটওয়্যারের নাম (ঐচ্ছিক):', 'Specific Preferences or Software (Optional):')}
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={t('যেমন: Valorant, Adobe Premiere Pro, WiFi সাপোর্ট ইত্যাদি', 'e.g. Valorant 200+ FPS, After Effects, Wi-Fi 6')}
                className="w-full bg-white px-3.5 py-2 text-xs rounded-lg border border-slate-300 outline-hidden focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('AI কনফিগারেশন তৈরি হচ্ছে...', 'AI is configuring your PC...')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t('সেরা কনফিগারেশন দেখুন', 'Generate Best Rig Configuration')}</span>
                </>
              )}
            </button>
          </form>

          {/* Recommendation Output Card */}
          {recommendation && (
            <div className="bg-white border-2 border-rose-500 rounded-xl p-4 shadow-md animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                    AI Recommended Setup
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1">
                    {recommendation.title}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-medium">আনুমানিক খরচ</div>
                  <div className="text-sm sm:text-base font-black text-rose-600">
                    {recommendation.totalCost}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                {recommendation.summary}
              </p>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                <div className="text-xs font-bold text-slate-800 mb-2">
                  {t('প্রস্তাবিত কম্পোনেন্টস তালিকা:', 'Recommended Hardware Parts:')}
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {recommendation.specs.map((spec, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium">{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    applyPrebuiltRig(recommendation.rigType);
                    closeModal();
                    openModal('pcBuilder');
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-amber-300" />
                  <span>{t('পিসি বিল্ডারে লোড করুন', 'Load into PC Builder')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
