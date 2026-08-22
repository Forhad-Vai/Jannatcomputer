import React, { useState, useRef } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  ArrowRight,
  Eye,
  Layers,
  Cpu,
  Truck,
  Shield,
  Zap,
  Laptop,
  Package,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  UploadCloud,
  FileImage,
  RefreshCw,
  X,
  Link as LinkIcon,
  Check,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { HeroSlide, HeroSidePromo, HeroBannerSettings } from '../../types';

// Helper to compress and convert image file to Base64 data URL
const compressAndReadFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } else {
          resolve(readerEvent.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(readerEvent.target?.result as string);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const HeroBannerEditorTab: React.FC = () => {
  const {
    language,
    t,
    heroBannerSettings,
    updateHeroBannerSettings,
    resetHeroBannerSettings,
    showToast,
  } = useShop();

  const [formData, setFormData] = useState<HeroBannerSettings>(heroBannerSettings);
  const [expandedSlideId, setExpandedSlideId] = useState<string | null>(
    heroBannerSettings.slides[0]?.id || null
  );
  const [activeSubTab, setActiveSubTab] = useState<'slides' | 'sidePromos' | 'settings'>('slides');
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);
  const [dragOverSlideId, setDragOverSlideId] = useState<string | null>(null);
  const [showUrlInputForSlide, setShowUrlInputForSlide] = useState<{ [key: string]: boolean }>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileUpload = async (slideId: string, file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast(
        language === 'bn'
          ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) সিলেক্ট করুন!'
          : 'Please select an image file (JPG, PNG, WebP)!',
        'error'
      );
      return;
    }

    try {
      setUploadingSlideId(slideId);
      const dataUrl = await compressAndReadFile(file);
      handleSlideChange(slideId, 'image', dataUrl);
      showToast(
        language === 'bn'
          ? 'ছবি সফলভাবে আপলোড করা হয়েছে!'
          : 'Image uploaded successfully!'
      );
    } catch (err) {
      showToast(
        language === 'bn'
          ? 'ছবি আপলোডে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
          : 'Failed to process image. Please try again.',
        'error'
      );
    } finally {
      setUploadingSlideId(null);
    }
  };

  React.useEffect(() => {
    setFormData(heroBannerSettings);
  }, [heroBannerSettings]);

  // Preset background gradient palettes
  const gradientPresets = [
    {
      name: 'Midnight Rose',
      nameBn: 'মিডনাইট রোজ (ডিফল্ট)',
      gradient: 'from-slate-900 via-rose-950 to-slate-900',
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      name: 'Crimson Gaming',
      nameBn: 'ক্রিমসন গেমিং',
      gradient: 'from-slate-950 via-red-900 to-slate-950',
      badgeColor: 'bg-amber-400 text-slate-950',
    },
    {
      name: 'Cyber Emerald',
      nameBn: 'সাইবার এমারেল্ড',
      gradient: 'from-slate-900 via-zinc-900 to-rose-950',
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      name: 'Deep Indigo Tech',
      nameBn: 'ডিপ ইন্ডিগো টেক',
      gradient: 'from-slate-950 via-indigo-950 to-slate-900',
      badgeColor: 'bg-indigo-500 text-white',
    },
    {
      name: 'Golden Amber Pro',
      nameBn: 'গোল্ডেন অ্যাম্বার প্রো',
      gradient: 'from-slate-950 via-amber-950 to-slate-900',
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      name: 'Dark Obsidian',
      nameBn: 'ডার্ক অবসিডিয়ান',
      gradient: 'from-zinc-950 via-slate-900 to-zinc-950',
      badgeColor: 'bg-rose-600 text-white',
    },
  ];

  // Preset tech stock images for quick selection
  const stockImagePresets = [
    {
      label: 'Gaming PC Rig',
      url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Pro Laptop',
      url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'GPU & Monitor',
      url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'RGB Keyboard & Gear',
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Motherboard & Chips',
      url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleSlideChange = (slideId: string, field: keyof HeroSlide, value: any) => {
    setFormData((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => (s.id === slideId ? { ...s, [field]: value } : s)),
    }));
  };

  const handleSidePromoChange = (promoId: string, field: keyof HeroSidePromo, value: any) => {
    setFormData((prev) => ({
      ...prev,
      sidePromos: prev.sidePromos.map((p) => (p.id === promoId ? { ...p, [field]: value } : p)),
    }));
  };

  const handleAddNewSlide = () => {
    const newId = `slide-${Date.now()}`;
    const newSlide: HeroSlide = {
      id: newId,
      tag: 'NEW EXCLUSIVE OFFER',
      tagBn: 'নতুন স্পেশাল অফার',
      title: 'Mega Hardware Discounts Available',
      titleBn: 'কম্পিউটার পার্টসে মেগা ছাড় চলছে',
      subtitle: 'Shop original tech products with warranty and fast delivery.',
      subtitleBn: 'অফিসিয়াল ওয়ারেন্টি ও দ্রুত ডেলিভারির সাথে আসল টেক পণ্য কিনুন।',
      bgGradient: 'from-slate-900 via-rose-950 to-slate-900',
      badgeColor: 'bg-rose-500 text-white',
      ctaText: 'Explore Collection',
      ctaTextBn: 'কালেকশন দেখুন',
      ctaActionType: 'category',
      ctaActionValue: 'all',
      image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=800&q=80',
      isActive: true,
    };

    setFormData((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
    setExpandedSlideId(newId);
    showToast(t('নতুন স্লাইড যোগ করা হয়েছে', 'New slide added to editor'));
  };

  const handleDeleteSlide = (id: string) => {
    if (formData.slides.length <= 1) {
      showToast(t('কমপক্ষে ১টি স্লাইড থাকতে হবে!', 'At least one slide must remain!'), 'error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      slides: prev.slides.filter((s) => s.id !== id),
    }));
    showToast(t('স্লাইডটি সরানো হয়েছে', 'Slide removed'));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeroBannerSettings(formData);
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6">
      {/* Top Banner Header & Stats */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{t('হিরো ব্যানার ও প্রমোশন ম্যানেজার', 'Hero Banner & Promotions Manager')}</span>
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                LIVE CMS
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              {t(
                'ওয়েবসাইটের প্রধান ব্যানার স্লাইডার, টেক্সট, ছবি, বাটন ও সাইড প্রমো কার্ড সম্পূর্ণ পরিবর্তন করুন',
                'Fully customize main carousel slides, texts, imagery, CTA buttons & side promo cards'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={resetHeroBannerSettings}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('ডিফল্ট রিস্টোর', 'Reset Defaults')}</span>
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-rose-900/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t('পরিবর্তন সংরক্ষণ করুন', 'Save All Changes')}</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('slides')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'slides'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('প্রধান ব্যানার স্লাইডার সমূহ', 'Main Carousel Slides')}</span>
          <span className="bg-slate-900 text-amber-400 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
            {formData.slides.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sidePromos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'sidePromos'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('সাইড প্রমো কার্ড (২টি)', 'Side Promo Cards (2)')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'settings'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t('অটো-স্লাইড স্পিড', 'Slide Speed')}</span>
        </button>
      </div>

      {/* SUB-TAB 1: SLIDES */}
      {activeSubTab === 'slides' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-200 flex items-center gap-2">
              <span>{t('স্লাইড তালিকা (Slides List)', 'Slides List')}</span>
              <span className="text-xs font-normal text-slate-400">
                ({formData.slides.length} {t('টি স্লাইড তৈরি আছে', 'slides available')})
              </span>
            </h4>

            <button
              type="button"
              onClick={handleAddNewSlide}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('নতুন স্লাইড তৈরি করুন', 'Add New Slide')}</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.slides.map((slide, index) => {
              const isExpanded = expandedSlideId === slide.id;
              return (
                <div
                  key={slide.id}
                  className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden transition"
                >
                  {/* Slide Accordion Bar */}
                  <div
                    onClick={() => setExpandedSlideId(isExpanded ? null : slide.id)}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-750 select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
                        <img
                          src={slide.image}
                          alt="thumbnail"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-rose-400">
                            #{index + 1} {slide.tagBn || slide.tag}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                              slide.isActive !== false
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {slide.isActive !== false ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-100 truncate mt-0.5">
                          {slide.titleBn || slide.title}
                        </h5>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(slide.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
                        title={t('মুছে ফেলুন', 'Delete Slide')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="text-slate-400 p-1">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Slide Edit Form Content */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-slate-700/80 bg-slate-900/60 space-y-4">
                      {/* Live Preview Card */}
                      <div className="relative rounded-xl overflow-hidden p-4 sm:p-6 bg-slate-950 border border-slate-800 shadow-inner">
                        <div className="absolute top-2 right-2 text-[10px] font-bold bg-slate-900/80 text-amber-400 border border-slate-700 px-2 py-0.5 rounded-full z-20 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{t('লাইভ প্রিভিউ', 'Live Preview')}</span>
                        </div>

                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-90`} />
                        <img
                          src={slide.image}
                          alt="preview"
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />

                        <div className="relative z-10 max-w-md">
                          <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mb-2 tracking-wider ${slide.badgeColor}`}>
                            {slide.tagBn || slide.tag || 'OFFER TAG'}
                          </span>
                          <h4 className="text-lg sm:text-xl font-black text-white leading-tight mb-1.5">
                            {slide.titleBn || slide.title || 'Your Slide Headline Here'}
                          </h4>
                          <p className="text-slate-300 text-xs line-clamp-2 mb-4 leading-relaxed">
                            {slide.subtitleBn || slide.subtitle || 'Short descriptive promotional text goes here.'}
                          </p>
                          <div className="inline-flex items-center gap-1.5 bg-rose-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow">
                            <span>{slide.ctaTextBn || slide.ctaText || 'Button Text'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>

                      {/* Active Switch */}
                      <div className="flex items-center justify-between bg-slate-800/70 p-3 rounded-xl border border-slate-700">
                        <div>
                          <label className="text-xs font-bold text-slate-200">
                            {t('স্লাইড স্ট্যাটাস (Active / Inactive)', 'Slide Status')}
                          </label>
                          <p className="text-[11px] text-slate-400">
                            {t('সক্রিয় থাকলে ওয়েবসাইটে স্লাইডারে ঘুরবে', 'Enable to show this slide in the live carousel')}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={slide.isActive !== false}
                          onChange={(e) => handleSlideChange(slide.id, 'isActive', e.target.checked)}
                          className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                        />
                      </div>

                      {/* Title & Tag Inputs (Bengali & English) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {t('ট্যাগ / অফার ব্যাজ (বাংলা)', 'Tag / Badge (Bengali)')} *
                          </label>
                          <input
                            type="text"
                            value={slide.tagBn || ''}
                            onChange={(e) => handleSlideChange(slide.id, 'tagBn', e.target.value)}
                            placeholder="মেগা টেক অফার ২০২৬"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {t('ট্যাগ / অফার ব্যাজ (English)', 'Tag / Badge (English)')}
                          </label>
                          <input
                            type="text"
                            value={slide.tag || ''}
                            onChange={(e) => handleSlideChange(slide.id, 'tag', e.target.value)}
                            placeholder="MEGA TECH OFFER 2026"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {t('প্রধান শিরোনাম (বাংলা)', 'Main Headline (Bengali)')} *
                          </label>
                          <input
                            type="text"
                            value={slide.titleBn || ''}
                            onChange={(e) => handleSlideChange(slide.id, 'titleBn', e.target.value)}
                            placeholder="কাস্টম পিসি বিল্ড করুন সেরা মূল্যে"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {t('প্রধান শিরোনাম (English)', 'Main Headline (English)')}
                          </label>
                          <input
                            type="text"
                            value={slide.title || ''}
                            onChange={(e) => handleSlideChange(slide.id, 'title', e.target.value)}
                            placeholder="Build Your Ultimate Custom PC"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Subtitle Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {t('সাবটাইটেল / বিবরণ (বাংলা)', 'Subtitle / Description (Bengali)')} *
                          </label>
                          <textarea
                            rows={2}
                            value={slide.subtitleBn || ''}
                            onChange={(e) => handleSlideChange(slide.id, 'subtitleBn', e.target.value)}
                            placeholder="ইন্টেল ১৪তম জেন ও এএমডি প্রসেসর সাথে ফ্রি অ্যাসেম্বলি..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none resize-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {t('সাবটাইটেল / বিবরণ (English)', 'Subtitle / Description (English)')}
                          </label>
                          <textarea
                            rows={2}
                            value={slide.subtitle || ''}
                            onChange={(e) => handleSlideChange(slide.id, 'subtitle', e.target.value)}
                            placeholder="Intel 14th Gen & AMD Processors with Free Assembly..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none resize-none"
                          />
                        </div>
                      </div>

                      {/* Direct Image Upload & Selector */}
                      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <UploadCloud className="w-4 h-4 text-amber-400" />
                            <span>{t('সরাসরি ব্যানার ছবি আপলোড (Direct Image Upload)', 'Direct Banner Image Upload')} *</span>
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              setShowUrlInputForSlide((prev) => ({
                                ...prev,
                                [slide.id]: !prev[slide.id],
                              }))
                            }
                            className="text-[11px] text-amber-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer"
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>
                              {showUrlInputForSlide[slide.id]
                                ? t('লিংক ইনপুট বন্ধ করুন', 'Hide URL Input')
                                : t('বা লিংক দিয়ে ছবি দিন', 'Or use image link')}
                            </span>
                          </button>
                        </div>

                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={(el) => {
                            fileInputRefs.current[slide.id] = el;
                          }}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(slide.id, file);
                            // reset input value so re-selecting same file fires onChange
                            e.target.value = '';
                          }}
                          className="hidden"
                        />

                        {/* Drag and Drop / Click Upload Box */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragOverSlideId(slide.id);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragOverSlideId(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragOverSlideId(null);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleFileUpload(slide.id, file);
                          }}
                          onClick={() => fileInputRefs.current[slide.id]?.click()}
                          className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                            dragOverSlideId === slide.id
                              ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                              : 'border-slate-600 bg-slate-900/80 hover:border-amber-500/60 hover:bg-slate-900'
                          }`}
                        >
                          {uploadingSlideId === slide.id ? (
                            <div className="py-4 flex flex-col items-center gap-2">
                              <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
                              <span className="text-xs font-bold text-amber-400">
                                {t('ছবি প্রসেস ও আপলোড হচ্ছে...', 'Processing & uploading image...')}
                              </span>
                            </div>
                          ) : slide.image ? (
                            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 shadow">
                                  <img
                                    src={slide.image}
                                    alt="current"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-left">
                                  <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{t('ছবি সিলেক্ট করা আছে', 'Image Selected')}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-[200px] sm:max-w-xs font-mono">
                                    {slide.image.startsWith('data:')
                                      ? t('ডিভাইস থেকে আপলোডকৃত ইমেজ (Local Upload)', 'Uploaded from local device')
                                      : slide.image}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRefs.current[slide.id]?.click();
                                  }}
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 transition shadow cursor-pointer"
                                >
                                  <UploadCloud className="w-3.5 h-3.5" />
                                  <span>{t('নতুন ছবি আপলোড', 'Change / Upload New')}</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="py-2 flex flex-col items-center gap-1.5">
                              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                                <UploadCloud className="w-6 h-6" />
                              </div>
                              <span className="text-xs font-black text-white">
                                {t('কম্পিউটার বা মোবাইল থেকে সরাসরি ছবি আপলোড করুন', 'Click to browse or Drag & Drop photo here')}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {t('JPG, PNG, WebP (অটো রিসাইজ ও কম্প্রেশন সহ)', 'Supports JPG, PNG, WebP with auto optimization')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Optional URL Input if toggled */}
                        {showUrlInputForSlide[slide.id] && (
                          <div className="pt-2 border-t border-slate-700/80">
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">
                              {t('অনলাইন ইমেজ লিংক (Image Web URL)', 'Image Web URL')}
                            </label>
                            <input
                              type="url"
                              value={slide.image || ''}
                              onChange={(e) => handleSlideChange(slide.id, 'image', e.target.value)}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                            />
                          </div>
                        )}

                        {/* Quick Stock Presets */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                            <FileImage className="w-3 h-3 text-slate-400" />
                            <span>{t('রেডিমেড প্রিসেট ছবি:', 'Sample Presets:')}</span>
                          </span>
                          {stockImagePresets.map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => handleSlideChange(slide.id, 'image', preset.url)}
                              className="text-[10px] bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded-md border border-slate-700 transition cursor-pointer"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* CTA Button & Action */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {t('বাটন টেক্সট (বাংলা)', 'Button Text (Bengali)')} *
                          </label>
                          <input
                            type="text"
                            value={slide.ctaTextBn || ''}
                            onChange={(e) => handleSlideChange(slide.id, 'ctaTextBn', e.target.value)}
                            placeholder="পিসি বিল্ডার খুলুন"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {t('বাটন টেক্সট (English)', 'Button Text (English)')}
                          </label>
                          <input
                            type="text"
                            value={slide.ctaText || ''}
                            onChange={(e) => handleSlideChange(slide.id, 'ctaText', e.target.value)}
                            placeholder="Open PC Builder"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {t('ক্লিক অ্যাকশন (Action On Click)', 'Click Action')}
                          </label>
                          <select
                            value={slide.ctaActionType || 'pcBuilder'}
                            onChange={(e) =>
                              handleSlideChange(
                                slide.id,
                                'ctaActionType',
                                e.target.value as HeroSlide['ctaActionType']
                              )
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none cursor-pointer"
                          >
                            <option value="pcBuilder">🖥️ পিসি বিল্ডার (PC Builder Tool)</option>
                            <option value="category">📦 ক্যাটাগরি / শপ পেজ (Category Page)</option>
                            <option value="aiAdvisor">🤖 AI অ্যাডভাইজার চ্যাট (AI Advisor)</option>
                            <option value="orderTrack">🚚 অর্ডার ট্র্যাক করুন (Order Track)</option>
                            <option value="customLink">🔗 কাস্টম লিংক (Custom Link)</option>
                          </select>
                        </div>
                      </div>

                      {/* If Category is selected, allow selecting category */}
                      {slide.ctaActionType === 'category' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {t('টার্গেট ক্যাটাগরি আইডি (Target Category)', 'Target Category')}
                          </label>
                          <select
                            value={slide.ctaActionValue || 'all'}
                            onChange={(e) => handleSlideChange(slide.id, 'ctaActionValue', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none cursor-pointer"
                          >
                            <option value="all">সকল পণ্য (All Products)</option>
                            <option value="laptop">ল্যাপটপ ও নোটবুক (Laptops)</option>
                            <option value="desktop">ডেস্কটপ পিসি (Desktop PCs)</option>
                            <option value="component">কম্পোনেন্টস ও পার্টস (Components)</option>
                            <option value="monitor">মনিটর ও ডিসপ্লে (Monitors)</option>
                            <option value="accessories">অ্যাক্সেসরিজ ও গেমিং গিয়ার (Accessories)</option>
                          </select>
                        </div>
                      )}

                      {/* Color Theme Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          {t('ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট থিম (Background Theme)', 'Theme Preset')}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {gradientPresets.map((preset, gIdx) => (
                            <button
                              key={gIdx}
                              type="button"
                              onClick={() => {
                                handleSlideChange(slide.id, 'bgGradient', preset.gradient);
                                handleSlideChange(slide.id, 'badgeColor', preset.badgeColor);
                              }}
                              className={`p-2 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                                slide.bgGradient === preset.gradient
                                  ? 'border-amber-400 bg-slate-800 shadow-md ring-1 ring-amber-400/50'
                                  : 'border-slate-700 bg-slate-850 hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-5 h-5 rounded-full bg-gradient-to-r ${preset.gradient} border border-white/20`}
                                />
                                <span className="text-[11px] font-bold text-slate-200">
                                  {language === 'bn' ? preset.nameBn : preset.name}
                                </span>
                              </div>
                              {slide.bgGradient === preset.gradient && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SIDE PROMOS */}
      {activeSubTab === 'sidePromos' && (
        <div className="space-y-4">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 text-xs text-slate-300">
            {t(
              'ব্যানারের ডান পাশে প্রদর্শিত ২টি প্রমো কার্ডের তথ্য নিচে থেকে এডিট করুন।',
              'Customize the 2 promotional cards displayed next to the main carousel.'
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.sidePromos.map((promo, pIndex) => (
              <div
                key={promo.id}
                className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-300 flex items-center justify-center text-xs font-bold">
                      {pIndex + 1}
                    </span>
                    <span>{t(`প্রমো কার্ড #${pIndex + 1}`, `Promo Card #${pIndex + 1}`)}</span>
                  </h4>
                  <span className="text-xs text-amber-400 font-mono font-bold">
                    {promo.actionType}
                  </span>
                </div>

                {/* Badge text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('ব্যাজ টেক্সট (বাংলা)', 'Badge Text (Bengali)')} *
                    </label>
                    <input
                      type="text"
                      value={promo.badgeBn || ''}
                      onChange={(e) => handleSidePromoChange(promo.id, 'badgeBn', e.target.value)}
                      placeholder="পিসি বিল্ডার"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('ব্যাজ টেক্সট (English)', 'Badge Text (English)')}
                    </label>
                    <input
                      type="text"
                      value={promo.badge || ''}
                      onChange={(e) => handleSidePromoChange(promo.id, 'badge', e.target.value)}
                      placeholder="PC Builder Tool"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('শিরোনাম (বাংলা)', 'Title (Bengali)')} *
                    </label>
                    <input
                      type="text"
                      value={promo.titleBn || ''}
                      onChange={(e) => handleSidePromoChange(promo.id, 'titleBn', e.target.value)}
                      placeholder="আপনার পছন্দের কনফিগারেশন করুন"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('শিরোনাম (English)', 'Title (English)')}
                    </label>
                    <input
                      type="text"
                      value={promo.title || ''}
                      onChange={(e) => handleSidePromoChange(promo.id, 'title', e.target.value)}
                      placeholder="Customize Your Dream Rig"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Subtitle / Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('বিবরণ (বাংলা)', 'Description (Bengali)')} *
                    </label>
                    <textarea
                      rows={2}
                      value={promo.subtitleBn || ''}
                      onChange={(e) => handleSidePromoChange(promo.id, 'subtitleBn', e.target.value)}
                      placeholder="বাজেট অনুসারে পার্টস পছন্দ ও কোটেশন প্রিন্ট..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('বিবরণ (English)', 'Description (English)')}
                    </label>
                    <textarea
                      rows={2}
                      value={promo.subtitle || ''}
                      onChange={(e) => handleSidePromoChange(promo.id, 'subtitle', e.target.value)}
                      placeholder="Instant budget calculator, wattage check..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Icon & Action Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('আইকন (Icon)', 'Card Icon')}
                    </label>
                    <select
                      value={promo.icon}
                      onChange={(e) =>
                        handleSidePromoChange(promo.id, 'icon', e.target.value as HeroSidePromo['icon'])
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none cursor-pointer"
                    >
                      <option value="cpu">🖥️ প্রসেসর / সিপিইউ (CPU)</option>
                      <option value="truck">🚚 কুরিয়ার ট্রাক (Delivery Truck)</option>
                      <option value="shield">🛡️ শিল্ড / ওয়ারেন্টি (Shield Guarantee)</option>
                      <option value="zap">⚡ লাইটনিং অফার (Zap Offer)</option>
                      <option value="laptop">💻 ল্যাপটপ (Laptop)</option>
                      <option value="package">📦 প্যাকেজ (Package)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('ক্লিক অ্যাকশন (Click Action)', 'Click Action')}
                    </label>
                    <select
                      value={promo.actionType}
                      onChange={(e) =>
                        handleSidePromoChange(
                          promo.id,
                          'actionType',
                          e.target.value as HeroSidePromo['actionType']
                        )
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none cursor-pointer"
                    >
                      <option value="pcBuilder">🖥️ পিসি বিল্ডার টুল (PC Builder)</option>
                      <option value="orderTrack">🚚 অর্ডার ট্র্যাক করুন (Order Track)</option>
                      <option value="aiAdvisor">🤖 AI অ্যাডভাইজার (AI Advisor)</option>
                      <option value="category">📦 ক্যাটাগরি শপ (Category)</option>
                    </select>
                  </div>
                </div>

                {/* Button Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('বাটন টেক্সট (বাংলা)', 'Button Text (Bengali)')} *
                    </label>
                    <input
                      type="text"
                      value={promo.ctaTextBn || ''}
                      onChange={(e) => handleSidePromoChange(promo.id, 'ctaTextBn', e.target.value)}
                      placeholder="এখনই শুরু করুন"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t('বাটন টেক্সট (English)', 'Button Text (English)')}
                    </label>
                    <input
                      type="text"
                      value={promo.ctaText || ''}
                      onChange={(e) => handleSidePromoChange(promo.id, 'ctaText', e.target.value)}
                      placeholder="Start Building"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AUTO-SLIDE SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-4 max-w-xl">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{t('স্লাইডার অটো-প্লে সেটিংস', 'Carousel Auto-Play Settings')}</span>
          </h4>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {t('প্রতিটি স্লাইড প্রদর্শনের সময় (সেকেন্ডে)', 'Slide Duration (Seconds)')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={2}
                max={30}
                value={formData.autoSlideIntervalSeconds || 5}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    autoSlideIntervalSeconds: Number(e.target.value) || 5,
                  }))
                }
                className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-rose-500 focus:outline-none"
              />
              <span className="text-xs text-slate-400 font-medium">
                {t('সেকেন্ড পর পর স্বয়ংক্রিয়ভাবে স্লাইড পরিবর্তন হবে', 'Seconds interval between transitions')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={resetHeroBannerSettings}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
        >
          {t('ডিফল্ট রিস্টোর করুন', 'Reset to Factory Defaults')}
        </button>

        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-rose-900/40 transition flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{t('হিরো ব্যানার পরিবর্তন সেভ করুন', 'Save Hero Banner Changes')}</span>
        </button>
      </div>
    </form>
  );
};
