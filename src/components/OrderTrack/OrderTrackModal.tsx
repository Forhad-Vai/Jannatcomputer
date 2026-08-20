import React, { useState } from 'react';
import {
  X,
  Truck,
  Search,
  CheckCircle2,
  Phone,
  Package,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  CreditCard,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order } from '../../types';

export const OrderTrackModal: React.FC = () => {
  const { language, t, orders, closeModal } = useShop();
  const [searchQuery, setSearchQuery] = useState(orders[0]?.customerPhone || '');
  const [matchedOrders, setMatchedOrders] = useState<Order[]>(orders.length > 0 ? [orders[0]] : []);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState('');

  const normalizePhone = (num: string) => num.replace(/[^0-9]/g, '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = searchQuery.trim();
    if (!raw) {
      setErrorMsg(
        language === 'bn'
          ? 'অনুগ্রহ করে আপনার মোবাইল নম্বর লিখুন।'
          : 'Please enter your mobile phone number.'
      );
      return;
    }

    const cleanInput = normalizePhone(raw);
    const upperInput = raw.toUpperCase();

    // Match either exact/partial phone number or exact Order ID
    const matches = orders.filter((o) => {
      const oPhone = normalizePhone(o.customerPhone);
      const phoneMatch = cleanInput.length >= 4 && oPhone.includes(cleanInput);
      const idMatch = o.id.toUpperCase() === upperInput;
      return phoneMatch || idMatch;
    });

    if (matches.length > 0) {
      setMatchedOrders(matches);
      setSelectedOrderId(matches[0].id);
      setErrorMsg('');
    } else {
      setMatchedOrders([]);
      setSelectedOrderId('');
      setErrorMsg(
        language === 'bn'
          ? `"${raw}" মোবাইল নম্বরে কোনো অর্ডার রেকর্ড পাওয়া যায়নি। সঠিক মোবাইল নম্বর দিয়ে চেষ্টা করুন।`
          : `No orders found for "${raw}". Please enter the correct mobile number used during checkout.`
      );
    }
  };

  const currentOrder = matchedOrders.find((o) => o.id === selectedOrderId) || matchedOrders[0] || null;

  const steps = [
    { key: 'placed', titleBn: 'অর্ডার গৃহীত', title: 'Order Placed', desc: 'অর্ডার সিস্টেমে গৃহীত হয়েছে' },
    { key: 'processing', titleBn: 'প্যাকিং ও কোয়ালিটি চেক', title: 'Processing & QC', desc: 'পণ্য পরীক্ষণ ও প্রস্তুত' },
    { key: 'shipped', titleBn: 'কুরিয়ারে হস্তান্তর', title: 'Handed to Courier', desc: 'ডেলিভারি পার্টনারের পথে' },
    { key: 'delivered', titleBn: 'ডেলিভারি সম্পন্ন', title: 'Delivered', desc: 'গ্রাহকের হাতে হস্তান্তর' },
  ];

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'processing': return 1;
      case 'in_transit': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {t('মোবাইল নম্বর দিয়ে অর্ডার ট্র্যাকিং', 'Track Order with Mobile Number')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('আপনার মোবাইল নম্বর লিখে অর্ডারের লাইভ স্ট্যাটাস দেখুন', 'Enter your mobile number to view live delivery status')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('গ্রাহকের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX বা 01XXXXXXXXX)', 'Enter customer mobile number (e.g. 017XXXXXXXX)')}
                className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 outline-hidden font-medium focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t('ট্র্যাক করুন', 'Track')}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="mt-2.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Search Results Display */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {matchedOrders.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-slate-600 shrink-0">
                {t('মোট অর্ডার:', 'Total Orders:')}
              </span>
              {matchedOrders.map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border shrink-0 ${
                    ord.id === currentOrder?.id
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  #{ord.id} ({ord.status})
                </button>
              ))}
            </div>
          )}

          {currentOrder ? (
            <div>
              {/* Top Order Meta */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">{t('অর্ডার আইডি:', 'Order ID:')}</div>
                  <div className="text-base font-black text-rose-600">{currentOrder.id}</div>
                  <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>তারিখ: {currentOrder.createdAt || currentOrder.date}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[11px] text-slate-500 font-medium">{t('গ্রাহকের তথ্য:', 'Customer Info:')}</div>
                  <div className="text-xs font-bold text-slate-900">{currentOrder.customerName}</div>
                  <div className="text-xs font-bold text-rose-600 flex items-center gap-1 sm:justify-end mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{currentOrder.customerPhone}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {currentOrder.address}, {currentOrder.thana}, {currentOrder.district}
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="py-2 mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>{t('ডেলিভারি ট্র্যাকিং স্ট্যাটাস', 'Delivery Tracking Status')}</span>
                  <span className="text-[11px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-bold uppercase">
                    {currentOrder.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center relative pt-2">
                  {/* Connecting Line */}
                  <div className="absolute top-6 left-8 right-8 h-1 bg-slate-200 -z-0">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${(getStepIndex(currentOrder.status) / (steps.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {steps.map((step, idx) => {
                    const isDone = idx <= getStepIndex(currentOrder.status);
                    const isCurrent = idx === getStepIndex(currentOrder.status);

                    return (
                      <div key={step.key} className="relative z-1 flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div
                          className={`text-xs font-bold mt-2 ${
                            isCurrent ? 'text-rose-600' : isDone ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {language === 'bn' ? step.titleBn : step.title}
                        </div>
                        <div className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
                          {step.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ordered Items List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>{t('অর্ডারের পণ্যসমূহ (Ordered Items):', 'Ordered Items:')}</span>
                  <span className="text-[11px] text-slate-600 font-semibold">
                    {t('পেমেন্ট মাধ্যম:', 'Payment:')}{' '}
                    <strong className="text-slate-900">
                      {currentOrder.paymentMethod === 'bkash'
                        ? 'বিকাশ (bKash)'
                        : currentOrder.paymentMethod === 'nagad'
                        ? 'নগদ (Nagad)'
                        : currentOrder.paymentMethod === 'rocket'
                        ? 'রকেট (DBBL Rocket)'
                        : currentOrder.paymentMethod === 'upay'
                        ? 'উপায় (UCB Upay)'
                        : currentOrder.paymentMethod === 'card'
                        ? 'কার্ড (Cards)'
                        : currentOrder.paymentMethod === 'emi'
                        ? '০% কিস্তি (EMI)'
                        : 'ক্যাশ অন ডেলিভারি (COD)'}
                    </strong>
                    {currentOrder.transactionId && (
                      <span className="ml-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                        TrxID: {currentOrder.transactionId}
                      </span>
                    )}
                  </span>
                </div>
                <div className="divide-y divide-slate-100 text-xs bg-white">
                  {currentOrder.items.map(({ product, quantity }) => (
                    <div key={product.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-contain rounded border border-slate-200 p-0.5 bg-white shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium">পরিমাণ: {quantity} টি × ৳{product.price.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                      <div className="font-bold text-rose-600 text-right shrink-0">
                        ৳{(product.price * quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 p-3 flex items-center justify-between font-bold text-xs border-t border-slate-200">
                  <div className="text-slate-600">
                    <span>ডেলিভারি চার্জ: ৳{currentOrder.shippingFee}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-700 mr-2">{t('সর্বমোট প্রদেয় বিল:', 'Total Amount:')}</span>
                    <span className="text-rose-600 text-sm font-black">৳{currentOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <Phone className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">
                {t('অর্ডার ট্র্যাক করতে উপরে আপনার মোবাইল নম্বর লিখে খুঁজুন।', 'Enter your mobile number above to track your orders.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

