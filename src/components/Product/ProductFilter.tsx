import React from 'react';
import { Filter, RotateCcw, Check, ChevronRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { categoriesData } from '../../data/categories';
import { productsData } from '../../data/products';

export const ProductFilter: React.FC = () => {
  const { language, t, filters, setFilters, resetFilters } = useShop();

  // Extract unique brands
  const allBrands = Array.from(new Set(productsData.map((p) => p.brand))).sort();

  const handleCategoryClick = (catId: string) => {
    setFilters((prev) => ({
      ...prev,
      category: catId,
      subcategory: 'all',
    }));
  };

  const handleSubcategoryClick = (catId: string, subId: string) => {
    setFilters((prev) => ({
      ...prev,
      category: catId,
      subcategory: subId,
    }));
  };

  const toggleBrand = (brand: string) => {
    setFilters((prev) => {
      const exists = prev.brand.includes(brand);
      if (exists) {
        return { ...prev, brand: prev.brand.filter((b) => b !== brand) };
      } else {
        return { ...prev, brand: [...prev.brand, brand] };
      }
    });
  };

  return (
    <aside id="product-filters" className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <Filter className="w-4 h-4 text-rose-600" />
          <span>{t('ফিল্টার ও রিফাইন', 'Filter & Refine')}</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('রিসেট', 'Reset')}</span>
        </button>
      </div>

      {/* Category Accordion */}
      <div className="mb-5">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          {t('ক্যাটাগরি সমূহ', 'Categories')}
        </h4>
        <div className="space-y-1 text-xs">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition cursor-pointer ${
              filters.category === 'all'
                ? 'bg-rose-50 text-rose-600 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{t('সকল পণ্য', 'All Products')}</span>
            <span className="text-[10px] text-slate-400 font-normal">({productsData.length})</span>
          </button>

          {categoriesData.map((cat) => {
            const isSelected = filters.category === cat.id;
            const count = productsData.filter((p) => p.category === cat.id).length;

            return (
              <div key={cat.id} className="space-y-1">
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50 text-rose-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{language === 'bn' ? cat.nameBn : cat.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({count})</span>
                </button>

                {isSelected && cat.subcategories.length > 0 && (
                  <div className="pl-3 space-y-1 border-l-2 border-rose-200 ml-2 py-1">
                    {cat.subcategories.map((sub) => {
                      const isSubSelected = filters.subcategory === sub.id;
                      const subCount = productsData.filter((p) => p.subcategory === sub.id).length;

                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSubcategoryClick(cat.id, sub.id)}
                          className={`w-full text-left text-[11px] px-2 py-1 rounded flex items-center justify-between transition cursor-pointer ${
                            isSubSelected
                              ? 'text-rose-600 font-bold bg-rose-50/70'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <span className="truncate">{language === 'bn' ? sub.nameBn : sub.name}</span>
                          <span className="text-[10px] text-slate-400">({subCount})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="mb-5 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          {t('মূল্য পরিসীমা (টাকা)', 'Price Range (BDT)')}
        </h4>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="400000"
            step="5000"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
            }
            className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
          />
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>৳0</span>
            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              ৳{filters.maxPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Availability Filter */}
      <div className="mb-5 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          {t('উপলব্ধতা', 'Availability')}
        </h4>
        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))
            }
            className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
          />
          <span>{t('শুধুমাত্র স্টকে আছে (In Stock)', 'In Stock Only')}</span>
        </label>
      </div>

      {/* Brands List */}
      <div className="pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          {t('ব্র্যান্ডসমূহ', 'Brands')}
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {allBrands.map((brand) => (
            <label
              key={brand}
              className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none py-0.5"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.brand.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-3.5 h-3.5 rounded text-rose-600 accent-rose-600 cursor-pointer"
                />
                <span className="font-medium">{brand}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                ({productsData.filter((p) => p.brand === brand).length})
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};
