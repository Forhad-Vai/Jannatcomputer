import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { TopBar } from './components/Header/TopBar';
import { Navbar } from './components/Header/Navbar';
import { MegaMenu } from './components/Header/MegaMenu';
import { HeroBanner } from './components/Hero/HeroBanner';
import { QuickFeatures } from './components/Hero/QuickFeatures';
import { ProductGrid } from './components/Product/ProductGrid';
import { ProductDetailModal } from './components/Product/ProductDetailModal';
import { PCBuilderView } from './components/PCBuilder/PCBuilderView';
import { AIAdvisorModal } from './components/PCBuilder/AIAdvisorModal';
import { CompareModal } from './components/Compare/CompareModal';
import { CartDrawer } from './components/Cart/CartDrawer';
import { CheckoutModal } from './components/Checkout/CheckoutModal';
import { OrderTrackModal } from './components/OrderTrack/OrderTrackModal';
import { AuthModal } from './components/Auth/AuthModal';
import { WishlistModal } from './components/Wishlist/WishlistModal';
import { AdminDashboardModal } from './components/Admin/AdminDashboardModal';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { MarketPanelModal } from './components/Market/MarketPanelModal';
import { MarketLoginModal } from './components/Market/MarketLoginModal';
import { PolicyInfoModal } from './components/Common/PolicyInfoModal';
import { Footer } from './components/Footer/Footer';
import {
  Cpu,
  ShoppingCart,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ArrowUp,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    language,
    t,
    activeModal,
    openModal,
    toastMessage,
    cartTotalCount,
  } = useShop();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-rose-600 selection:text-white">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-60 animate-in slide-in-from-bottom-3 duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold ${
              toastMessage.type === 'error'
                ? 'bg-rose-600 text-white'
                : toastMessage.type === 'info'
                ? 'bg-slate-900 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Layer */}
      <header className="sticky top-0 z-40 bg-white shadow-xs">
        <TopBar />
        <Navbar />
        <MegaMenu />
      </header>

      {/* Main Page Body */}
      <main className="flex-1">
        <HeroBanner />
        <QuickFeatures />
        <ProductGrid />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col gap-2.5 items-end">
        {/* Floating PC Builder CTA */}
        <button
          onClick={() => openModal('pcBuilder')}
          className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 border-2 border-white/40 transition transform hover:scale-105 cursor-pointer"
        >
          <Cpu className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>{t('পিসি বিল্ডার', 'PC Builder')}</span>
        </button>

        {/* Floating AI Consultant CTA */}
        <button
          onClick={() => openModal('aiAdvisor')}
          className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs px-3.5 py-2 rounded-full shadow-lg flex items-center gap-1.5 border border-amber-400/30 transition transform hover:scale-105 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('AI পরামর্শ', 'AI Advisor')}</span>
        </button>

        {/* Floating Cart Button with Counter */}
        {cartTotalCount > 0 && (
          <button
            onClick={() => openModal('cart')}
            className="bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-full shadow-2xl relative transition transform hover:scale-105 cursor-pointer"
            title="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs border-2 border-white">
              {cartTotalCount}
            </span>
          </button>
        )}

        {/* Scroll To Top Button */}
        <button
          onClick={scrollToTop}
          className="bg-white/90 hover:bg-white text-slate-700 p-2.5 rounded-full shadow-md border border-slate-200 transition cursor-pointer"
          title="Top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

      {/* Global Modals Controlled by Context */}
      {activeModal === 'productDetail' && <ProductDetailModal />}
      {activeModal === 'pcBuilder' && <PCBuilderView />}
      {activeModal === 'aiAdvisor' && <AIAdvisorModal />}
      {activeModal === 'compare' && <CompareModal />}
      {activeModal === 'cart' && <CartDrawer />}
      {activeModal === 'checkout' && <CheckoutModal />}
      {activeModal === 'orderTrack' && <OrderTrackModal />}
      {activeModal === 'auth' && <AuthModal />}
      {activeModal === 'wishlist' && <WishlistModal />}
      {activeModal === 'admin' && <AdminDashboardModal />}
      {activeModal === 'adminLogin' && <AdminLoginModal />}
      {activeModal === 'market' && <MarketPanelModal />}
      {activeModal === 'marketLogin' && <MarketLoginModal />}
      {activeModal === 'policy' && <PolicyInfoModal />}
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainLayout />
    </ShopProvider>
  );
}
