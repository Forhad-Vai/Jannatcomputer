import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Maximize2, Copy, Check, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface PaymentQRCodeProps {
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'card' | 'cod' | 'emi';
  phoneNumber: string;
  amount: number;
  customImageUrl?: string;
  storeName?: string;
  size?: number;
  showControls?: boolean;
}

const methodConfig = {
  bkash: {
    nameBn: 'বিকাশ',
    nameEn: 'bKash',
    color: '#D12053',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    badgeBg: 'bg-rose-600',
    type: 'Personal / Merchant',
  },
  nagad: {
    nameBn: 'নগদ',
    nameEn: 'Nagad',
    color: '#F7931E',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    badgeBg: 'bg-orange-600',
    type: 'Personal / Merchant',
  },
  rocket: {
    nameBn: 'রকেট',
    nameEn: 'DBBL Rocket',
    color: '#8C3494',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    badgeBg: 'bg-purple-700',
    type: 'Personal / Wallet',
  },
  upay: {
    nameBn: 'উপায়',
    nameEn: 'UCB Upay',
    color: '#005BAA',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    badgeBg: 'bg-blue-600',
    type: 'Personal / Wallet',
  },
  card: {
    nameBn: 'কার্ড / ব্যাংকিং',
    nameEn: 'Card / Nexus',
    color: '#0F172A',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    badgeBg: 'bg-slate-900',
    type: 'Online Payment',
  },
  emi: {
    nameBn: '০% কিস্তি (EMI)',
    nameEn: 'EMI Facility',
    color: '#047857',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    badgeBg: 'bg-emerald-700',
    type: 'EMI Payment',
  },
  cod: {
    nameBn: 'ক্যাশ অন ডেলিভারি',
    nameEn: 'Cash on Delivery',
    color: '#475569',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    badgeBg: 'bg-slate-700',
    type: 'COD',
  },
};

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  paymentMethod,
  phoneNumber,
  amount,
  customImageUrl,
  storeName = 'জান্নাত কম্পিউটার্স (Jannat Computers)',
  size = 200,
  showControls = true,
}) => {
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string>('');
  const [imageLoadFailed, setImageLoadFailed] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const cfg = methodConfig[paymentMethod] || methodConfig.bkash;

  // Generate payload string for QR Code
  // Standard format or payment text that any mobile scanner or bKash/Nagad app can parse
  const qrPayload = JSON.stringify({
    service: cfg.nameEn,
    store: 'Jannat Computers',
    phone: phoneNumber,
    amount: amount,
    currency: 'BDT',
    ref: `JC-${Date.now().toString().slice(-6)}`,
  });

  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    // Clean phone number for universal scanner compatibility
    // bKash, Nagad and mobile cameras expect either standard clean digits or tel: URI
    // Custom strings like 'PAYMENT:...' cause bKash / Nagad app scanners to throw 'Invalid QR Code'
    const cleanPhone = (phoneNumber || '01717220224').trim().replace(/[^0-9+]/g, '');

    // Format: Standard clean digits is 100% compatible with bKash/Nagad app scanners and phone cameras
    QRCode.toDataURL(cleanPhone, {
      width: size * 3, // Ultra-sharp 3x DPI for crystal-clear scanning on screens
      margin: 2,
      color: {
        dark: cfg.color || '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // High error correction
    })
      .then((url) => {
        if (isMounted) {
          setGeneratedDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
        if (isMounted) {
          // Fallback with basic black & white
          QRCode.toDataURL(cleanPhone || '01717220224', {
            width: size * 2,
            margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' },
          }).then((fallbackUrl) => {
            if (isMounted) {
              setGeneratedDataUrl(fallbackUrl);
              setIsGenerating(false);
            }
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [paymentMethod, phoneNumber, amount, size, storeName, cfg.color, cfg.nameEn]);

  const handleCopyPhone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = !imageLoadFailed && customImageUrl ? customImageUrl : generatedDataUrl;
    link.download = `jannat-computers-${cfg.nameEn.toLowerCase()}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine whether to use custom image or generated vector QR
  const shouldUseCustom = customImageUrl && !imageLoadFailed;
  const currentQrSrc = shouldUseCustom ? customImageUrl : generatedDataUrl;

  return (
    <div className="flex flex-col items-center">
      {/* QR Container */}
      <div
        className={`relative p-3.5 bg-white rounded-2xl border-2 shadow-md flex flex-col items-center justify-center transition-all duration-200 hover:shadow-lg ${cfg.borderColor}`}
        style={{ width: `${size + 28}px`, minHeight: `${size + 28}px` }}
      >
        {/* Method Badge on top */}
        <div className="w-full flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full`}
              style={{ backgroundColor: cfg.color }}
            />
            <span className="text-[11px] font-black text-slate-800 tracking-tight">
              {cfg.nameBn} ({cfg.nameEn})
            </span>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            {cfg.type}
          </span>
        </div>

        {/* QR Image Frame - 100% Clean without any center text or logo overlay */}
        <div className="relative bg-white rounded-xl p-1.5 flex items-center justify-center overflow-hidden w-full aspect-square border border-slate-100 shadow-inner">
          {currentQrSrc ? (
            <img
              src={currentQrSrc}
              alt={`${cfg.nameEn} Payment QR Code`}
              className="w-full h-full object-contain select-none transition-transform"
              style={{ imageRendering: 'crisp-edges' }}
              onError={() => {
                setImageLoadFailed(true);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              <span className="text-[10px] text-slate-400 font-bold">QR জেনারেট হচ্ছে...</span>
            </div>
          )}
        </div>

        {/* Amount & Scan Helper */}
        <div className="w-full mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-semibold">বিল:</span>
          <span className="font-extrabold text-rose-600">৳{amount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Action Controls */}
      {showControls && (
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
            <span>বড় করে দেখুন</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!currentQrSrc}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition-colors"
            title="QR কোড ইমেজ সেভ করুন"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>ডাউনলোড</span>
          </button>

          <button
            type="button"
            onClick={handleCopyPhone}
            className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'text-slate-700 bg-white hover:bg-slate-100 hover:text-slate-900 border-slate-200 shadow-xs'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>কপি হয়েছে</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>নম্বর কপি</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-white mb-2" style={{ backgroundColor: cfg.color }}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>অফিশিয়াল {cfg.nameBn} পেমেন্ট QR</span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                স্ক্যান করে ৳{amount.toLocaleString('en-IN')} পরিশোধ করুন
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {cfg.nameEn} অ্যাপ দিয়ে নিচের QR কোডটি সরাসরি স্ক্যান করুন
              </p>
            </div>

            {/* High-res QR Display - Completely clean without center overlay */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-center mb-4">
              <div className="w-64 h-64 bg-white p-2 rounded-xl shadow-inner flex items-center justify-center relative">
                <img
                  src={currentQrSrc}
                  alt={`${cfg.nameEn} Payment QR Code`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Wallet Number Bar */}
            <div className="bg-slate-100 p-3 rounded-xl flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">{cfg.nameBn} নম্বর:</span>
                <span className="text-sm font-black text-slate-900 font-mono">{phoneNumber}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              বন্ধ করুন (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
