import React from 'react';
import { ShoppingCart, Heart, Layers, Eye, Check, Star, Zap, ImageIcon } from 'lucide-react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    language,
    t,
    addToCart,
    toggleWishlist,
    isWishlisted,
    addToCompare,
    isComparing,
    viewProductDetails,
    openModal,
  } = useShop();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    openModal('checkout');
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => viewProductDetails(product)}
      className="bg-white rounded-xl border border-slate-200 hover:border-rose-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer relative"
    >
      {/* Top Badges & Actions */}
      <div className="relative p-3 pb-0">
        <div className="flex items-center justify-between gap-1 mb-2">
          {/* Status / Discount Badge */}
          <div className="flex items-center gap-1 flex-wrap">
            {product.discountPercentage && product.discountPercentage > 0 && (
              <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                {product.discountPercentage}% OFF
              </span>
            )}
            {product.badge && (
              <span className="bg-slate-900 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                {language === 'bn' ? product.badgeBn : product.badge}
              </span>
            )}
          </div>

          {/* Quick Wishlist & Compare buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCompare(product);
              }}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isComparing(product.id)
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title={t('তুলনা তালিকায় যুক্ত করুন', 'Add to compare')}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isWishlisted(product.id)
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-slate-200'
              }`}
              title={t('পছন্দের তালিকায় যুক্ত করুন', 'Add to wishlist')}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted(product.id) ? 'fill-rose-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Thumbnail */}
        <div className="relative aspect-4/3 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center p-2">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {/* Stock Tag */}
          <span
            className={`absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
              product.inStock
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-emerald-600' : 'bg-amber-600'}`} />
            {product.inStock ? t('স্টকে আছে', 'In Stock') : t('আসিতেছে', 'Upcoming')}
          </span>

          {/* Multiple Photos Indicator */}
          {product.gallery && product.gallery.length > 0 && (
            <span
              className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs"
              title={`${product.gallery.length + 1} photos available`}
            >
              <ImageIcon className="w-2.5 h-2.5 text-rose-400" />
              <span>+{product.gallery.length}</span>
            </span>
          )}
        </div>
      </div>

      {/* Middle Specs & Title */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span className="text-slate-600 font-bold uppercase">{product.brand}</span>
            <span>{product.model}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-rose-600 transition mb-2">
            {language === 'bn' ? product.nameBn : product.name}
          </h3>

          {/* Key Specs Highlights */}
          <ul className="space-y-1 mb-3 bg-slate-50 p-2 rounded-md border border-slate-100">
            {(language === 'bn' ? product.keySpecsBn : product.keySpecs).slice(0, 3).map((spec, i) => (
              <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-tight">
                <span className="text-rose-500 font-bold shrink-0">•</span>
                <span className="truncate">{spec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing and Action buttons */}
        <div>
          {/* Price */}
          <div className="mb-3 pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-medium">
                {t('স্পেশাল ক্যাশ মূল্য', 'Special Cash Price')}
              </div>
              <div className="text-base sm:text-lg font-black text-rose-600 leading-tight">
                ৳{product.price.toLocaleString('en-IN')}
              </div>
            </div>
            {product.regularPrice > product.price && (
              <div className="text-right">
                <div className="text-[10px] text-slate-400">{t('নিয়মিত মূল্য', 'Regular')}</div>
                <div className="text-xs text-slate-400 line-through">
                  ৳{product.regularPrice.toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>

          {/* Action Button Strip */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-slate-600" />
              <span>{t('কার্টে যোগ', 'Add Cart')}</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('এখনই কিনুন', 'Buy Now')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
