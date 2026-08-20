import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Building2,
  FileText,
  Lock,
  RotateCcw,
  Info,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  CheckCircle2,
  RotateCcw as ResetIcon,
  HelpCircle,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { PolicyTab, PolicySection, StorePolicySettings } from '../../types';

export const PolicyEditorTab: React.FC = () => {
  const {
    language,
    t,
    policySettings,
    updatePolicySettings,
    resetPolicySettings,
    openPolicyModal,
    showToast,
  } = useShop();

  const [selectedTab, setSelectedTab] = useState<PolicyTab>('warranty');
  const [formData, setFormData] = useState<StorePolicySettings>(policySettings);
  const [previewMode, setPreviewMode] = useState(false);

  // Sync if context updates
  React.useEffect(() => {
    setFormData(policySettings);
  }, [policySettings]);

  const policyTabsConfig: {
    id: PolicyTab;
    labelBn: string;
    labelEn: string;
    icon: any;
    color: string;
  }[] = [
    { id: 'about', labelBn: 'আমাদের সম্পর্কে', labelEn: 'About Us', icon: Info, color: 'text-blue-400' },
    { id: 'warranty', labelBn: 'ওয়ারেন্টি পলিসি', labelEn: 'Warranty Policy', icon: ShieldCheck, color: 'text-emerald-400' },
    { id: 'refund', labelBn: 'রিটার্ন ও রিফান্ড', labelEn: 'Return & Refund', icon: RotateCcw, color: 'text-rose-400' },
    { id: 'delivery', labelBn: 'পেমেন্ট ও ডেলিভারি', labelEn: 'Payment & Delivery', icon: Truck, color: 'text-sky-400' },
    { id: 'emi', labelBn: '০% ব্যাংক ইএমআই', labelEn: '0% Bank EMI', icon: CreditCard, color: 'text-amber-400' },
    { id: 'corporate', labelBn: 'কর্পোরেট আইটি সেলস', labelEn: 'Corporate Sales', icon: Building2, color: 'text-purple-400' },
    { id: 'terms', labelBn: 'টার্মস অ্যান্ড কন্ডিশনস', labelEn: 'Terms & Conditions', icon: FileText, color: 'text-orange-400' },
    { id: 'privacy', labelBn: 'প্রাইভেসি পলিসি', labelEn: 'Privacy Policy', icon: Lock, color: 'text-teal-400' },
  ];

  const currentSection = formData[selectedTab] || {
    title: '',
    titleBn: '',
    badge: '',
    badgeBn: '',
    highlightText: '',
    highlightTextBn: '',
    mainContent: '',
    mainContentBn: '',
    rulesList: [],
    rulesListBn: [],
  };

  const handleFieldChange = (field: keyof PolicySection, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [selectedTab]: {
        ...prev[selectedTab],
        [field]: value,
      },
    }));
  };

  const handleRuleChange = (index: number, isBn: boolean, value: string) => {
    const listKey = isBn ? 'rulesListBn' : 'rulesList';
    const updatedList = [...(currentSection[listKey] || [])];
    updatedList[index] = value;
    handleFieldChange(listKey, updatedList);
  };

  const handleAddRule = () => {
    const nextBn = [...(currentSection.rulesListBn || []), 'নতুন নিয়ম বা শর্তের বিবরণ'];
    const nextEn = [...(currentSection.rulesList || []), 'New condition or guideline description'];
    setFormData((prev) => ({
      ...prev,
      [selectedTab]: {
        ...prev[selectedTab],
        rulesListBn: nextBn,
        rulesList: nextEn,
      },
    }));
  };

  const handleRemoveRule = (index: number) => {
    const nextBn = (currentSection.rulesListBn || []).filter((_, i) => i !== index);
    const nextEn = (currentSection.rulesList || []).filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      [selectedTab]: {
        ...prev[selectedTab],
        rulesListBn: nextBn,
        rulesList: nextEn,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePolicySettings(formData);
  };

  const handleReset = () => {
    if (
      window.confirm(
        language === 'bn'
          ? 'আপনি কি নিশ্চিত সব পলিসি ও শর্তাবলী ডিফল্ট অবস্থায় রিস্টোর করতে চান?'
          : 'Are you sure you want to reset all policies to default values?'
      )
    ) {
      resetPolicySettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-white">
              {t('পলিসি ও তথ্য কাস্টমাইজেশন এডিটর (CMS)', 'Policy & Information Content CMS')}
            </h3>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              LIVE CMS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t(
              'ফুটার ও সাপোর্ট সেন্টারের সকল পেজ (ওয়ারেন্টি, রিফান্ড, ডেলিভারি, ইএমআই ইত্যাদি) এডমিন থেকে এডিট করুন',
              'Customize content for all 8 customer policy pages including warranty, returns, EMI, and shipping'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openPolicyModal(selectedTab)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-950 text-rose-400 hover:text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Open customer modal preview"
          >
            <Eye className="w-4 h-4" />
            <span>{t('কাস্টমার ভিউ প্রিভিউ', 'Preview in Modal')}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Reset to factory defaults"
          >
            <ResetIcon className="w-4 h-4" />
            <span>{t('ডিফল্ট রিস্টোর', 'Reset Defaults')}</span>
          </button>
        </div>
      </div>

      {/* Policy Selector Sub-Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {policyTabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id)}
              className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 ' + tab.color
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-xs font-extrabold truncate ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                  {language === 'bn' ? tab.labelBn : tab.labelEn}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {tab.id.toUpperCase()}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>
                {t('এডিট করুন:', 'Editing Section:')}{' '}
                {policyTabsConfig.find((t) => t.id === selectedTab)?.labelBn} ({selectedTab.toUpperCase()})
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              bilingual_content_v2
            </span>
          </div>

          {/* Titles & Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                {t('সেকশন টাইটেল (বাংলা) *', 'Section Title (Bangla) *')}
              </label>
              <input
                type="text"
                required
                value={currentSection.titleBn}
                onChange={(e) => handleFieldChange('titleBn', e.target.value)}
                placeholder="যেমন: অফিসিয়াল ওয়ারেন্টি পলিসি"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 outline-hidden font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                {t('সেকশন টাইটেল (English) *', 'Section Title (English) *')}
              </label>
              <input
                type="text"
                required
                value={currentSection.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g. Official Warranty Policy"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 outline-hidden font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                {t('হাইলাইট ব্যাজ ট্যাগ (বাংলা)', 'Highlight Badge Tag (Bangla)')}
              </label>
              <input
                type="text"
                value={currentSection.badgeBn || ''}
                onChange={(e) => handleFieldChange('badgeBn', e.target.value)}
                placeholder="যেমন: ১০০% ব্র্যান্ড নিশ্চয়তা"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-rose-300 focus:border-amber-500 outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                {t('হাইলাইট ব্যাজ ট্যাগ (English)', 'Highlight Badge Tag (English)')}
              </label>
              <input
                type="text"
                value={currentSection.badge || ''}
                onChange={(e) => handleFieldChange('badge', e.target.value)}
                placeholder="e.g. 100% Brand Warranty"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-rose-300 focus:border-amber-500 outline-hidden"
              />
            </div>
          </div>

          {/* Highlight Summary Card text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                {t('হাইলাইট মূল বার্তা (বাংলা) *', 'Key Highlight Summary (Bangla) *')}
              </label>
              <textarea
                rows={3}
                required
                value={currentSection.highlightTextBn}
                onChange={(e) => handleFieldChange('highlightTextBn', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                {t('হাইলাইট মূল বার্তা (English) *', 'Key Highlight Summary (English) *')}
              </label>
              <textarea
                rows={3}
                required
                value={currentSection.highlightText}
                onChange={(e) => handleFieldChange('highlightText', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden leading-relaxed"
              />
            </div>
          </div>

          {/* Main Content Paragraph */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                {t('বিস্তারিত বর্ণনা / ব্যাখ্যা (বাংলা)', 'Detailed Description (Bangla)')}
              </label>
              <textarea
                rows={3}
                value={currentSection.mainContentBn}
                onChange={(e) => handleFieldChange('mainContentBn', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 outline-hidden leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300">
                {t('বিস্তারিত বর্ণনা / ব্যাখ্যা (English)', 'Detailed Description (English)')}
              </label>
              <textarea
                rows={3}
                value={currentSection.mainContent}
                onChange={(e) => handleFieldChange('mainContent', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 outline-hidden leading-relaxed"
              />
            </div>
          </div>

          {/* Rules / Bullet Points Section */}
          <div className="pt-4 border-t border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-extrabold text-white">
                  {t('পলিসির শর্তাবলী ও পয়েন্ট লিস্ট (Rules & Bullet Points)', 'Rules & Bullet Points List')}
                </h4>
                <span className="bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full text-[10px] font-mono">
                  {(currentSection.rulesListBn || []).length} items
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('নতুন পয়েন্ট যোগ করুন', 'Add Bullet Point')}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {(currentSection.rulesListBn || []).map((ruleBn, idx) => {
                const ruleEn = (currentSection.rulesList || [])[idx] || '';
                return (
                  <div
                    key={idx}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start gap-2.5"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black shrink-0 mt-1">
                      {idx + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block mb-0.5">বাংলা বিবরণ:</span>
                        <input
                          type="text"
                          value={ruleBn}
                          onChange={(e) => handleRuleChange(idx, true, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-amber-500 outline-hidden"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block mb-0.5">English Text:</span>
                        <input
                          type="text"
                          value={ruleEn}
                          onChange={(e) => handleRuleChange(idx, false, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-amber-500 outline-hidden"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition cursor-pointer shrink-0 mt-1"
                      title="Delete this point"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {(!currentSection.rulesListBn || currentSection.rulesListBn.length === 0) && (
                <div className="text-center py-4 text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                  {t('কোনো পয়েন্ট যোগ করা হয়নি। উপরের বাটনে ক্লিক করে যোগ করুন।', 'No bullet points yet. Click add to create one.')}
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-700">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>{t('সেভ করার সাথে সাথেই ওয়েবসাইটে ও কাস্টমার মডালে পরিবর্তন কার্যকর হবে।', 'Changes take effect immediately upon saving.')}</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-950/60"
            >
              <Save className="w-4 h-4" />
              <span>{t('পলিসি তথ্য সেভ ও আপডেট করুন', 'Save Policy Changes')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
