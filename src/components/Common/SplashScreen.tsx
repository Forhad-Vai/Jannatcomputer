import React, { useEffect, useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { footerSettings, language, t } = useShop();
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(15);

  const logoSrc =
    footerSettings?.logoUrl ||
    'https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png';

  useEffect(() => {
    // Progress increment timer
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 10;
      });
    }, 180);

    // Fade out trigger after 1.8s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    // Complete removal after 2.3s
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 2300);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [onFinish]);

  if (!isVisible) return null;

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 350);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-slate-950 text-white transition-all duration-500 cursor-pointer select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Background ambient lighting with enhanced glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/30 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/25 rounded-full blur-[90px] pointer-events-none"></div>

      {/* Main Branding Card */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        {/* Logo Container with enhanced glowing floating drop shadow (No square box/card) */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute -inset-6 bg-gradient-to-r from-rose-500/40 via-amber-400/35 to-rose-500/40 rounded-full blur-3xl opacity-80 pointer-events-none animate-pulse"></div>
          <img
            src={logoSrc}
            alt="Jannat Computers"
            referrerPolicy="no-referrer"
            className="relative h-32 sm:h-40 md:h-48 w-auto object-contain drop-shadow-[0_12px_45px_rgba(244,63,94,0.7)] hover:scale-105 transition-transform duration-700 select-none"
          />
        </div>

        {/* Website Title */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white flex items-center">
              <span className="text-rose-500 drop-shadow-[0_4px_16px_rgba(244,63,94,0.5)]">জান্নাত</span>
              <span className="ml-2.5 text-slate-100 drop-shadow-[0_4px_16px_rgba(255,255,255,0.2)]">কম্পিউটার্স</span>
            </h1>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm md:text-base font-bold text-amber-400 tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>Jannat Computers • {t('বিশ্বস্ততার সাথে সেরা প্রযুক্তি', 'Tech With Trust')}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 font-medium pt-1 tracking-wider uppercase">
            {t('অনলাইন ও এক্সেসরিজ শপ', 'Online & Accessories Shop')}
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-48 sm:w-56 mt-8 space-y-2">
          <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div
              className="bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-wider">
            {t('লোড হচ্ছে...', 'Loading store...')}
          </p>
        </div>
      </div>

      {/* Skip Hint */}
      <div className="absolute bottom-6 text-[11px] text-slate-400 hover:text-slate-300 transition">
        {t('ক্লিক করে দ্রুত প্রবেশ করুন', 'Click anywhere to skip')}
      </div>
    </div>
  );
};
