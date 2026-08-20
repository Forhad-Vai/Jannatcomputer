import React from 'react';
import { X, Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const WishlistModal: React.FC = () => {
  const {
    language,
    t,
    products,
    wishlist,
    toggleWishlist,
    closeModal,
    addToCart,
    viewProductDetails,
  } = useShop();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {t('পছন্দের তালিকা (Wishlist)', 'My Wishlist')}
              </h3>
              <p className="text-xs text-slate-400">
                {wishlistedProducts.length} {t('টি পণ্য পছন্দের তালিকায় সংরক্ষিত', 'Items saved in wishlist')}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          {wishlistedProducts.length > 0 ? (
            wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="py-3 first:pt-0 flex items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition"
              >
                <div
                  onClick={() => {
                    closeModal();
                    viewProductDetails(product);
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-contain rounded-lg border border-slate-200 p-1 bg-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{product.brand}</span>
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {language === 'bn' ? product.nameBn : product.name}
                    </h4>
                    <div className="text-xs font-black text-rose-600 mt-0.5">
                      ৳{product.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      addToCart(product, 1);
                      toggleWishlist(product.id);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('কার্টে যোগ', 'Add Cart')}</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              <Heart className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700 mb-1">
                {t('পছন্দের তালিকা খালি', 'Your wishlist is empty')}
              </p>
              <p>{t('পছন্দের পণ্য সংরক্ষণ করতে হার্ট আইকনে চাপুন।', 'Click the heart icon on any product to save it here.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
