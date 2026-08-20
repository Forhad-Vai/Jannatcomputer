import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Zap,
  Heart,
  Layers,
  ShieldCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const ProductDetailModal: React.FC = () => {
  const {
    language,
    t,
    selectedProduct,
    closeModal,
    addToCart,
    toggleWishlist,
    isWishlisted,
    addToCompare,
    isComparing,
    openModal,
  } = useShop();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedProduct) return null;

  // Build unified images array
  const allImages: string[] = [
    selectedProduct.image,
    ...(selectedProduct.gallery || []),
  ].filter((img, idx, self) => Boolean(img && img.trim()) && self.indexOf(img) === idx);

  const currentActiveImg = allImages[activeImageIndex] || selectedProduct.image;

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity);
    closeModal();
    openModal('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
              {selectedProduct.brand}
            </span>
            <span className="text-xs text-slate-300 font-medium">Model: {selectedProduct.model}</span>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Main Info Section (Image + Summary) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Product Image & Multi-Image Gallery */}
            <div className="flex flex-col gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center relative group">
                <div className="aspect-square w-full max-h-72 flex items-center justify-center">
                  <img
                    src={currentActiveImg}
                    alt={selectedProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain mix-blend-multiply transition-all duration-200"
                  />
                </div>

                {/* Next / Prev Navigation Arrows (if multiple photos) */}
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md border border-slate-200 text-slate-700 hover:bg-rose-600 hover:text-white flex items-center justify-center transition opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Previous photo"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md border border-slate-200 text-slate-700 hover:bg-rose-600 hover:text-white flex items-center justify-center transition opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Next photo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Photo Counter Badge */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                    <ImageIcon className="w-3 h-3 text-rose-400" />
                    <span>
                      {activeImageIndex + 1} / {allImages.length}
                    </span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {selectedProduct.discountPercentage && selectedProduct.discountPercentage > 0 && (
                    <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-0.5 rounded-md shadow-xs">
                      {selectedProduct.discountPercentage}% OFF
                    </span>
                  )}
                  {selectedProduct.badge && (
                    <span className="bg-slate-900 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-md shadow-xs">
                      {language === 'bn' ? selectedProduct.badgeBn : selectedProduct.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails Row for Multiple Photos */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {allImages.map((thumbUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl border-2 p-1 bg-slate-50 overflow-hidden shrink-0 transition cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-rose-600 ring-2 ring-rose-500/30 scale-105 shadow-sm'
                          : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={thumbUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Summary Details */}
            <div className="flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      selectedProduct.inStock
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${selectedProduct.inStock ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                    {selectedProduct.inStock ? t('স্টকে রয়েছে (In Stock)', 'In Stock') : t('আসিতেছে (Upcoming)', 'Upcoming')}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600">
                    SKU: JC-{selectedProduct.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {language === 'bn' ? selectedProduct.nameBn : selectedProduct.name}
                </h1>

                {/* Key Bullet Highlights */}
                <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 mb-1.5">
                    {t('মূল স্পেসিফিকেশন:', 'Key Highlights:')}
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {(language === 'bn' ? selectedProduct.keySpecsBn : selectedProduct.keySpecs).map((spec, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">•</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Warranty Note */}
                <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{selectedProduct.warrantyBn || selectedProduct.warranty}</span>
                </div>
              </div>

              {/* Pricing Box */}
              <div className="bg-rose-50/60 border border-rose-200 p-4 rounded-xl">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">
                      {t('স্পেশাল ক্যাশ অফার মূল্য', 'Special Cash Discount Price')}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-rose-600">
                      ৳{selectedProduct.price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {selectedProduct.regularPrice > selectedProduct.price && (
                    <div className="text-right">
                      <div className="text-xs text-slate-400">{t('নিয়মিত মূল্য', 'Regular Price')}</div>
                      <div className="text-sm text-slate-400 line-through font-semibold">
                        ৳{selectedProduct.regularPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">{t('পরিমাণ:', 'Quantity:')}</span>
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => addToCart(selectedProduct, quantity)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-slate-700" />
                    <span>{t('কার্টে যোগ করুন', 'Add to Cart')}</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>{t('এখনই কিনুন', 'Buy Now')}</span>
                  </button>
                </div>

                {/* Compare & Wishlist buttons */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <button
                    onClick={() => addToCompare(selectedProduct)}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isComparing(selectedProduct.id) ? t('তালিকায় আছে', 'In Comparison') : t('তুলনা তালিকায় যোগ', 'Add to Compare')}</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600 cursor-pointer font-medium"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted(selectedProduct.id) ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{isWishlisted(selectedProduct.id) ? t('পছন্দের তালিকায় আছে', 'Wishlisted') : t('পছন্দের তালিকায় যোগ', 'Add to Wishlist')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
