import React, { useState } from 'react';
import {
  Menu,
  ChevronDown,
  Flame,
  Percent,
  Sparkles,
  Cpu,
  Monitor,
  Laptop,
  HardDrive,
  Keyboard,
  Wifi,
  Printer,
  Camera,
  Layers,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { categoriesData } from '../../data/categories';

export const MegaMenu: React.FC = () => {
  const { language, t, selectCategory, filters, setFilters, openModal } = useShop();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'laptop':
        return <Laptop className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'component':
        return <Cpu className="w-4 h-4" />;
      case 'monitor':
        return <Monitor className="w-4 h-4" />;
      case 'accessories':
        return <Keyboard className="w-4 h-4" />;
      case 'networking':
        return <Wifi className="w-4 h-4" />;
      case 'office':
        return <Printer className="w-4 h-4" />;
      case 'gadgets':
        return <Camera className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div id="mega-nav" className="bg-slate-800 text-white shadow-md relative z-30 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between text-xs font-semibold">
        {/* Left: Category items with Mega Dropdown */}
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none py-1">
          {/* All Categories Trigger */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredCategory('all_categories')}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <button
              onClick={() => selectCategory('all')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition ${
                filters.category === 'all'
                  ? 'bg-rose-600 text-white'
                  : 'hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span className="whitespace-nowrap">{t('সকল ক্যাটাগরি', 'All Categories')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* All Categories Dropdown */}
            {hoveredCategory === 'all_categories' && (
              <div className="absolute top-full left-0 w-64 bg-white text-slate-800 rounded-b-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                {categoriesData.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      selectCategory(cat.id);
                      setHoveredCategory(null);
                    }}
                    className="px-4 py-2.5 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-rose-600">{getCategoryIcon(cat.id)}</span>
                      <span className="font-medium text-xs">
                        {language === 'bn' ? cat.nameBn : cat.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">›</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Individual Category Buttons */}
          {categoriesData.slice(0, 6).map((cat) => (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <button
                onClick={() => selectCategory(cat.id)}
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition whitespace-nowrap ${
                  filters.category === cat.id
                    ? 'bg-rose-600 text-white'
                    : 'hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span>{language === 'bn' ? cat.nameBn : cat.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Subcategories Dropdown */}
              {hoveredCategory === cat.id && cat.subcategories.length > 0 && (
                <div className="absolute top-full left-0 w-60 bg-white text-slate-800 rounded-b-xl shadow-2xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    {language === 'bn' ? cat.nameBn : cat.name}
                  </div>
                  {cat.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => {
                        selectCategory(cat.id, sub.id);
                        setHoveredCategory(null);
                      }}
                      className="px-4 py-2 hover:bg-rose-50 hover:text-rose-600 cursor-pointer text-xs font-medium flex items-center justify-between transition"
                    >
                      <span>{language === 'bn' ? sub.nameBn : sub.name}</span>
                      <span className="text-[10px] text-slate-400">→</span>
                    </div>
                  ))}
                  <div
                    onClick={() => {
                      selectCategory(cat.id);
                      setHoveredCategory(null);
                    }}
                    className="p-2 text-center text-xs font-semibold text-rose-600 bg-slate-50 hover:bg-rose-100 cursor-pointer border-t border-slate-100"
                  >
                    {t('সকল দেখুন', 'View All')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Specials Highlights */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 py-1">
          <button
            onClick={() => {
              selectCategory('all');
              setFilters((prev) => ({ ...prev, sortBy: 'discount' }));
            }}
            className="flex items-center gap-1 text-amber-300 hover:text-white px-2 py-1.5 rounded transition"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>{t('হট ডিলস ও অফার', 'Hot Deals & Offers')}</span>
          </button>

          <button
            onClick={() => openModal('aiAdvisor')}
            className="flex items-center gap-1 text-rose-300 hover:text-white px-2 py-1.5 rounded transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('AI পিসি কনসালটেন্ট', 'AI PC Consultant')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
