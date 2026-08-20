import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Plus,
  Minus,
  Truck,
  Zap,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const CartDrawer: React.FC = () => {
  const {
    language,
    t,
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    cartTotalCount,
    closeModal,
    openModal,
    showToast,
  } = useShop();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'JANNAT500' || code === 'EID2026' || code === 'RYANS') {
      const discount = Math.min(500, Math.round(cartSubtotal * 0.05));
      setDiscountAmount(discount);
      setCouponApplied(true);
      showToast(language === 'bn' ? '৳৫০০ ডিসকাউন্ট কুপন সফলভাবে যুক্ত হয়েছে!' : '৳500 discount coupon applied!');
    } else {
      showToast(language === 'bn' ? 'ভুল কুপন কোড! "JANNAT500" কোডটি ট্রাই করুন।' : 'Invalid coupon! Try "JANNAT500"', 'error');
    }
  };

  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {t('আপনার শপিং কার্ট', 'Your Shopping Cart')}
              </h3>
              <span className="text-xs text-slate-400">
                {cartTotalCount} {t('টি পণ্য অন্তর্ভুক্ত', 'Items')}
              </span>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Items List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-3">
          {cart.length > 0 ? (
            cart.map(({ product, quantity }) => (
              <div key={product.id} className="pt-3 first:pt-0 flex items-start gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-contain rounded-lg border border-slate-200 p-1 bg-slate-50 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">
                    {language === 'bn' ? product.nameBn : product.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {product.brand} • {product.warrantyBn || product.warranty}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 transition cursor-pointer text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-900">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 transition cursor-pointer text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-rose-600">
                        ৳{(product.price * quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(product.id)}
                  className="p-1 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-3 stroke-1" />
              <p className="font-bold text-sm text-slate-700 mb-1">
                {t('আপনার কার্ট বর্তমানে খালি রয়েছে!', 'Your Cart is currently empty!')}
              </p>
              <p className="text-slate-400 max-w-xs mx-auto mb-4">
                {t('আমাদের ল্যাপটপ, ডেস্কটপ বা পিসি পার্টস থেকে পছন্দ করুন।', 'Browse our catalog to add products.')}
              </p>
              <button
                onClick={closeModal}
                className="bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-lg"
              >
                {t('শপিং শুরু করুন', 'Start Shopping')}
              </button>
            </div>
          )}
        </div>

        {/* Drawer Bottom Checkout Calculation */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={t('কুপন কোড (যেমন: JANNAT500)', 'Coupon code (e.g. JANNAT500)')}
                  className="w-full bg-white pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-300 outline-hidden uppercase font-semibold"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition"
              >
                {t('প্রয়োগ', 'Apply')}
              </button>
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex items-center justify-between">
                <span>{t('সাবটোটাল:', 'Subtotal:')}</span>
                <span className="font-bold text-slate-900">৳{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-medium">
                  <span>{t('কুপন ডিসকাউন্ট:', 'Coupon Discount:')}</span>
                  <span>- ৳{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{t('ডেলিভারি চার্জ:', 'Shipping:')}</span>
                <span>{t('চেকআউটে জেলা অনুযায়ী হিসাব হবে', 'Calculated at checkout')}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>{t('সর্বমোট প্রদেয়:', 'Grand Total:')}</span>
                <span className="text-rose-600 text-base">৳{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                closeModal();
                openModal('checkout');
              }}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs sm:text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition cursor-pointer"
            >
              <span>{t('চেকআউট করুন', 'Proceed to Checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
