import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Cpu,
  Laptop,
  Layers,
  Truck,
  Package,
  Edit3,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { HeroSlide, HeroSidePromo } from '../../types';

export const HeroBanner: React.FC = () => {
  const {
    language,
    t,
    openModal,
    selectCategory,
    heroBannerSettings,
    isAdmin,
  } = useShop();

  const [currentSlide, setCurrentSlide] = useState(0);

  // Active slides only (or fallback to all if none active)
  const activeSlides: HeroSlide[] =
    heroBannerSettings.slides.filter((s) => s.isActive !== false).length > 0
      ? heroBannerSettings.slides.filter((s) => s.isActive !== false)
      : heroBannerSettings.slides;

  const intervalSeconds = heroBannerSettings.autoSlideIntervalSeconds || 5;

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, intervalSeconds * 1000);
    return () => clearInterval(timer);
  }, [activeSlides.length, intervalSeconds]);

  // If active slide index goes out of bounds when slides change
  useEffect(() => {
    if (currentSlide >= activeSlides.length) {
      setCurrentSlide(0);
    }
  }, [activeSlides.length, currentSlide]);

  const handleSlideAction = (slide: HeroSlide) => {
    switch (slide.ctaActionType) {
      case 'pcBuilder':
        openModal('pcBuilder');
        break;
      case 'category':
        selectCategory(slide.ctaActionValue || 'all');
        break;
      case 'aiAdvisor':
        openModal('aiAdvisor');
        break;
      case 'orderTrack':
        openModal('orderTrack');
        break;
      case 'customLink':
        if (slide.ctaActionValue) {
          if (slide.ctaActionValue.startsWith('http')) {
            window.open(slide.ctaActionValue, '_blank');
          } else {
            selectCategory(slide.ctaActionValue);
          }
        }
        break;
      default:
        openModal('pcBuilder');
    }
  };

  const handlePromoAction = (promo: HeroSidePromo) => {
    switch (promo.actionType) {
      case 'pcBuilder':
        openModal('pcBuilder');
        break;
      case 'orderTrack':
        openModal('orderTrack');
        break;
      case 'aiAdvisor':
        openModal('aiAdvisor');
        break;
      case 'category':
        selectCategory(promo.actionValue || 'all');
        break;
      default:
        openModal('pcBuilder');
    }
  };

  const renderPromoIcon = (iconName: string) => {
    switch (iconName) {
      case 'truck':
        return <Truck className="w-5 h-5" />;
      case 'shield':
        return <Shield className="w-5 h-5" />;
      case 'zap':
        return <Zap className="w-5 h-5" />;
      case 'laptop':
        return <Laptop className="w-5 h-5" />;
      case 'package':
        return <Package className="w-5 h-5" />;
      case 'cpu':
      default:
        return <Cpu className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 pb-2 relative group/hero">
      {/* Admin Quick Edit Floating Button */}
      {isAdmin && (
        <div className="mb-2 flex items-center justify-between bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-amber-800 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {t('অ্যাডমিন মোড: হিরো ব্যানার পরিবর্তন ও কাস্টমাইজেশন সক্রিয়', 'Admin Mode: Hero banner customization active')}
          </span>
          <button
            onClick={() => openModal('admin')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-2.5 py-1 rounded text-[11px] flex items-center gap-1 shadow transition cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>{t('হিরো ব্যানার এডিট করুন', 'Edit Hero Banner')}</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Slider (3 Columns on Large Screen) */}
        <div className="lg:col-span-3 relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 min-h-[320px] sm:min-h-[360px] flex items-center bg-slate-950">
          {activeSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col justify-center px-6 sm:px-12 py-8 bg-gradient-to-r ${slide.bgGradient} ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background decorative image with overlay */}
              <img
                src={slide.image}
                alt={language === 'bn' ? slide.titleBn : slide.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />

              <div className="relative z-10 max-w-lg">
                <span className={`inline-block text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full mb-3 tracking-wider ${slide.badgeColor || 'bg-rose-500 text-white'}`}>
                  {language === 'bn' ? (slide.tagBn || slide.tag) : (slide.tag || slide.tagBn)}
                </span>

                <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-3 drop-shadow-sm">
                  {language === 'bn' ? (slide.titleBn || slide.title) : (slide.title || slide.titleBn)}
                </h1>

                <p className="text-slate-300 text-xs sm:text-sm font-normal mb-6 line-clamp-2 leading-relaxed">
                  {language === 'bn' ? (slide.subtitleBn || slide.subtitle) : (slide.subtitle || slide.subtitleBn)}
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => handleSlideAction(slide)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-md shadow-rose-900/40 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
                  >
                    <span>
                      {language === 'bn'
                        ? (slide.ctaTextBn || slide.ctaText || 'অন্বেষণ করুন')
                        : (slide.ctaText || slide.ctaTextBn || 'Explore Now')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openModal('aiAdvisor')}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-lg border border-white/20 backdrop-blur-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('AI পরামর্শ নিন', 'Get AI Advice')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          {activeSlides.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
                className="absolute left-3 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
                title="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % activeSlides.length)}
                className="absolute right-3 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
                title="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {activeSlides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
              {activeSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === currentSlide ? 'w-6 bg-rose-500' : 'w-2 bg-white/40'
                  }`}
                  title={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Side Promotion Cards (1 Column) */}
        <div className="flex flex-col gap-4">
          {heroBannerSettings.sidePromos.map((promo, idx) => {
            const isDark = promo.bgGradient.includes('slate-900') || promo.bgGradient.includes('slate-950') || promo.bgGradient.includes('black');
            return (
              <div
                key={promo.id || idx}
                onClick={() => handlePromoAction(promo)}
                className={`flex-1 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition cursor-pointer group border ${
                  isDark
                    ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700'
                    : 'bg-gradient-to-br from-rose-50 to-orange-50 text-slate-900 border-rose-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                        isDark ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-600 bg-rose-100'
                      }`}
                    >
                      {language === 'bn' ? (promo.badgeBn || promo.badge) : (promo.badge || promo.badgeBn)}
                    </span>
                    <div
                      className={`${
                        isDark ? 'text-emerald-400' : 'text-rose-600'
                      } group-hover:scale-110 transition`}
                    >
                      {renderPromoIcon(promo.icon)}
                    </div>
                  </div>

                  <h3
                    className={`font-bold text-sm mb-1 transition ${
                      isDark
                        ? 'text-white group-hover:text-emerald-300'
                        : 'text-slate-900 group-hover:text-rose-600'
                    }`}
                  >
                    {language === 'bn' ? (promo.titleBn || promo.title) : (promo.title || promo.titleBn)}
                  </h3>

                  <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                    {language === 'bn' ? (promo.subtitleBn || promo.subtitle) : (promo.subtitle || promo.subtitleBn)}
                  </p>
                </div>

                <div
                  className={`mt-3 flex items-center text-xs font-bold group-hover:translate-x-1 transition ${
                    isDark ? 'text-emerald-400' : 'text-rose-600'
                  }`}
                >
                  <span>
                    {language === 'bn'
                      ? (promo.ctaTextBn || promo.ctaText || 'বিস্তারিত')
                      : (promo.ctaText || promo.ctaTextBn || 'Learn More')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
