import React from 'react';
import { ArrowUpDown, SlidersHorizontal, Sparkles, X, PackageSearch } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { productsData } from '../../data/products';
import { categoriesData } from '../../data/categories';
import { ProductCard } from './ProductCard';
import { ProductFilter } from './ProductFilter';

export const ProductGrid: React.FC = () => {
  const { language, t, filters, setFilters, resetFilters, products } = useShop();

  // Filter logic
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }
    // Subcategory filter
    if (filters.subcategory !== 'all' && product.subcategory !== filters.subcategory) {
      return false;
    }
    // Brand filter
    if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) {
      return false;
    }
    // Price range
    if (product.price > filters.maxPrice || product.price < filters.minPrice) {
      return false;
    }
    // Stock filter
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }
    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q) || product.nameBn.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchModel = product.model.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchModel) return false;
    }
    return true;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filters.sortBy === 'price_low') return a.price - b.price;
    if (filters.sortBy === 'price_high') return b.price - a.price;
    if (filters.sortBy === 'rating') return b.rating - a.rating;
    if (filters.sortBy === 'discount') return (b.discountPercentage || 0) - (a.discountPercentage || 0);
    return 0; // 'popular'
  });

  // Determine header title
  const currentCategoryObj = categoriesData.find((c) => c.id === filters.category);
  const currentSubcategoryObj = currentCategoryObj?.subcategories.find(
    (s) => s.id === filters.subcategory
  );

  const displayTitle = currentSubcategoryObj
    ? language === 'bn'
      ? currentSubcategoryObj.nameBn
      : currentSubcategoryObj.name
    : currentCategoryObj
    ? language === 'bn'
      ? currentCategoryObj.nameBn
      : currentCategoryObj.name
    : t('জনপ্রিয় ও ফিচার্ড প্রোডাক্টসমূহ', 'Popular & Featured Products');

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Filter (Hidden on small screens or toggleable) */}
        <div className="hidden lg:block lg:col-span-1">
          <ProductFilter />
        </div>

        {/* Right Main Product Listing (3 Columns on Large Screen) */}
        <div className="lg:col-span-3">
          {/* Header Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {displayTitle}
                </h2>
                <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-200">
                  {sortedProducts.length} {t('টি পণ্য', 'Items')}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                {t(
                  '১০০% জেনুইন পার্টস ও অফিশিয়াল ওয়ারেন্টিসহ প্রস্তুতকৃত',
                  'Verified genuine components with official warranty in Bangladesh'
                )}
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                {t('সর্টিং:', 'Sort:')}
              </span>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value as any,
                  }))
                }
                className="bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 outline-hidden cursor-pointer"
              >
                <option value="popular">{t('সবচেয়ে জনপ্রিয়', 'Most Popular')}</option>
                <option value="price_low">{t('দাম: কম থেকে বেশি', 'Price: Low to High')}</option>
                <option value="price_high">{t('দাম: বেশি থেকে কম', 'Price: High to Low')}</option>
                <option value="discount">{t('সর্বোচ্চ ছাড়', 'Biggest Discount')}</option>
                <option value="rating">{t('টপ রেটেড', 'Top Rated')}</option>
              </select>
            </div>
          </div>

          {/* Active Filter Pills */}
          {(filters.category !== 'all' ||
            filters.subcategory !== 'all' ||
            filters.brand.length > 0 ||
            filters.searchQuery ||
            filters.inStockOnly) && (
            <div className="flex items-center gap-2 flex-wrap mb-4 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">{t('ফিল্টারসমূহ:', 'Active Filters:')}</span>

              {filters.searchQuery && (
                <span className="bg-white border border-slate-300 px-2 py-0.5 rounded-md font-medium text-slate-800 flex items-center gap-1">
                  <span>"{filters.searchQuery}"</span>
                  <X
                    className="w-3 h-3 cursor-pointer text-slate-400 hover:text-slate-700"
                    onClick={() => setFilters((p) => ({ ...p, searchQuery: '' }))}
                  />
                </span>
              )}

              {filters.category !== 'all' && (
                <span className="bg-white border border-slate-300 px-2 py-0.5 rounded-md font-medium text-slate-800 flex items-center gap-1">
                  <span>{currentCategoryObj ? (language === 'bn' ? currentCategoryObj.nameBn : currentCategoryObj.name) : filters.category}</span>
                  <X
                    className="w-3 h-3 cursor-pointer text-slate-400 hover:text-slate-700"
                    onClick={() => setFilters((p) => ({ ...p, category: 'all', subcategory: 'all' }))}
                  />
                </span>
              )}

              {filters.brand.map((b) => (
                <span
                  key={b}
                  className="bg-white border border-slate-300 px-2 py-0.5 rounded-md font-medium text-slate-800 flex items-center gap-1"
                >
                  <span>{b}</span>
                  <X
                    className="w-3 h-3 cursor-pointer text-slate-400 hover:text-slate-700"
                    onClick={() =>
                      setFilters((p) => ({ ...p, brand: p.brand.filter((item) => item !== b) }))
                    }
                  />
                </span>
              ))}

              <button
                onClick={resetFilters}
                className="text-rose-600 hover:text-rose-700 font-bold ml-auto cursor-pointer"
              >
                {t('সব মুছুন', 'Clear All')}
              </button>
            </div>
          )}

          {/* Product Grid or Empty State */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
              <PackageSearch className="w-16 h-16 text-slate-300 mx-auto mb-4 stroke-1" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {t('কোনো পণ্য খুঁজে পাওয়া যায়নি!', 'No Products Found!')}
              </h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto mb-5">
                {t(
                  'আপনার ফিল্টার বা সার্চ কিওয়ার্ড পরিবর্তন করে পুনরায় চেষ্টা করুন অথবা সরাসরি আমাদের কল করতে পারেন।',
                  'Try adjusting your filter options or search term or call us directly.'
                )}
              </p>
              <button
                onClick={resetFilters}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
              >
                {t('ফিল্টার রিসেট করুন', 'Reset Filters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
