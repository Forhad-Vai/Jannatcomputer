import React, { useState } from 'react';
import {
  Cpu,
  Tv,
  HardDrive,
  Keyboard,
  Zap,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Printer,
  ShoppingCart,
  Share2,
  Sparkles,
  X,
  Layers,
  Wrench,
  Flame,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { PCComponentCategory, Product } from '../../types';
import { ComponentSelectorModal } from './ComponentSelectorModal';

interface ComponentSlot {
  key: PCComponentCategory;
  name: string;
  nameBn: string;
  icon: React.ReactNode;
  isRequired: boolean;
}

export const PCBuilderView: React.FC = () => {
  const {
    language,
    t,
    pcBuild,
    setPCComponent,
    removePCComponent,
    clearPCBuild,
    pcBuildTotalPrice,
    pcBuildTotalWattage,
    addFullBuildToCart,
    applyPrebuiltRig,
    closeModal,
    openModal,
    footerSettings,
  } = useShop();

  const [activeSelectorCategory, setActiveSelectorCategory] = useState<{
    key: PCComponentCategory;
    name: string;
    nameBn: string;
  } | null>(null);

  const [showQuotationModal, setShowQuotationModal] = useState(false);

  const componentSlots: ComponentSlot[] = [
    {
      key: 'cpu',
      name: 'Processor (CPU)',
      nameBn: 'প্রসেসর (সিপিইউ)',
      icon: <Cpu className="w-5 h-5 text-rose-600" />,
      isRequired: true,
    },
    {
      key: 'cooler',
      name: 'CPU Cooler',
      nameBn: 'সিপিইউ কুলার',
      icon: <Layers className="w-5 h-5 text-blue-500" />,
      isRequired: false,
    },
    {
      key: 'motherboard',
      name: 'Motherboard',
      nameBn: 'মাদারবোর্ড',
      icon: <Layers className="w-5 h-5 text-amber-600" />,
      isRequired: true,
    },
    {
      key: 'ram',
      name: 'RAM (Memory)',
      nameBn: 'র‍্যাম (মেমরি)',
      icon: <Layers className="w-5 h-5 text-emerald-600" />,
      isRequired: true,
    },
    {
      key: 'storage',
      name: 'Storage (SSD / NVMe)',
      nameBn: 'স্টোরেজ (এসএসডি)',
      icon: <HardDrive className="w-5 h-5 text-indigo-600" />,
      isRequired: true,
    },
    {
      key: 'gpu',
      name: 'Graphics Card (GPU)',
      nameBn: 'গ্রাফিক্স কার্ড (জিপিইউ)',
      icon: <Tv className="w-5 h-5 text-purple-600" />,
      isRequired: false,
    },
    {
      key: 'psu',
      name: 'Power Supply (PSU)',
      nameBn: 'পাওয়ার সাপ্লাই (পিএসইউ)',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      isRequired: true,
    },
    {
      key: 'casing',
      name: 'Casing',
      nameBn: 'কেসিং',
      icon: <Layers className="w-5 h-5 text-slate-700" />,
      isRequired: true,
    },
    {
      key: 'monitor',
      name: 'Monitor',
      nameBn: 'মনিটর',
      icon: <Tv className="w-5 h-5 text-teal-600" />,
      isRequired: false,
    },
    {
      key: 'accessories',
      name: 'Keyboard & Accessories',
      nameBn: 'কিবোর্ড ও এক্সেসরিজ',
      icon: <Keyboard className="w-5 h-5 text-pink-600" />,
      isRequired: false,
    },
  ];

  // Recommended PSU calculation
  const recommendedPSU = pcBuildTotalWattage > 0 ? Math.max(450, Math.ceil((pcBuildTotalWattage + 150) / 50) * 50) : 0;

  // Compatibility checking
  const checkCompatibility = () => {
    const issues: string[] = [];
    if (pcBuild.cpu && pcBuild.motherboard) {
      if (pcBuild.cpu.socket && pcBuild.motherboard.socket && pcBuild.cpu.socket !== pcBuild.motherboard.socket) {
        issues.push(
          language === 'bn'
            ? `সিপিইউ সকেট (${pcBuild.cpu.socket}) ও মাদারবোর্ড সকেট (${pcBuild.motherboard.socket}) এক নয়!`
            : `CPU socket (${pcBuild.cpu.socket}) and Motherboard socket (${pcBuild.motherboard.socket}) do not match!`
        );
      }
    }
    return issues;
  };

  const compatibilityIssues = checkCompatibility();
  const selectedCount = Object.values(pcBuild).filter(Boolean).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                Official Rig Configurator
              </span>
              <span className="text-amber-300 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {t('ফ্রি অ্যাসেম্বলি ও লাইফটাইম সাপোর্ট', 'Free Assembly & Lifetime Support')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1 flex items-center gap-2">
              <span>{t('জান্নাত পিসি বিল্ডার', 'Jannat PC Builder')}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {t(
                'আপনার বাজেট ও পছন্দমত পার্টস নির্বাচন করুন, লাইভ ওয়াট ও খরচ হিসাব দেখুন।',
                'Select custom parts, calculate real-time wattage and export formal quotations.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => openModal('aiAdvisor')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>{t('AI সাজেস্ট নিন', 'AI Suggest')}</span>
            </button>

            <button
              onClick={closeModal}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Builds Strip */}
        <div className="bg-white px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Flame className="w-4 h-4 text-rose-600" />
            <span>{t('রেডিমেড কনফিগারেশন লোড করুন:', 'Load Quick Presets:')}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => applyPrebuiltRig('gaming')}
              className="bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
            >
              🎮 {t('আলটিমেট ৪কে গেমিং', 'Ultimate 4K Gaming')}
            </button>
            <button
              onClick={() => applyPrebuiltRig('creator')}
              className="bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
            >
              🎬 {t('ভিডিও এডিটর ও ক্রিয়েটর', 'Video Creator Rig')}
            </button>
            <button
              onClick={() => applyPrebuiltRig('budget')}
              className="bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
            >
              💼 {t('বেস্ট ভ্যালু বাজেট', 'Best Value Budget')}
            </button>
          </div>
        </div>

        {/* Middle: Component Table */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {/* Compatibility Alerts */}
          {compatibilityIssues.length > 0 ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{compatibilityIssues[0]}</span>
            </div>
          ) : selectedCount > 1 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {t(
                  '✓ নির্বাচিত পার্টসসমূহ শতভাগ কম্প্যাটিবল ও কার্যকর।',
                  '✓ All selected components are 100% compatible.'
                )}
              </span>
            </div>
          ) : null}

          {/* Component Slots Rows */}
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {componentSlots.map((slot) => {
              const selectedItem = pcBuild[slot.key];

              return (
                <div
                  key={slot.key}
                  className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition"
                >
                  {/* Left: Slot Icon & Title */}
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      {slot.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {language === 'bn' ? slot.nameBn : slot.name}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {slot.isRequired ? (
                          <span className="text-rose-600 font-semibold">{t('আবশ্যক', 'Required')}</span>
                        ) : (
                          t('ঐচ্ছিক', 'Optional')
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Selected Item or Empty Placeholder */}
                  <div className="flex-1 min-w-0">
                    {selectedItem ? (
                      <div className="flex items-center gap-3 bg-rose-50/40 p-2 rounded-lg border border-rose-100">
                        <img
                          src={selectedItem.image}
                          alt={selectedItem.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-contain bg-white rounded border border-slate-200 p-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-xs text-slate-900 truncate">
                            {language === 'bn' ? selectedItem.nameBn : selectedItem.name}
                          </h5>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-slate-700">{selectedItem.brand}</span>
                            <span>• {selectedItem.warrantyBn || selectedItem.warranty}</span>
                            {selectedItem.wattage && (
                              <span className="text-amber-700 font-medium bg-amber-50 px-1 rounded">
                                ~{selectedItem.wattage}W
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs italic pl-2">
                        {t('কোনো পার্টস নির্বাচিত করা হয়নি', 'No component chosen')}
                      </div>
                    )}
                  </div>

                  {/* Right: Price & Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    {selectedItem ? (
                      <>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-black text-rose-600">
                            ৳{selectedItem.price.toLocaleString('en-IN')}
                          </div>
                          {selectedItem.regularPrice > selectedItem.price && (
                            <div className="text-[10px] text-slate-400 line-through">
                              ৳{selectedItem.regularPrice.toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setActiveSelectorCategory({
                                key: slot.key,
                                name: slot.name,
                                nameBn: slot.nameBn,
                              })
                            }
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                          >
                            {t('বদলান', 'Change')}
                          </button>
                          <button
                            onClick={() => removePCComponent(slot.key)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          setActiveSelectorCategory({
                            key: slot.key,
                            name: slot.name,
                            nameBn: slot.nameBn,
                          })
                        }
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('পছন্দ করুন', 'Select')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Summary Bar */}
        <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Estimated Totals */}
          <div className="flex items-center gap-6 divide-x divide-slate-200 w-full sm:w-auto">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">
                {t('মোট হিসাব (ক্যাশ মূল্য):', 'Total Estimated Cost:')}
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-600">
                ৳{pcBuildTotalPrice.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="pl-4">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {t('পাওয়ার লোড:', 'Power Load:')}
              </div>
              <div className="text-xs font-bold text-slate-800">
                ~{pcBuildTotalWattage}W{' '}
                {recommendedPSU > 0 && (
                  <span className="text-slate-500 text-[10px] font-normal">
                    (PSU: {recommendedPSU}W+)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {selectedCount > 0 && (
              <button
                onClick={clearPCBuild}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2.5 rounded-lg border border-slate-200 transition cursor-pointer"
              >
                {t('মুছুন', 'Clear')}
              </button>
            )}

            <button
              onClick={() => setShowQuotationModal(true)}
              disabled={selectedCount === 0}
              className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{t('কোটেশন / প্রিন্ট', 'Quotation')}</span>
            </button>

            <button
              onClick={addFullBuildToCart}
              disabled={selectedCount === 0}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md shadow-rose-200 transition cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('সব কার্টে যোগ করুন', 'Add All to Cart')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Component Selector Child Modal */}
      {activeSelectorCategory && (
        <ComponentSelectorModal
          category={activeSelectorCategory.key}
          categoryName={activeSelectorCategory.name}
          categoryNameBn={activeSelectorCategory.nameBn}
          onSelect={(product) => setPCComponent(activeSelectorCategory.key, product)}
          onClose={() => setActiveSelectorCategory(null)}
        />
      )}

      {/* Printable Quotation Modal */}
      {showQuotationModal && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 border border-slate-300 text-slate-900">
            {/* Quotation Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 bg-rose-600/30 rounded-xl blur-md"></div>
                  <img
                    src={footerSettings?.logoUrl || 'https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png'}
                    alt="Logo"
                    referrerPolicy="no-referrer"
                    className="relative h-11 w-auto object-contain drop-shadow-[0_4px_12px_rgba(225,29,72,0.4)]"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-rose-600 leading-tight">
                    {footerSettings?.storeName || 'জান্নাত কম্পিউটার্স (Jannat Computers)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {footerSettings?.addressBn || footerSettings?.address} | মোবাইল: {footerSettings?.phone1} {footerSettings?.phone2 ? `, ${footerSettings?.phone2}` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div className="font-bold text-slate-900">Official Quotation</div>
                <div>তারিখ: {new Date().toLocaleDateString('en-GB')}</div>
              </div>
            </div>

            {/* Quotation Items Table */}
            <table className="w-full text-xs text-left mb-4 divide-y divide-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-2 px-2">কম্পোনেন্ট</th>
                  <th className="py-2 px-2">মডেল ও বিবরণ</th>
                  <th className="py-2 px-2 text-right">মূল্য (টাকা)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(pcBuild)
                  .filter(([_, item]) => item !== null)
                  .map(([slotKey, item]) => {
                    const typedItem = item as Product;
                    return (
                      <tr key={slotKey} className="hover:bg-slate-50">
                        <td className="py-2 px-2 font-bold text-slate-700 capitalize">
                          {slotKey}
                        </td>
                        <td className="py-2 px-2">
                          <div className="font-medium text-slate-900">{typedItem.name}</div>
                          <div className="text-[10px] text-slate-500">{typedItem.warranty}</div>
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-slate-900">
                          ৳{typedItem.price.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-bold text-sm bg-slate-50">
                  <td colSpan={2} className="py-2 px-2 text-slate-900">
                    সর্বমোট হিসাব (Total Quotation):
                  </td>
                  <td className="py-2 px-2 text-right text-rose-600">
                    ৳{pcBuildTotalPrice.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-5">
              * এই কোটেশনটি পরবর্তী ৩ কর্মদিবস পর্যন্ত কার্যকর থাকবে। মূল্য বাজার অনুযায়ী পরিবর্তনশীল হতে পারে।
            </div>

            {/* Print & Close */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowQuotationModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট বা পিডিএফ সেভ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
