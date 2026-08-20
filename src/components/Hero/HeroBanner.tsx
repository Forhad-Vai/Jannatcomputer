import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, Shield, Sparkles, ArrowRight, Cpu, Laptop, Layers, Truck } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const HeroBanner: React.FC = () => {
  const { language, t, openModal, selectCategory } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      tag: t('মেগা টেক অফার ২০২৬', 'MEGA TECH OFFER 2026'),
      title: t('কাস্টম পিসি বিল্ড করুন সেরা মূল্যে', 'Build Your Ultimate Custom PC'),
      subtitle: t(
        'ইন্টেল ১৪তম জেন ও এএমডি রাইজেন ৭০০০/৯০০০ প্রসেসর সাথে ফ্রি অ্যাসেম্বলি ও লাইফটাইম সার্ভিস!',
        'Intel 14th Gen & AMD Ryzen 7000/9000 Processors with Free Assembly & Lifetime Service!'
      ),
      bgGradient: 'from-slate-900 via-rose-950 to-slate-900',
      badgeColor: 'bg-rose-500 text-white',
      ctaText: t('পিসি বিল্ডার খুলুন', 'Open PC Builder'),
      action: () => openModal('pcBuilder'),
      image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      tag: t('গেমিং ও প্রফেশনাল ল্যাপটপ', 'GAMING & PRO LAPTOPS'),
      title: t('প্রিমিয়াম ল্যাপটপে ০% ইএমআই সুবিধা', 'Premium Laptops with 0% EMI Facility'),
      subtitle: t(
        'আসুস আরওজি, এইচপি ভিকটাস, অ্যাপল ম্যাকবুক ও লেনোভো লিজিয়ন ল্যাপটপে স্পেশাল গিফট প্যাক!',
        'Special Gift Pack with ASUS ROG, HP Victus, Apple MacBook & Lenovo Legion!'
      ),
      bgGradient: 'from-slate-950 via-red-900 to-slate-950',
      badgeColor: 'bg-amber-400 text-slate-950',
      ctaText: t('ল্যাপটপ কালেকশন দেখুন', 'Explore Laptops'),
      action: () => selectCategory('laptop'),
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      tag: t('গ্রাফিক্স কার্ড ও মনিটর ফেস্ট', 'GRAPHICS CARD & MONITOR FEST'),
      title: t('RTX 40 Series & 165Hz+ IPS Gaming Monitors', 'RTX 40 Series & 165Hz+ Fast IPS Monitors'),
      subtitle: t(
        'হাই রেজোলিউশন গেমিং ও ফোর-কে ভিডিও এডিটিংয়ের জন্য রেডি স্টক জিপিইউ ও ডিসপ্লে!',
        'In-stock GPUs & Monitors for high resolution competitive gaming and 4K creative workflows.'
      ),
      bgGradient: 'from-slate-900 via-zinc-900 to-rose-950',
      badgeColor: 'bg-emerald-500 text-white',
      ctaText: t('কম্পোনেন্টস দেখুন', 'View Components'),
      action: () => selectCategory('component'),
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 pb-2">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Slider (3 Columns on Large Screen) */}
        <div className="lg:col-span-3 relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 min-h-[320px] sm:min-h-[360px] flex items-center">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col justify-center px-6 sm:px-12 py-8 bg-gradient-to-r ${slide.bgGradient} ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background decorative image with overlay */}
              <img
                src={slide.image}
                alt="banner"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />

              <div className="relative z-10 max-w-lg">
                <span className={`inline-block text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full mb-3 tracking-wider ${slide.badgeColor}`}>
                  {slide.tag}
                </span>

                <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-3 drop-shadow-sm">
                  {slide.title}
                </h1>

                <p className="text-slate-300 text-xs sm:text-sm font-normal mb-6 line-clamp-2 leading-relaxed">
                  {slide.subtitle}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={slide.action}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-md shadow-rose-900/40 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openModal('aiAdvisor')}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-lg border border-white/20 backdrop-blur-xs transition cursor-pointer"
                  >
                    {t('AI পরামর্শ নিন', 'Get AI Advice')}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-3 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-3 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === currentSlide ? 'w-6 bg-rose-500' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Side Promotion Cards (1 Column) */}
        <div className="flex flex-col gap-4">
          {/* Side Promo 1: Quick PC Builder */}
          <div
            onClick={() => openModal('pcBuilder')}
            className="flex-1 bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded uppercase">
                  {t('পিসি বিল্ডার', 'PC Builder Tool')}
                </span>
                <Cpu className="w-5 h-5 text-rose-600 group-hover:scale-110 transition" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-rose-600 transition">
                {t('আপনার পছন্দের কনফিগারেশন করুন', 'Customize Your Dream Rig')}
              </h3>
              <p className="text-slate-500 text-xs">
                {t('বাজেট অনুসারে পার্টস পছন্দ ও ইনস্ট্যান্ট কোটেশন প্রিন্ট করুন।', 'Instant budget calculator, wattage check & PDF quote export.')}
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs font-bold text-rose-600 group-hover:translate-x-1 transition">
              <span>{t('এখনই শুরু করুন', 'Start Building')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Side Promo 2: Fast Delivery & COD */}
          <div
            onClick={() => openModal('orderTrack')}
            className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition cursor-pointer group border border-slate-700"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded uppercase">
                  {t('সারাদেশে হোম ডেলিভারি', 'Nationwide Delivery')}
                </span>
                <Truck className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1 group-hover:text-emerald-300 transition">
                {t('ক্যাশ অন ডেলিভারি সুবিধা', 'Cash on Delivery Available')}
              </h3>
              <p className="text-slate-300 text-xs">
                {t('ঢাকা ও ঢাকার বাহিরে দ্রুততম কুরিয়ার হোম ডেলিভারি ও রিয়েল-টাইম ট্র্যাকিং।', 'Fast door-to-door courier delivery across all districts of Bangladesh with live tracking.')}
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition">
              <span>{t('অর্ডার ট্র্যাক করুন', 'Track Your Order')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
