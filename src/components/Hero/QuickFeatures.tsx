import React from 'react';
import { Truck, ShieldCheck, CreditCard, Wrench, RefreshCw, Headphones } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const QuickFeatures: React.FC = () => {
  const { language, t } = useShop();

  const features = [
    {
      icon: <Truck className="w-6 h-6 text-rose-600" />,
      title: t('সারা দেশে হোম ডেলিভারি', 'Nationwide Home Delivery'),
      desc: t('৬৪ জেলায় দ্রুত ও নিরাপদ ডেলিভারি', 'Fast & insured delivery to 64 districts'),
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: t('১০০% অফিশিয়াল ওয়ারেন্টি', '100% Genuine Warranty'),
      desc: t('সিরিয়ালসহ অথেনটিক প্রোডাক্ট গ্যারান্টি', 'Original products with official warranty'),
    },
    {
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
      title: t('০% সহজ ইএমআই সুবিধা', 'Easy 0% EMI Facility'),
      desc: t('২৫+ শীর্ষ ব্যাংকের ক্রেডিট কার্ডে ৩৬ মাস', 'Up to 36 months with 25+ top BD banks'),
    },
    {
      icon: <Wrench className="w-6 h-6 text-amber-600" />,
      title: t('ফ্রি পিসি অ্যাসেম্বলি ও টেস্টিং', 'Free Assembly & Testing'),
      desc: t('দক্ষ ইঞ্জিনিয়ার দ্বারা ক্যাবল ম্যানেজমেন্ট', 'Professional build with cable management'),
    },
    {
      icon: <Headphones className="w-6 h-6 text-purple-600" />,
      title: t('২৪/৭ এক্সপার্ট টেক সাপোর্ট', '24/7 Tech Support'),
      desc: t('অভিজ্ঞ আইটি কনসালটেন্ট থেকে পরামর্শ', 'Real-time guidance from IT specialists'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3 pt-2 md:pt-0 px-2 first:pt-0">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 shadow-xs">
              {f.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 leading-tight">
                {f.title}
              </h4>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
