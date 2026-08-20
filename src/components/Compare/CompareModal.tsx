import React from 'react';
import { X, Layers, Trash2, ShoppingCart, Zap, Check, Plus } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const CompareModal: React.FC = () => {
  const {
    language,
    t,
    compareList,
    removeFromCompare,
    clearCompare,
    closeModal,
    addToCart,
    viewProductDetails,
  } = useShop();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {t('পণ্য তুলনা (Product Comparison)', 'Product Comparison')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('সর্বোচ্চ ৪টি পণ্যের স্পেসিফিকেশন পাশাপাশি তুলনা করুন', 'Compare specs of up to 4 products side-by-side')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
              >
                {t('সব মুছুন', 'Clear All')}
              </button>
            )}
            <button
              onClick={closeModal}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {compareList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 w-40 bg-slate-50 border border-slate-200 text-slate-500 font-bold">
                      পণ্য / বৈশিষ্ট্য
                    </th>
                    {compareList.map((product) => (
                      <th
                        key={product.id}
                        className="p-3 min-w-[200px] bg-white border border-slate-200 align-top relative"
                      >
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition cursor-pointer"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-24 h-24 object-contain mb-2 p-1 border border-slate-100 rounded-lg"
                          />
                          <span className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            {product.brand}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-2 mb-2">
                            {language === 'bn' ? product.nameBn : product.name}
                          </h4>
                          <div className="text-sm font-black text-rose-600 mb-2">
                            ৳{product.price.toLocaleString('en-IN')}
                          </div>
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{t('কার্টে যোগ', 'Add to Cart')}</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-bold bg-slate-50 border border-slate-200 text-slate-700">
                      স্টক স্ট্যাটাস
                    </td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 border border-slate-200 font-semibold">
                        {p.inStock ? (
                          <span className="text-emerald-600">✓ স্টকে আছে (In Stock)</span>
                        ) : (
                          <span className="text-amber-600">আসিতেছে (Upcoming)</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-slate-50 border border-slate-200 text-slate-700">
                      ওয়ারেন্টি পলিসি
                    </td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 border border-slate-200 text-slate-700 font-medium">
                        {p.warrantyBn || p.warranty}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-slate-50 border border-slate-200 text-slate-700">
                      মূল স্পেসিফিকেশন
                    </td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 border border-slate-200 align-top">
                        <ul className="space-y-1 text-slate-600">
                          {(language === 'bn' ? p.keySpecsBn : p.keySpecs).map((spec, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-rose-500 font-bold">•</span>
                              <span>{spec}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-slate-50 border border-slate-200 text-slate-700">
                      আনুমানিক পাওয়ার লোড
                    </td>
                    {compareList.map((p) => (
                      <td key={p.id} className="p-3 border border-slate-200 font-medium text-slate-700">
                        {p.wattage ? `~${p.wattage} Watts` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-sm text-slate-700 mb-1">
                {t('তুলনা তালিকায় কোনো পণ্য যুক্ত নেই', 'No products in comparison list')}
              </p>
              <p className="text-slate-400">
                {t('যেকোনো পণ্যের কার্ডের কম্পেয়ার আইকনে ক্লিক করে যুক্ত করুন।', 'Click the compare icon on any product card to add here.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
