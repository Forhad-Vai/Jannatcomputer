import React, { useState } from 'react';
import { X, Search, Check, Plus, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PCComponentCategory, Product } from '../../types';
import { productsData } from '../../data/products';
import { useShop } from '../../context/ShopContext';

interface ComponentSelectorModalProps {
  category: PCComponentCategory;
  categoryName: string;
  categoryNameBn: string;
  onSelect: (product: Product) => void;
  onClose: () => void;
}

export const ComponentSelectorModal: React.FC<ComponentSelectorModalProps> = ({
  category,
  categoryName,
  categoryNameBn,
  onSelect,
  onClose,
}) => {
  const { language, t, pcBuild, products } = useShop();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');

  // Filter matching products
  const matchingProducts = products.filter((p) => {
    const isCategory =
      p.pcCategory === category ||
      (category === 'cpu' && p.subcategory === 'processor') ||
      (category === 'motherboard' && p.subcategory === 'motherboard') ||
      (category === 'gpu' && p.subcategory === 'graphics-card') ||
      (category === 'ram' && p.subcategory === 'ram') ||
      (category === 'storage' && p.subcategory === 'storage') ||
      (category === 'psu' && p.subcategory === 'power-supply') ||
      (category === 'casing' && p.subcategory === 'casing') ||
      (category === 'cooler' && p.subcategory === 'cooler') ||
      (category === 'monitor' && p.category === 'monitor') ||
      (category === 'accessories' && p.category === 'accessories');

    if (!isCategory) return false;

    if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q) || p.nameBn.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      if (!matchName && !matchBrand) return false;
    }

    return true;
  });

  // Extract brands for filter tabs
  const brands = ['all', ...Array.from(new Set(matchingProducts.map((p) => p.brand)))];

  // Check socket compatibility for motherboard vs cpu
  const checkCompatibilityWarning = (product: Product): string | null => {
    if (category === 'motherboard' && pcBuild.cpu && pcBuild.cpu.socket && product.socket) {
      if (pcBuild.cpu.socket !== product.socket) {
        return `সকেট অমিল! নির্বাচিত সিপিইউ (${pcBuild.cpu.socket}) এর সাথে এই মাদারবোর্ড (${product.socket}) মিলছে না।`;
      }
    }
    if (category === 'cpu' && pcBuild.motherboard && pcBuild.motherboard.socket && product.socket) {
      if (pcBuild.motherboard.socket !== product.socket) {
        return `সকেট অমিল! নির্বাচিত মাদারবোর্ড (${pcBuild.motherboard.socket}) এর সাথে এই সিপিইউ (${product.socket}) মিলছে না।`;
      }
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <span>{t('পছন্দ করুন:', 'Select:')}</span>
              <span className="text-rose-400 font-black">
                {language === 'bn' ? categoryNameBn : categoryName}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('আপনার পছন্দের পার্টস নির্বাচন করুন', 'Choose the best matching hardware component')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Brand Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('মডেল বা ব্র্যান্ড দিয়ে খুঁজুন...', 'Search by model or brand name...')}
              className="w-full bg-white pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
                  selectedBrand === b
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {b === 'all' ? t('সকল ব্র্যান্ড', 'All Brands') : b}
              </button>
            ))}
          </div>
        </div>

        {/* Products List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-2">
          {matchingProducts.length > 0 ? (
            matchingProducts.map((product) => {
              const warning = checkCompatibilityWarning(product);
              const isAlreadySelected =
                pcBuild[category] && pcBuild[category]?.id === product.id;

              return (
                <div
                  key={product.id}
                  className={`p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-rose-50/40 border ${
                    isAlreadySelected
                      ? 'border-rose-500 bg-rose-50/60'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Left info & Image */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-contain rounded-lg border border-slate-200 p-1 bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {product.brand}
                        </span>
                        {product.inStock && (
                          <span className="text-emerald-700 font-bold text-[10px]">
                            • {t('স্টকে আছে', 'In Stock')}
                          </span>
                        )}
                        {product.wattage && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                            ⚡ ~{product.wattage}W
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {language === 'bn' ? product.nameBn : product.name}
                      </h4>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                        <span>{product.warrantyBn || product.warranty}</span>
                        {product.socket && (
                          <span className="text-slate-700 font-semibold">
                            Socket: {product.socket}
                          </span>
                        )}
                      </div>

                      {warning && (
                        <div className="mt-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 p-1.5 rounded flex items-center gap-1 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{warning}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Price & Select Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="text-sm sm:text-base font-black text-rose-600">
                        ৳{product.price.toLocaleString('en-IN')}
                      </div>
                      {product.regularPrice > product.price && (
                        <div className="text-[10px] text-slate-400 line-through">
                          ৳{product.regularPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onSelect(product);
                        onClose();
                      }}
                      className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                        isAlreadySelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                      }`}
                    >
                      {isAlreadySelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('নির্বাচিত', 'Selected')}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t('যুক্ত করুন', 'Select Component')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              {t('এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।', 'No products found matching your search.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
