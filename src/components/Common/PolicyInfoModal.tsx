import React from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Truck,
  Building2,
  FileText,
  Lock,
  RotateCcw,
  Info,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Award,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { PolicyTab } from '../../types';

export const PolicyInfoModal: React.FC = () => {
  const {
    language,
    t,
    closeModal,
    policyTab,
    setPolicyTab,
    footerSettings,
    policySettings,
    openModal,
  } = useShop();

  const tabs: { id: PolicyTab; labelBn: string; labelEn: string; icon: any }[] = [
    { id: 'about', labelBn: 'আমাদের সম্পর্কে', labelEn: 'About Us', icon: Info },
    { id: 'warranty', labelBn: 'ওয়ারেন্টি পলিসি', labelEn: 'Warranty Policy', icon: ShieldCheck },
    { id: 'refund', labelBn: 'রিটার্ন ও রিফান্ড', labelEn: 'Return & Refund', icon: RotateCcw },
    { id: 'delivery', labelBn: 'পেমেন্ট ও ডেলিভারি', labelEn: 'Payment & Delivery', icon: Truck },
    { id: 'emi', labelBn: '০% ব্যাংক ইএমআই', labelEn: '0% Bank EMI', icon: CreditCard },
    { id: 'corporate', labelBn: 'কর্পোরেট আইটি সেলস', labelEn: 'Corporate Sales', icon: Building2 },
    { id: 'terms', labelBn: 'টার্মস অ্যান্ড কন্ডিশনস', labelEn: 'Terms & Conditions', icon: FileText },
    { id: 'privacy', labelBn: 'প্রাইভেসি পলিসি', labelEn: 'Privacy Policy', icon: Lock },
  ];

  const currentPolicy = policySettings[policyTab];
  const isBn = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/40 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {footerSettings.storeName}
                </h2>
                <span className="text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded-full">
                  {t('পলিসি ও সাপোর্ট সেন্টার', 'Policy & Support Center')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t(
                  'গ্রাহকের আস্থা, অফিসিয়াল সেবা ও স্বচ্ছ নীতিমালার নিশ্চয়তা',
                  'Guaranteed Customer Trust, Official Service & Transparent Policies'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-3 sm:px-5 py-2.5 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = policyTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPolicyTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isBn ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm leading-relaxed">
          {/* Dynamic Header & Highlight Card */}
          <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-rose-400 font-black text-base">
                <Sparkles className="w-5 h-5 text-rose-400 shrink-0" />
                <h3>{isBn ? currentPolicy.titleBn : currentPolicy.title}</h3>
              </div>
              {(currentPolicy.badge || currentPolicy.badgeBn) && (
                <span className="text-[11px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full">
                  {isBn ? currentPolicy.badgeBn || currentPolicy.badge : currentPolicy.badge || currentPolicy.badgeBn}
                </span>
              )}
            </div>

            <p className="text-slate-200 font-medium">
              {isBn ? currentPolicy.highlightTextBn : currentPolicy.highlightText}
            </p>

            {/* Main content body */}
            <p className="text-slate-300 text-xs sm:text-sm">
              {isBn ? currentPolicy.mainContentBn : currentPolicy.mainContent}
            </p>
          </div>

          {/* Key Bullet Rules List */}
          {((isBn ? currentPolicy.rulesListBn : currentPolicy.rulesList) || []).length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('গুরুত্বপূর্ণ নির্দেশিকা ও শর্তসমূহ:', 'Key Terms & Guidelines:')}</span>
              </h4>
              <ul className="space-y-2">
                {(isBn ? currentPolicy.rulesListBn : currentPolicy.rulesList).map((rule, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80"
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contextual Extra Info based on active tab */}
          {policyTab === 'about' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="text-rose-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('ট্রেড লাইসেন্স নম্বর', 'Trade License No')}</span>
                </div>
                <div className="font-mono text-white font-bold">{footerSettings.tradeLicense}</div>
                <div className="text-[11px] text-slate-500">
                  {t('গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত', 'Govt Approved Business')}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>{t('বিসিএস মেম্বারশিপ', 'BCS Membership')}</span>
                </div>
                <div className="font-mono text-white font-bold">{footerSettings.bcsMembership}</div>
                <div className="text-[11px] text-slate-500">
                  {t('বাংলাদেশ কম্পিউটার সমিতি সদস্য', 'Bangladesh Computer Samity')}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{t('শোরুম খোলার সময়', 'Business Hours')}</span>
                </div>
                <div className="text-white font-bold text-xs">{isBn ? footerSettings.businessHoursBn : footerSettings.businessHours}</div>
                <div className="text-[11px] text-slate-500">
                  {t('সপ্তাহে ৭ দিন সার্বক্ষণিক সেবা', '7 Days Open Support')}
                </div>
              </div>
            </div>
          )}

          {policyTab === 'emi' && (
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs sm:text-sm">{t('শীর্ষ পার্টনার ব্যাংকসমূহ:', 'Top Partner Banks:')}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  'City Bank (Amex)',
                  'BRAC Bank',
                  'Eastern Bank (EBL)',
                  'Standard Chartered',
                  'Dutch-Bangla Bank',
                  'Prime Bank',
                  'Mutual Trust Bank',
                  'Dhaka Bank',
                  'UCB Bank',
                  'Trust Bank',
                  'Premier Bank',
                  'Bank Asia',
                ].map((bank) => (
                  <div
                    key={bank}
                    className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-center font-semibold text-slate-300"
                  >
                    {bank}
                  </div>
                ))}
              </div>
            </div>
          )}

          {policyTab === 'corporate' && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-bold text-white text-xs sm:text-sm">
                  {t('কর্পোরেট কোটেশন ও অফিস সাপ্লাই রিকুইজিশন', 'Corporate Quotation & Procurement Desk')}
                </div>
                <div className="text-xs text-slate-400">
                  ইমেইল: <span className="text-rose-400 font-bold">{footerSettings.email}</span> | ফোন: <span className="text-rose-400 font-bold">{footerSettings.phone1}</span>
                </div>
              </div>
              <a
                href={`tel:${footerSettings.phone1}`}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition cursor-pointer shrink-0"
              >
                {t('সরাসরি কল করুন', 'Call Now')}
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Phone className="w-3.5 h-3.5 text-rose-500" />
            <span>{t('যেকোনো সহায়তায় কল করুন:', 'Need Help? Call Us:')}</span>
            <a
              href={`tel:${footerSettings.phone1}`}
              className="text-white font-bold hover:text-rose-400 transition font-mono"
            >
              {footerSettings.phone1}
            </a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                closeModal();
                openModal('orderTrack');
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition cursor-pointer"
            >
              {t('অর্ডার ট্র্যাক করুন', 'Track Order')}
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition cursor-pointer"
            >
              {t('ঠিক আছে / বন্ধ করুন', 'Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
