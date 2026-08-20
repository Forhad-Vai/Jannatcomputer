import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Cpu,
  ShoppingCart,
  Heart,
  Layers,
  User,
  X,
  ArrowRight,
  ShieldCheck,
  Package,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { productsData } from '../../data/products';
import { categoriesData } from '../../data/categories';
import { Product } from '../../types';

export const Navbar: React.FC = () => {
  const {
    language,
    t,
    cartTotalCount,
    cartSubtotal,
    wishlist,
    compareList,
    openModal,
    viewProductDetails,
    filters,
    setFilters,
    selectCategory,
    products,
    currentUser,
    isAdmin,
    footerSettings,
  } = useShop();

  const [searchInput, setSearchInput] = useState('');
  const [selectedSearchCategory, setSelectedSearchCategory] = useState('all');
  const [showLiveSearch, setShowLiveSearch] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const logoImageSrc = footerSettings?.logoUrl || 'https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png';

  // Filter products for live search preview
  const searchResults: Product[] = searchInput.trim().length > 1
    ? products.filter((product) => {
        const matchesCategory =
          selectedSearchCategory === 'all' || product.category === selectedSearchCategory;
        const matchesQuery =
          product.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          product.nameBn.toLowerCase().includes(searchInput.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchInput.toLowerCase()) ||
          product.model.toLowerCase().includes(searchInput.toLowerCase());
        return matchesCategory && matchesQuery;
      }).slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowLiveSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setFilters((prev) => ({
        ...prev,
        searchQuery: searchInput.trim(),
        category: selectedSearchCategory,
      }));
      setShowLiveSearch(false);
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo */}
        <div
          onClick={() => {
            selectCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0 group"
        >
          <div className="relative flex items-center justify-center">
            {/* Ambient colorful glow halo behind logo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-600 via-amber-500 to-rose-400 rounded-xl blur-md opacity-35 group-hover:opacity-75 group-hover:scale-110 transition duration-300"></div>
            <img
              src={logoImageSrc}
              alt="Jannat Computers Logo"
              referrerPolicy="no-referrer"
              className="relative h-10 sm:h-12 w-auto max-w-[140px] sm:max-w-[160px] object-contain drop-shadow-[0_4px_12px_rgba(225,29,72,0.4)] group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center">
                <span className="text-rose-600 font-black">জান্নাত</span>
                <span className="ml-1 text-slate-800">কম্পিউটার্স</span>
              </span>
              <span className="hidden md:inline-block bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Official
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none tracking-tight">
              {t('Jannat Computers • বিশ্বস্ততার সাথে সেরা প্রযুক্তি', 'Jannat Computers • Tech With Trust')}
            </p>
          </div>
        </div>

        {/* Global Live Search Bar */}
        <div ref={searchContainerRef} className="flex-1 max-w-2xl relative hidden md:block">
          <form onSubmit={handleSearchSubmit} className="flex items-center rounded-lg border-2 border-rose-600 overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-rose-200 transition">
            {/* Category Dropdown inside search */}
            <select
              value={selectedSearchCategory}
              onChange={(e) => setSelectedSearchCategory(e.target.value)}
              className="bg-slate-100 text-slate-700 text-xs px-3 py-2.5 border-r border-slate-200 outline-hidden font-medium cursor-pointer max-w-[130px] truncate"
            >
              <option value="all">{t('সকল ক্যাটাগরি', 'All Categories')}</option>
              {categoriesData.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {language === 'bn' ? cat.nameBn : cat.name}
                </option>
              ))}
            </select>

            {/* Input */}
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowLiveSearch(true);
              }}
              onFocus={() => setShowLiveSearch(true)}
              placeholder={t('পণ্য, প্রসেসর, ল্যাপটপ, গ্রাফিক্স কার্ড খুঁজুন...', 'Search for laptop, desktop, GPU, processor, monitor...')}
              className="flex-1 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-hidden bg-white"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setShowLiveSearch(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Search Button */}
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 font-semibold text-sm flex items-center justify-center transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Live Search Autocomplete Overlay */}
          {showLiveSearch && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
              <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>{t('অনুসন্ধানের ফলাফল', 'Search Results')} ({searchResults.length})</span>
                <span className="text-[11px] text-rose-600">{t('বিস্তারিত দেখতে ক্লিক করুন', 'Click to view')}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      viewProductDetails(product);
                      setShowLiveSearch(false);
                    }}
                    className="p-2.5 hover:bg-rose-50/60 flex items-center gap-3 cursor-pointer transition"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-md border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {language === 'bn' ? product.nameBn : product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                          {product.brand}
                        </span>
                        <span>{product.model}</span>
                        {product.inStock ? (
                          <span className="text-emerald-600 font-medium">
                            • {t('স্টকে আছে', 'In Stock')}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium">
                            • {t('আসিতেছে', 'Upcoming')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-rose-600">
                        ৳{product.price.toLocaleString('en-IN')}
                      </div>
                      {product.regularPrice > product.price && (
                        <div className="text-[10px] text-slate-400 line-through">
                          ৳{product.regularPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div
                onClick={handleSearchSubmit}
                className="p-2 bg-slate-50 text-center text-xs font-semibold text-rose-600 hover:bg-rose-100 cursor-pointer transition border-t border-slate-100"
              >
                {t('সকল ফলাফল দেখুন', 'View all matching products')} →
              </div>
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* PC Builder CTA Button (Ryans / StarTech iconic feature) */}
          <button
            onClick={() => openModal('pcBuilder')}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm shadow-md shadow-rose-200 transition transform active:scale-95 cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="hidden xs:inline">{t('পিসি বিল্ডার', 'PC Builder')}</span>
            <span className="xs:hidden">{t('বিল্ডার', 'Builder')}</span>
          </button>

          {/* AI PC Advisor */}
          <button
            onClick={() => openModal('aiAdvisor')}
            className="hidden lg:flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-700 border border-slate-300 px-3 py-2 rounded-lg font-semibold text-xs transition cursor-pointer"
            title="AI PC Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>{t('AI অ্যাসিস্ট্যান্ট', 'AI Advisor')}</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => {
              if (wishlist.length === 0) {
                alert(language === 'bn' ? 'আপনার পছন্দের তালিকা খালি!' : 'Your wishlist is empty!');
              } else {
                setFilters((prev) => ({
                  ...prev,
                  category: 'all',
                  searchQuery: '',
                }));
                const catalogEl = document.getElementById('catalog-section');
                if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="p-2 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-lg relative transition cursor-pointer hidden sm:flex items-center justify-center"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Trigger Button */}
          <button
            onClick={() => openModal('cart')}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-lg border border-slate-200 transition cursor-pointer relative"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cartTotalCount}
                </span>
              )}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-[10px] text-slate-500 leading-tight font-medium">
                {t('কার্ট', 'Cart')} ({cartTotalCount})
              </div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                ৳{cartSubtotal.toLocaleString('en-IN')}
              </div>
            </div>
          </button>

          {/* User Account / Sign In */}
          <button
            onClick={() => {
              if (currentUser?.role === 'admin') {
                openModal('admin');
              } else if (currentUser?.role === 'market') {
                openModal('market');
              } else {
                openModal('auth');
              }
            }}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              currentUser
                ? currentUser.role === 'admin'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : currentUser.role === 'market'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                : 'text-slate-700 hover:text-rose-600 hover:bg-slate-100 border-transparent'
            }`}
            title={currentUser ? (currentUser.role === 'admin' ? 'Admin Dashboard' : currentUser.role === 'market' ? 'Market Panel' : currentUser.name) : 'User Login / Account'}
          >
            {currentUser?.role === 'admin' ? (
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            ) : currentUser?.role === 'market' ? (
              <Package className="w-5 h-5 text-rose-600" />
            ) : (
              <User className="w-5 h-5" />
            )}
            {currentUser && (
              <span className="hidden sm:inline text-xs font-bold truncate max-w-[90px]">
                {currentUser.role === 'admin' 
                  ? t('এডমিন', 'Admin') 
                  : currentUser.role === 'market' 
                  ? t('মার্কেট', 'Market') 
                  : currentUser.name.split(' ')[0]}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-3 pb-2.5 md:hidden">
        <form onSubmit={handleSearchSubmit} className="flex items-center rounded-lg border-2 border-rose-600 overflow-hidden">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('পণ্য খুঁজুন...', 'Search products...')}
            className="flex-1 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-hidden bg-white"
          />
          <button type="submit" className="bg-rose-600 text-white px-3 py-2 text-xs">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </header>
  );
};
