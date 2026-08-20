import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  Truck,
  CreditCard,
  Building2,
  Phone,
  User,
  Mail,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  QrCode,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order } from '../../types';
import { PaymentQRCode } from '../Common/PaymentQRCode';

const bangladeshDistricts = [
  'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh',
  'Gazipur', 'Narayanganj', 'Cumilla', 'Bogura', 'Cox\'s Bazar', 'Feni', 'Noakhali', 'Brahmanbaria',
  'Jessore', 'Kushtia', 'Dinajpur', 'Tangail', 'Faridpur', 'Pabna', 'Sirajganj', 'Narsingdi',
  'Jamalpur', 'Natore', 'Joypurhat', 'Sunamganj', 'Habiganj', 'Moulvibazar', 'Bagerhat', 'Satkhira',
  'Jhenaidah', 'Magura', 'Narail', 'Patuakhali', 'Bhola', 'Pirojpur', 'Jhalokati', 'Barguna',
  'Panchagarh', 'Thakurgaon', 'Nilphamari', 'Lalmonirhat', 'Kurigram', 'Gaibandha', 'Netrokona',
  'Sherpur', 'Kishoreganj', 'Manikganj', 'Munshiganj', 'Gopalganj', 'Madaripur', 'Shariatpur',
  'Rajbari', 'Meherpur', 'Chuadanga', 'Chapainawabganj', 'Naogaon', 'Bandarban', 'Rangamati', 'Khagrachhari'
];

export const CheckoutModal: React.FC = () => {
  const {
    language,
    t,
    cart,
    cartSubtotal,
    createOrder,
    closeModal,
    openModal,
    showToast,
    footerSettings,
  } = useShop();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket' | 'upay' | 'card'>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<Order | null>(null);

  const paymentNumber = footerSettings?.paymentPhone || '01717220224';
  const qrCodeImageUrl = footerSettings?.qrCodeUrl || 'https://cdn.phototourl.com/free/2026-08-18-2c5004d3-0d92-493e-8af1-bfe4b70b3c1d.jpg';

  // Calculate Shipping fee: Inside Dhaka = 60, Outside = 120
  const shippingFee = district === 'Dhaka' ? 60 : 120;
  const grandTotal = cartSubtotal + shippingFee;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentNumber);
    setCopiedNumber(true);
    showToast(language === 'bn' ? `পেমেন্ট নম্বর কপি করা হয়েছে (${paymentNumber})` : `Payment number copied (${paymentNumber})`);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !address.trim()) {
      showToast(
        language === 'bn'
          ? 'অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর ও ডেলিভারি ঠিকানা পূরণ করুন'
          : 'Please enter your name, phone number and delivery address',
        'error'
      );
      return;
    }

    // If payment method is not COD, transaction ID is required
    if (paymentMethod !== 'cod' && !transactionId.trim()) {
      showToast(
        language === 'bn'
          ? 'অনুগ্রহ করে পেমেন্ট করার পর প্রাপ্ত ট্রানজেকশন আইডি (TrxID) প্রদান করুন'
          : 'Please provide the Transaction ID (TrxID) for verification',
        'error'
      );
      return;
    }

    const created = createOrder({
      customerName: name,
      customerPhone: phone,
      customerEmail: email || 'customer@gmail.com',
      address,
      district,
      thana: thana || 'Sadar',
      deliveryType: 'home',
      paymentMethod,
      transactionId: paymentMethod !== 'cod' ? transactionId.trim() : undefined,
      items: cart,
      subtotal: cartSubtotal,
      shippingFee,
      discount: 0,
      total: grandTotal,
    });

    setOrderPlaced(created);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {orderPlaced
                  ? t('অর্ডার সফলভাবে সম্পন্ন হয়েছে!', 'Order Placed Successfully!')
                  : t('চেকআউট ও অর্ডার কনফার্মেশন', 'Checkout & Order Confirmation')}
              </h3>
              <p className="text-xs text-slate-400">
                {orderPlaced
                  ? `Invoice No: ${orderPlaced.id}`
                  : t('নিরাপদ ও দ্রুততম হোম ডেলিভারি সার্ভিস', 'Fast & insured nationwide delivery')}
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {orderPlaced ? (
            /* Order Placed Success View */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900">
                  {t('ধন্যবাদ! আপনার অর্ডারটি নিশ্চিত করা হয়েছে।', 'Thank you! Your order has been placed.')}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {t(
                    'আমাদের কাস্টমার কেয়ার থেকে শিগগিরই ফোন দিয়ে কনফার্মেশন দেওয়া হবে।',
                    'Our verification team will contact you shortly to confirm delivery time.'
                  )}
                </p>
              </div>

              {/* Order Card Receipt */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-lg mx-auto text-left text-xs space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-slate-700">{t('অর্ডার আইডি:', 'Order ID:')}</span>
                  <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {orderPlaced.id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('গ্রাহকের নাম:', 'Customer:')}</span>
                  <span className="font-semibold text-slate-900">{orderPlaced.customerName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('মোবাইল নম্বর:', 'Phone:')}</span>
                  <span className="font-semibold text-slate-900">{orderPlaced.customerPhone}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('ডেলিভারি ঠিকানা:', 'Address:')}</span>
                  <span className="font-semibold text-slate-900 max-w-[240px] truncate text-right">
                    {orderPlaced.address}, {orderPlaced.district}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('পেমেন্ট মাধ্যম:', 'Payment:')}</span>
                  <span className="font-bold text-slate-900">
                    {orderPlaced.paymentMethod === 'bkash'
                      ? 'বিকাশ (bKash)'
                      : orderPlaced.paymentMethod === 'nagad'
                      ? 'নগদ (Nagad)'
                      : orderPlaced.paymentMethod === 'rocket'
                      ? 'রকেট (DBBL Rocket)'
                      : orderPlaced.paymentMethod === 'upay'
                      ? 'উপায় (UCB Upay)'
                      : orderPlaced.paymentMethod === 'card'
                      ? 'কার্ড (Cards)'
                      : orderPlaced.paymentMethod === 'emi'
                      ? '০% কিস্তি (EMI)'
                      : 'ক্যাশ অন ডেলিভারি (COD)'}
                  </span>
                </div>

                {orderPlaced.transactionId && (
                  <div className="flex items-center justify-between bg-amber-50 p-2 rounded-lg border border-amber-200">
                    <span className="text-amber-800 font-bold">{t('ট্রানজেকশন আইডি (TrxID):', 'TrxID:')}</span>
                    <span className="font-mono font-black text-amber-900">{orderPlaced.transactionId}</span>
                  </div>
                )}

                <div className="border-t pt-2 flex items-center justify-between text-sm font-black text-slate-900">
                  <span>{t('সর্বমোট প্রদেয় বিল:', 'Total Amount Payable:')}</span>
                  <span className="text-rose-600">৳{orderPlaced.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    openModal('orderTrack');
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 transition cursor-pointer shadow-md"
                >
                  <Truck className="w-4 h-4" />
                  <span>{t('অর্ডার ট্র্যাক করুন', 'Track Order')}</span>
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-2.5 rounded-lg transition cursor-pointer border border-slate-300"
                >
                  {t('শপিং চালিয়ে যান', 'Continue Shopping')}
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Step 1: Customer Information */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>{t('গ্রাহকের যোগাযোগের তথ্য', 'Customer Information')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('আপনার পূর্ণ নাম *', 'Full Name *')}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. মোঃ সাকিব হাসান"
                        className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 outline-hidden focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('মোবাইল নম্বর *', 'Phone Number *')}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 outline-hidden focus:border-rose-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('ইমেইল অ্যাড্রেস (ঐচ্ছিক)', 'Email Address (Optional)')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 outline-hidden focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery Method */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>{t('ডেলিভারি ঠিকানা ও তথ্য', 'Delivery Address & Details')}</span>
                </h4>

                {/* Delivery Badge */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Truck className="w-4 h-4 text-rose-600" />
                    <span>{t('সরাসরি কুরিয়ার হোম ডেলিভারি', 'Express Courier Home Delivery')}</span>
                  </div>
                  <div className="text-xs font-bold text-rose-700">
                    {district === 'Dhaka' ? t('৳৬০ (ঢাকার ভেতরে)', '৳60 (Inside Dhaka)') : t('৳১২০ (ঢাকার বাইরে)', '৳120 (Outside Dhaka)')}
                  </div>
                </div>

                {/* Address Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('জেলা নির্বাচন করুন *', 'Select District *')}
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-white px-3 py-2 text-xs rounded-lg border border-slate-300 outline-hidden font-medium cursor-pointer"
                    >
                      {bangladeshDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('থানা / উপজেলা *', 'Thana / Upazila *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      placeholder="e.g. ধানমন্ডি / মিরপুর / সদর"
                      className="w-full bg-white px-3 py-2 text-xs rounded-lg border border-slate-300 outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('পূর্ণ বিস্তারিত ঠিকানা (বাড়ি, রোড, এলাকা) *', 'Full Street Address *')}
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. বাড়ি নং ১২, রোড নং ৪, ব্লক-সি, ঢাকা"
                      className="w-full bg-white px-3 py-2 text-xs rounded-lg border border-slate-300 outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>{t('পেমেন্ট মেথড পছন্দ করুন', 'Select Payment Method')}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
                  {[
                    { id: 'cod', name: t('ক্যাশ অন ডেলিভারি', 'Cash on Delivery'), sub: 'পণ্য পেয়ে মূল্য পরিশোধ', badge: 'COD' },
                    { id: 'bkash', name: 'bKash / বিকাশ', sub: 'QR / সেন্ড মানি', badge: 'bKash' },
                    { id: 'nagad', name: 'Nagad / নগদ', sub: 'QR / সেন্ড মানি', badge: 'Nagad' },
                    { id: 'rocket', name: 'Rocket / রকেট', sub: 'DBBL / *322#', badge: 'Rocket' },
                    { id: 'upay', name: 'Upay / উপায়', sub: 'UCB / *268#', badge: 'Upay' },
                    { id: 'card', name: 'Cards / কার্ড', sub: 'Visa, Master, Nexus', badge: 'Cards' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-between cursor-pointer transition min-h-[72px] ${
                        paymentMethod === method.id
                          ? 'border-rose-600 bg-rose-50/70 font-bold text-rose-700 shadow-sm ring-2 ring-rose-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id as any)}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold leading-tight">{method.name}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">{method.sub}</span>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded mt-1.5 ${
                          paymentMethod === method.id
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {method.badge}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Non-COD Payment Instructions, QR Code & TrxID Input */}
                {paymentMethod !== 'cod' && (
                  <div className="mt-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-4 sm:p-5 rounded-2xl border-2 border-rose-600 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-sm text-white">
                            {paymentMethod === 'bkash'
                              ? t('বিকাশ পেমেন্ট / সেন্ড মানি করুন (bKash)', 'bKash Payment / Send Money')
                              : paymentMethod === 'nagad'
                              ? t('নগদ পেমেন্ট / সেন্ড মানি করুন (Nagad)', 'Nagad Payment / Send Money')
                              : paymentMethod === 'rocket'
                              ? t('ডাচ-বাংলা রকেট পেমেন্ট করুন (DBBL Rocket)', 'DBBL Rocket Payment')
                              : paymentMethod === 'upay'
                              ? t('উপায় পেমেন্ট / সেন্ড মানি করুন (UCB Upay)', 'UCB Upay Payment / Send Money')
                              : t('অনলাইন কার্ড / ওয়ালেট পেমেন্ট (Debit/Credit Card)', 'Online Card / Wallet Payment')}
                          </h5>
                          <p className="text-[11px] text-rose-300">
                            {t('নিচের QR কোড স্ক্যান করুন অথবা মোবাইল ওয়ালেট নম্বরে টাকা পাঠান', 'Scan QR Code below or send money to the wallet number')}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black bg-rose-600 text-white px-2.5 py-1 rounded-full shrink-0">
                        {t('প্রদেয়:', 'Payable:')} ৳{grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* QR Code Big Display and Number Section */}
                    <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 flex flex-col md:flex-row items-center gap-6">
                      {/* Big Interactive QR Code */}
                      <div className="shrink-0 flex flex-col items-center">
                        <PaymentQRCode
                          paymentMethod={paymentMethod}
                          phoneNumber={paymentNumber}
                          amount={grandTotal}
                          customImageUrl={footerSettings?.qrCodeUrl}
                          storeName={footerSettings?.storeName}
                          size={180}
                          showControls={true}
                        />
                      </div>

                      {/* Payment Number & Instructions */}
                      <div className="flex-1 text-center sm:text-left space-y-3">
                        <div>
                          <span className="text-xs text-slate-400 block mb-1">
                            {paymentMethod === 'rocket'
                              ? t('রকেট ওয়ালেট / পেমেন্ট নম্বর (১২ ডিজিট):', 'Official Rocket Wallet Number:')
                              : paymentMethod === 'upay'
                              ? t('উপায় ওয়ালেট / পেমেন্ট নম্বর:', 'Official Upay Wallet Number:')
                              : t('টাকা পাঠানোর অফিশিয়াল পারসোনাল/মার্চেন্ট নম্বর:', 'Official Payment Mobile Number:')}
                          </span>
                          <div className="inline-flex items-center gap-2 bg-slate-900 border-2 border-rose-500/80 px-3.5 py-2 rounded-xl">
                            <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                            <span className="text-lg sm:text-xl font-black text-rose-400 tracking-wider font-mono">
                              {paymentNumber}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyNumber}
                              className="ml-1.5 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition cursor-pointer text-xs flex items-center gap-1 font-bold"
                              title={t('নম্বর কপি করুন', 'Copy Number')}
                            >
                              {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="text-[11px]">{copiedNumber ? t('কপি হয়েছে', 'Copied') : t('কপি', 'Copy')}</span>
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-900/90 rounded-lg p-2.5 text-[11px] text-slate-300 space-y-1.5 border border-slate-700/60 text-left">
                          <div className="font-bold text-amber-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {paymentMethod === 'bkash'
                                ? t('বিকাশ পেমেন্ট করার নিয়মাবলী:', 'How to Pay via bKash:')
                                : paymentMethod === 'nagad'
                                ? t('নগদ পেমেন্ট করার নিয়মাবলী:', 'How to Pay via Nagad:')
                                : paymentMethod === 'rocket'
                                ? t('রকেট পেমেন্ট করার নিয়মাবলী (*322# / App):', 'How to Pay via Rocket:')
                                : paymentMethod === 'upay'
                                ? t('উপায় পেমেন্ট করার নিয়মাবলী (*268# / App):', 'How to Pay via Upay:')
                                : t('কার্ড / অনলাইন ব্যাংকিং পেমেন্ট নির্দেশিকা:', 'Card Payment Guide:')}
                            </span>
                          </div>
                          {paymentMethod === 'bkash' && (
                            <>
                              <p>১. বিকাশ অ্যাপ ওপেন করুন অথবা *247# ডায়াল করে <strong>Send Money</strong> অথবা <strong>Payment</strong> অপশনে যান।</p>
                              <p>২. উপরে প্রদর্শিত QR কোড স্ক্যান করুন অথবা <strong>{paymentNumber}</strong> নম্বরে <strong>৳{grandTotal.toLocaleString('en-IN')}</strong> টাকা পাঠান।</p>
                              <p>৩. লেনদেন সম্পন্ন হলে মেসেজে প্রাপ্ত <strong>TrxID</strong> নিচের ঘরে প্রদান করে অর্ডার নিশ্চিত করুন।</p>
                            </>
                          )}
                          {paymentMethod === 'nagad' && (
                            <>
                              <p>১. নগদ অ্যাপ খুলুন অথবা *167# ডায়াল করে <strong>Send Money</strong> অথবা <strong>Merchant Pay</strong> অপশনে যান।</p>
                              <p>২. QR কোড স্ক্যান করুন বা <strong>{paymentNumber}</strong> নম্বরে <strong>৳{grandTotal.toLocaleString('en-IN')}</strong> টাকা সেন্ড করুন।</p>
                              <p>৩. পেমেন্ট সফল হওয়ার পর প্রাপ্ত <strong>TrxID (ট্রানজেকশন আইডি)</strong> নিচের বক্সে লিখুন।</p>
                            </>
                          )}
                          {paymentMethod === 'rocket' && (
                            <>
                              <p>১. রকেট (Rocket) অ্যাপে যান অথবা *322# ডায়াল করে <strong>Send Money</strong> বা <strong>Merchant Pay</strong> অপশন সিলেক্ট করুন।</p>
                              <p>২. রকেট একাউন্ট নম্বর <strong>{paymentNumber}</strong> প্রদান করে টাকার পরিমাণ <strong>৳{grandTotal.toLocaleString('en-IN')}</strong> দিন।</p>
                              <p>৩. লেনদেন শেষে ফিরতি মেসেজের <strong>TxnID / TrxID</strong> টি নিচে লিখে অর্ডার সম্পন্ন করুন।</p>
                            </>
                          )}
                          {paymentMethod === 'upay' && (
                            <>
                              <p>১. উপায় (Upay) অ্যাপে প্রবেশ করুন অথবা *268# ডায়াল করে <strong>Send Money</strong> অথবা <strong>Payment</strong> নির্বাচন করুন।</p>
                              <p>২. উপায় নম্বর <strong>{paymentNumber}</strong> এ সঠিক বিল অ্যামাউন্ট <strong>৳{grandTotal.toLocaleString('en-IN')}</strong> টাকা পাঠান।</p>
                              <p>৩. পেমেন্ট কনফার্মেশনের <strong>TrxID</strong> নিচের ইনপুট বক্সে লিখে কনফার্ম করুন।</p>
                            </>
                          )}
                          {paymentMethod === 'card' && (
                            <>
                              <p>১. আপনার Visa, Mastercard, DBBL Nexus অথবা যেকোনো ব্যাংক কার্ড দিয়ে পেমেন্ট করুন।</p>
                              <p>২. পেমেন্ট ভেরিফিকেশনের জন্য ব্যাংক রেফারেন্স কোড বা ট্রানজেকশন নম্বর নিচে প্রদান করুন।</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Transaction ID Input Field */}
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-500/50 space-y-1.5">
                      <label className="block text-xs font-extrabold text-rose-400">
                        {t('পেমেন্ট ট্রানজেকশন আইডি (TrxID / TxnID) প্রদান করুন *', 'Enter Payment Transaction ID (TrxID / TxnID) *')}
                      </label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required={paymentMethod !== 'cod'}
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                          placeholder={
                            paymentMethod === 'rocket'
                              ? 'e.g. 2938475610 / TXN893247'
                              : paymentMethod === 'upay'
                              ? 'e.g. UP9832109 / 83749210'
                              : 'e.g. BL9A7K9XYZ / 9B78C21AA'
                          }
                          className="w-full bg-slate-900 text-white pl-9 pr-3 py-2.5 text-xs font-mono font-bold rounded-lg border-2 border-slate-700 focus:border-rose-500 focus:outline-hidden tracking-wider uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-500 placeholder:font-normal"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        * {t('সঠিক TrxID প্রদান করলে আপনার অর্ডারটি দ্রুততম সময়ে ভেরিফাই হয়ে ডেলিভারির জন্য প্রস্তুত হবে।', 'Providing the correct TrxID ensures instant order verification and dispatch.')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary & Submit Button */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{t('পণ্যের সাবটোটাল:', 'Products Subtotal:')}</span>
                  <span>৳{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{t('ডেলিভারি চার্জ:', 'Delivery Fee:')}</span>
                  <span>৳{shippingFee}</span>
                </div>
                <div className="flex items-center justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>{t('সর্বমোট প্রদেয় বিল:', 'Total Payable Bill:')}</span>
                  <span className="text-rose-400 text-lg">৳{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <button
                  type="submit"
                  className="w-full mt-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-950 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>{t('অর্ডার কনফার্ম করুন', 'Confirm & Place Order')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
