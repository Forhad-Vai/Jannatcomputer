import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, PCComponentCategory, Order, FilterState, Language, UserProfile, Coupon, FooterSettings, PolicyTab, StorePolicySettings, PolicySection, HeroBannerSettings, HeroSlide, HeroSidePromo } from '../types';
import { productsData } from '../data/products';
import { defaultPolicySettings } from '../data/defaultPolicies';
import { defaultHeroBannerSettings } from '../data/defaultHeroBanner';
import { verifyCurrentSession, logoutSession } from '../utils/authApi';

interface ShopContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (bnText: string, enText: string) => string;

  // Authentication & Admin
  currentUser: UserProfile | null;
  isAdmin: boolean;
  isMarketAdmin: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;

  // Footer & Store Settings
  footerSettings: FooterSettings;
  updateFooterSettings: (updated: Partial<FooterSettings>) => void;
  resetFooterSettings: () => void;

  // Hero Banner Settings
  heroBannerSettings: HeroBannerSettings;
  updateHeroBannerSettings: (updated: Partial<HeroBannerSettings>) => void;
  updateHeroSlide: (id: string, updated: Partial<HeroSlide>) => void;
  addHeroSlide: (slide: HeroSlide) => void;
  deleteHeroSlide: (id: string) => void;
  updateHeroSidePromo: (id: string, updated: Partial<HeroSidePromo>) => void;
  resetHeroBannerSettings: () => void;

  // Policies & Information Settings
  policySettings: StorePolicySettings;
  updatePolicySettings: (updated: Partial<StorePolicySettings>) => void;
  updateSinglePolicy: (tab: PolicyTab, updated: Partial<PolicySection>) => void;
  resetPolicySettings: () => void;

  // Products state & mutations
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotal: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Compare
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isComparing: (productId: string) => boolean;

  // PC Builder
  pcBuild: Record<PCComponentCategory, Product | null>;
  setPCComponent: (category: PCComponentCategory, product: Product | null) => void;
  removePCComponent: (category: PCComponentCategory) => void;
  clearPCBuild: () => void;
  pcBuildTotalPrice: number;
  pcBuildTotalWattage: number;
  addFullBuildToCart: () => void;
  applyPrebuiltRig: (preset: 'gaming' | 'creator' | 'budget') => void;

  // Modals & Navigation
  activeModal: 'cart' | 'compare' | 'pcBuilder' | 'checkout' | 'productDetail' | 'orderTrack' | 'auth' | 'aiAdvisor' | 'admin' | 'adminLogin' | 'market' | 'marketLogin' | 'wishlist' | 'policy' | null;
  openModal: (modal: 'cart' | 'compare' | 'pcBuilder' | 'checkout' | 'productDetail' | 'orderTrack' | 'auth' | 'aiAdvisor' | 'admin' | 'adminLogin' | 'market' | 'marketLogin' | 'wishlist' | 'policy') => void;
  closeModal: () => void;
  policyTab: PolicyTab;
  setPolicyTab: (tab: PolicyTab) => void;
  openPolicyModal: (tab?: PolicyTab) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  viewProductDetails: (product: Product) => void;

  // Search & Filter
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  selectCategory: (categoryId: string, subcategoryId?: string) => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'timeline'>) => Order;
  lastPlacedOrder: Order | null;
  findOrder: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order['status'], note?: string) => void;
  deleteOrder: (orderId: string) => void;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  toggleCouponStatus: (code: string) => void;
  deleteCoupon: (code: string) => void;

  // Toast notifications
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const defaultPCBuild: Record<PCComponentCategory, Product | null> = {
  cpu: null,
  cooler: null,
  motherboard: null,
  ram: null,
  storage: null,
  gpu: null,
  psu: null,
  casing: null,
  monitor: null,
  accessories: null,
};

const initialFilters: FilterState = {
  category: 'all',
  subcategory: 'all',
  brand: [],
  minPrice: 0,
  maxPrice: 400000,
  inStockOnly: false,
  sortBy: 'popular',
  searchQuery: '',
};

const initialCoupons: Coupon[] = [
  {
    code: 'JANNAT1000',
    discountType: 'fixed',
    discountAmount: 1000,
    minSpend: 20000,
    isActive: true,
    description: '৳১,০০০ ডিসকাউন্ট (ন্যূনতম ৳২০,০০০ ক্রয়ে)',
  },
  {
    code: 'EID2026',
    discountType: 'percentage',
    discountAmount: 5,
    minSpend: 15000,
    isActive: true,
    description: '৫% স্পেশাল ঈদ ডিসকাউন্ট',
  },
  {
    code: 'GAMING500',
    discountType: 'fixed',
    discountAmount: 500,
    minSpend: 10000,
    isActive: true,
    description: '৳৫০০ গেমিং কম্পোনেন্ট ক্যাশব্যাক',
  },
];

const initialFooterSettings: FooterSettings = {
  storeName: 'জান্নাত কম্পিউটার্স (Jannat Computers)',
  tagline: 'Jannat Computers & IT Solutions',
  taglineBn: 'জান্নাত কম্পিউটার্স অ্যান্ড আইটি সলিউশনস',
  aboutText: 'Bangladesh’s trusted IT retail and wholesale superstore. Genuine laptops, custom desktop PCs, gaming rigs and tech accessories with official warranty.',
  aboutTextBn: 'বাংলাদেশের বিশ্বস্ত কম্পিউটার ও আইটি শপ। ডেল, এইচপি, আসুস, এমএসআই, গিগাবাইট, অ্যাপল, ইন্টেল ও এএমডি এর অথরাইজড পার্টনার। সুলভ মূল্যে জেনুইন ল্যাপটপ, ডেস্কটপ পিসি এবং গেমিং কম্পোনেন্ট কিনুন।',
  address: 'South side of Palashbari Mohila College Gate, adj. to Vision Showroom & Ghoraghat Road, Palashbari Pouroshova, Gaibandha.',
  addressBn: 'পলাশবাড়ী মহিলা কলেজ গেইটের দক্ষিণ পার্শ্বে, ভিশন শো-রুম সংলগ্ন, ঘোড়াঘাট রোড সংলগ্ন, পলাশবাড়ী পৌরসভা, গাইবান্ধা।',
  phone1: '01717 220 224',
  phone2: '01316 768 044',
  email: 'support@jannatcomputers.com',
  businessHours: '9:00 AM to 8:30 PM (Daily)',
  businessHoursBn: 'সকাল ৯:০০ - রাত ৮:৩০ (প্রতিদিন খোলা)',
  tradeLicense: 'TRAD/DNCC/042918/2026',
  bcsMembership: 'BCS (Bangladesh Computer Samity)',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
  instagramUrl: 'https://instagram.com',
  linkedinUrl: 'https://linkedin.com',
  qrCodeUrl: '',
  paymentPhone: '01717220224',
  logoUrl: 'https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png',
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('bn');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('jc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [footerSettings, setFooterSettings] = useState<FooterSettings>(() => {
    try {
      const saved = localStorage.getItem('jc_footer_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.qrCodeUrl || parsed.qrCodeUrl.includes('kommodo.ai')) {
          parsed.qrCodeUrl = 'https://cdn.phototourl.com/free/2026-08-18-2c5004d3-0d92-493e-8af1-bfe4b70b3c1d.jpg';
        }
        if (!parsed.logoUrl) {
          parsed.logoUrl = 'https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png';
        }
        return { ...initialFooterSettings, ...parsed };
      }
      return initialFooterSettings;
    } catch {
      return initialFooterSettings;
    }
  });

  const updateFooterSettings = (updated: Partial<FooterSettings>) => {
    setFooterSettings((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('jc_footer_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    showToast(language === 'bn' ? 'ফুটার ও শপ তথ্য সফলভাবে আপডেট হয়েছে!' : 'Footer and store details updated successfully!');
  };

  const resetFooterSettings = () => {
    setFooterSettings(initialFooterSettings);
    try {
      localStorage.removeItem('jc_footer_settings');
    } catch {
      // ignore
    }
    showToast(language === 'bn' ? 'ফুটার তথ্য ডিফল্ট অবস্থায় রিস্টোর করা হয়েছে' : 'Footer details reset to defaults');
  };

  // Policy Settings state with localStorage persistence
  const [policySettings, setPolicySettings] = useState<StorePolicySettings>(() => {
    try {
      const saved = localStorage.getItem('jc_policy_settings');
      return saved ? { ...defaultPolicySettings, ...JSON.parse(saved) } : defaultPolicySettings;
    } catch {
      return defaultPolicySettings;
    }
  });

  const updatePolicySettings = (updated: Partial<StorePolicySettings>) => {
    setPolicySettings((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('jc_policy_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    showToast(
      language === 'bn'
        ? 'সকল পলিসি ও তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!'
        : 'Store policies and information saved successfully!'
    );
  };

  const updateSinglePolicy = (tab: PolicyTab, updated: Partial<PolicySection>) => {
    setPolicySettings((prev) => {
      const next = {
        ...prev,
        [tab]: {
          ...prev[tab],
          ...updated,
        },
      };
      try {
        localStorage.setItem('jc_policy_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    showToast(
      language === 'bn'
        ? 'নির্বাচিত পলিসি সফলভাবে আপডেট হয়েছে!'
        : 'Policy section updated successfully!'
    );
  };

  const resetPolicySettings = () => {
    setPolicySettings(defaultPolicySettings);
    try {
      localStorage.removeItem('jc_policy_settings');
    } catch {
      // ignore
    }
    showToast(
      language === 'bn'
        ? 'সকল পলিসি ডিফল্ট অবস্থায় রিস্টোর করা হয়েছে'
        : 'All policies reset to factory defaults'
    );
  };

  // Hero Banner Settings state with localStorage persistence
  const [heroBannerSettings, setHeroBannerSettings] = useState<HeroBannerSettings>(() => {
    try {
      const saved = localStorage.getItem('jc_hero_banner_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          autoSlideIntervalSeconds: parsed.autoSlideIntervalSeconds || defaultHeroBannerSettings.autoSlideIntervalSeconds,
          slides: Array.isArray(parsed.slides) && parsed.slides.length > 0 ? parsed.slides : defaultHeroBannerSettings.slides,
          sidePromos: Array.isArray(parsed.sidePromos) && parsed.sidePromos.length > 0 ? parsed.sidePromos : defaultHeroBannerSettings.sidePromos,
        };
      }
      return defaultHeroBannerSettings;
    } catch {
      return defaultHeroBannerSettings;
    }
  });

  const updateHeroBannerSettings = (updated: Partial<HeroBannerSettings>) => {
    setHeroBannerSettings((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('jc_hero_banner_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    showToast(
      language === 'bn'
        ? 'হিরো ব্যানার সেটিংস সফলভাবে সেভ করা হয়েছে!'
        : 'Hero banner settings saved successfully!'
    );
  };

  const updateHeroSlide = (id: string, updated: Partial<HeroSlide>) => {
    setHeroBannerSettings((prev) => {
      const nextSlides = prev.slides.map((s) => (s.id === id ? { ...s, ...updated } : s));
      const next = { ...prev, slides: nextSlides };
      try {
        localStorage.setItem('jc_hero_banner_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    showToast(
      language === 'bn'
        ? 'স্লাইড সফলভাবে আপডেট হয়েছে!'
        : 'Slide updated successfully!'
    );
  };

  const addHeroSlide = (slide: HeroSlide) => {
    setHeroBannerSettings((prev) => {
      const next = { ...prev, slides: [...prev.slides, slide] };
      try {
        localStorage.setItem('jc_hero_banner_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    showToast(
      language === 'bn'
        ? 'নতুন স্লাইড সফলভাবে যুক্ত হয়েছে!'
        : 'New banner slide added successfully!'
    );
  };

  const deleteHeroSlide = (id: string) => {
    setHeroBannerSettings((prev) => {
      if (prev.slides.length <= 1) {
        showToast(
          language === 'bn' ? 'কমপক্ষে ১টি স্লাইড থাকতে হবে!' : 'At least one slide must remain!',
          'error'
        );
        return prev;
      }
      const next = { ...prev, slides: prev.slides.filter((s) => s.id !== id) };
      try {
        localStorage.setItem('jc_hero_banner_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    showToast(
      language === 'bn'
        ? 'স্লাইডটি মুছে ফেলা হয়েছে'
        : 'Slide removed successfully'
    );
  };

  const updateHeroSidePromo = (id: string, updated: Partial<HeroSidePromo>) => {
    setHeroBannerSettings((prev) => {
      const nextPromos = prev.sidePromos.map((p) => (p.id === id ? { ...p, ...updated } : p));
      const next = { ...prev, sidePromos: nextPromos };
      try {
        localStorage.setItem('jc_hero_banner_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    showToast(
      language === 'bn'
        ? 'সাইড প্রমো কার্ড সফলভাবে আপডেট হয়েছে!'
        : 'Side promo card updated successfully!'
    );
  };

  const resetHeroBannerSettings = () => {
    setHeroBannerSettings(defaultHeroBannerSettings);
    try {
      localStorage.removeItem('jc_hero_banner_settings');
    } catch {
      // ignore
    }
    showToast(
      language === 'bn'
        ? 'হিরো ব্যানার ডিফল্ট অবস্থায় রিস্টোর করা হয়েছে'
        : 'Hero banner reset to factory defaults'
    );
  };

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('jc_products');
      return saved ? JSON.parse(saved) : productsData;
    } catch {
      return productsData;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('jc_coupons');
      return saved ? JSON.parse(saved) : initialCoupons;
    } catch {
      return initialCoupons;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('jc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jc_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareList, setCompareList] = useState<Product[]>([]);
  const [pcBuild, setPcBuild] = useState<Record<PCComponentCategory, Product | null>>(defaultPCBuild);
  const [activeModal, setActiveModal] = useState<ShopContextType['activeModal']>(null);
  const [policyTab, setPolicyTab] = useState<PolicyTab>('about');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('jc_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Seed with a default tracking order for demonstration
    return [
      {
        id: 'JC-78241',
        createdAt: '15 Aug 2026, 04:30 PM',
        customerName: 'আরিফুল ইসলাম',
        customerPhone: '01712-345678',
        customerEmail: 'ariful.tech@gmail.com',
        address: 'বাড়ি ১২, রোড ৪, ব্লক সি, ধানমন্ডি, ঢাকা',
        district: 'Dhaka',
        thana: 'Dhanmondi',
        deliveryType: 'home',
        paymentMethod: 'bkash',
        items: [
          {
            product: productsData[0], // Ryzen 7 7800X3D
            quantity: 1,
          },
          {
            product: productsData[7], // Samsung 990 Pro SSD
            quantity: 1,
          },
        ],
        subtotal: 63000,
        shippingFee: 60,
        discount: 1000,
        total: 62060,
        status: 'in_transit',
        timeline: [
          {
            status: 'Order Placed',
            statusBn: 'অর্ডার গ্রহণ করা হয়েছে',
            date: '15 Aug, 04:30 PM',
            description: 'Order successfully verified by system',
            descriptionBn: 'সিস্টেম দ্বারা অর্ডার সফলভাবে যাচাই করা হয়েছে',
            done: true,
          },
          {
            status: 'Processing & Testing',
            statusBn: 'যাচাই ও টেস্টিং সম্পন্ন',
            date: '16 Aug, 10:15 AM',
            description: 'Component serials recorded and packaged at Central Hub',
            descriptionBn: 'সেন্ট্রাল হাব এ কম্পোনেন্ট সিরিয়াল রেকর্ড ও প্যাকিং সম্পন্ন',
            done: true,
          },
          {
            status: 'Handed to Courier (Steadfast/RedX)',
            statusBn: 'কুরিয়ারে হস্তান্তর করা হয়েছে',
            date: '17 Aug, 09:00 AM',
            description: 'In transit with delivery rider for home delivery',
            descriptionBn: 'ডেলিভারি রাইডারের কাছে হোম ডেলিভারির জন্য হস্তান্তর করা হয়েছে',
            done: true,
          },
          {
            status: 'Delivered',
            statusBn: 'পণ্য ডেলিভারি সম্পন্ন',
            date: 'Estimated Today by 6:00 PM',
            description: 'Customer receives verified warranty card & invoice',
            descriptionBn: 'গ্রাহক সিলযুক্ত ওয়ারেন্টি কার্ড ও ইনভয়েস গ্রহণ করবেন',
            done: false,
          },
        ],
      },
    ];
  });
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('jc_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('jc_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('jc_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('jc_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('jc_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('jc_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Verify token on mount if present
  useEffect(() => {
    async function checkAuth() {
      if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'market')) {
        const verifyRes = await verifyCurrentSession();
        if (!verifyRes.valid) {
          // Token is invalid or expired
          setCurrentUser(null);
          logoutSession();
        }
      }
    }
    checkAuth();
  }, []);

  const isAdmin = currentUser?.role === 'admin';
  const isMarketAdmin = currentUser?.role === 'market' || currentUser?.role === 'admin';

  const login = (user: UserProfile) => {
    setCurrentUser(user);
    showToast(
      user.role === 'admin'
        ? (language === 'bn' ? 'এডমিন হিসেবে সফলভাবে লগইন হয়েছেন!' : 'Logged in as Administrator!')
        : user.role === 'market'
        ? (language === 'bn' ? 'মার্কেট প্যানেলে সফলভাবে লগইন হয়েছেন!' : 'Logged in to Market Panel!')
        : (language === 'bn' ? `স্বাগতম, ${user.name}!` : `Welcome back, ${user.name}!`)
    );
  };

  const logout = () => {
    setCurrentUser(null);
    logoutSession();
    showToast(language === 'bn' ? 'লগআউট সফল হয়েছে' : 'Logged out successfully', 'info');
  };

  // Product mutations
  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast(language === 'bn' ? 'নতুন পণ্য সফলভাবে যুক্ত হয়েছে' : 'Product added successfully');
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    showToast(language === 'bn' ? 'পণ্যের তথ্য আপডেট করা হয়েছে' : 'Product updated successfully');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    showToast(language === 'bn' ? 'পণ্য ডিলিট করা হয়েছে' : 'Product deleted', 'info');
  };

  const resetProducts = () => {
    setProducts(productsData);
    localStorage.setItem('jc_products', JSON.stringify(productsData));
    showToast(
      language === 'bn'
        ? 'ডিফল্ট প্রোডাক্ট ক্যাটালগ সফলভাবে রিস্টোর করা হয়েছে'
        : 'Default product catalog restored successfully'
    );
  };

  // Order status mutations
  const updateOrderStatus = (orderId: string, status: Order['status'], note?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updatedTimeline = [...o.timeline];
        const statusMap: Record<string, { en: string; bn: string }> = {
          pending: { en: 'Order Pending', bn: 'অর্ডার পেন্ডিং' },
          confirmed: { en: 'Order Confirmed', bn: 'অর্ডার কনফার্ম' },
          processing: { en: 'Packaging & QC', bn: 'প্যাকেজিং ও কিউসি' },
          in_transit: { en: 'Dispatched to Courier', bn: 'কুরিয়ারে পাঠানো হয়েছে' },
          delivered: { en: 'Delivered', bn: 'পণ্য ডেলিভারি সম্পন্ন' },
        };
        const stInfo = statusMap[status] || { en: status, bn: status };
        updatedTimeline.push({
          status: stInfo.en,
          statusBn: stInfo.bn,
          date: 'Just Now',
          description: note || `Order marked as ${status}`,
          descriptionBn: note || `অর্ডারের বর্তমান স্ট্যাটাস: ${stInfo.bn}`,
          done: true,
        });
        return {
          ...o,
          status,
          timeline: updatedTimeline,
        };
      })
    );
    showToast(language === 'bn' ? `অর্ডার #${orderId} স্ট্যাটাস আপডেট হয়েছে` : `Order #${orderId} status updated`);
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast(language === 'bn' ? 'অর্ডার রেকর্ড মুছে ফেলা হয়েছে' : 'Order deleted', 'info');
  };

  // Coupons mutations
  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => [coupon, ...prev]);
    showToast(language === 'bn' ? `কুপন কোড ${coupon.code} তৈরি হয়েছে` : `Coupon ${coupon.code} created`);
  };

  const toggleCouponStatus = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const deleteCoupon = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    showToast(language === 'bn' ? 'কুপন মুছে ফেলা হয়েছে' : 'Coupon deleted', 'info');
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const t = (bnText: string, enText: string) => {
    return language === 'bn' ? bnText : enText;
  };

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(
      language === 'bn'
        ? `"${product.nameBn || product.name}" কার্টে যোগ করা হয়েছে`
        : `"${product.name}" added to cart!`
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast(language === 'bn' ? 'কার্ট থেকে পণ্য সরানো হয়েছে' : 'Item removed from cart', 'info');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast(language === 'bn' ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast(language === 'bn' ? 'পছন্দের তালিকায় যুক্ত হয়েছে' : 'Added to wishlist!');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Compare
  const addToCompare = (product: Product) => {
    if (compareList.some((p) => p.id === product.id)) {
      showToast(language === 'bn' ? 'পণ্যটি আগেই তালিকায় যুক্ত আছে' : 'Already in comparison list', 'info');
      return;
    }
    if (compareList.length >= 4) {
      showToast(
        language === 'bn' ? 'সর্বোচ্চ ৪টি পণ্য একসাথে তুলনা করা যাবে' : 'Maximum 4 products can be compared together',
        'error'
      );
      return;
    }
    setCompareList((prev) => [...prev, product]);
    showToast(language === 'bn' ? 'তুলনা তালিকায় যোগ করা হয়েছে' : 'Added to comparison list');
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isComparing = (productId: string) => compareList.some((p) => p.id === productId);

  // PC Builder
  const setPCComponent = (category: PCComponentCategory, product: Product | null) => {
    setPcBuild((prev) => ({
      ...prev,
      [category]: product,
    }));
    if (product) {
      showToast(
        language === 'bn'
          ? `${product.nameBn || product.name} পিসি বিল্ডে নির্বাচন করা হয়েছে`
          : `${product.name} selected for your PC build!`
      );
    }
  };

  const removePCComponent = (category: PCComponentCategory) => {
    setPcBuild((prev) => ({
      ...prev,
      [category]: null,
    }));
  };

  const clearPCBuild = () => {
    setPcBuild(defaultPCBuild);
    showToast(language === 'bn' ? 'পিসি বিল্ড রিসেট করা হয়েছে' : 'PC build reset', 'info');
  };

  const pcBuildTotalPrice = (Object.values(pcBuild) as (Product | null)[]).reduce((sum, item) => {
    return sum + (item ? item.price : 0);
  }, 0);

  const pcBuildTotalWattage = (Object.values(pcBuild) as (Product | null)[]).reduce((sum, item) => {
    return sum + (item && item.wattage ? item.wattage : 0);
  }, 0);

  const addFullBuildToCart = () => {
    const selectedItems = Object.values(pcBuild).filter(Boolean) as Product[];
    if (selectedItems.length === 0) {
      showToast(language === 'bn' ? 'অনুগ্রহ করে অন্তত একটি কম্পোনেন্ট নির্বাচন করুন' : 'Please select at least one component', 'error');
      return;
    }
    selectedItems.forEach((product) => {
      addToCart(product, 1);
    });
    showToast(
      language === 'bn'
        ? `সম্পূর্ণ পিসি বিল্ড (${selectedItems.length} টি পার্টস) কার্টে যোগ করা হয়েছে!`
        : `Complete PC build (${selectedItems.length} components) added to cart!`
    );
    setActiveModal('cart');
  };

  const applyPrebuiltRig = (preset: 'gaming' | 'creator' | 'budget') => {
    if (preset === 'gaming') {
      const cpu = productsData.find((p) => p.id === 'cpu-ryzen-7-7800x3d') || null;
      const mb = productsData.find((p) => p.id === 'mb-asus-tuf-b650-wifi') || null;
      const ram = productsData.find((p) => p.id === 'ram-corsair-vengeance-32gb-ddr5') || null;
      const gpu = productsData.find((p) => p.id === 'gpu-asus-tuf-rtx-4070-super') || null;
      const ssd = productsData.find((p) => p.id === 'ssd-samsung-990-pro-1tb') || null;
      const psu = productsData.find((p) => p.id === 'psu-corsair-rm750e-gold') || null;
      const casing = productsData.find((p) => p.id === 'casing-lian-li-o11-dynamic-evo') || null;
      const cooler = productsData.find((p) => p.id === 'cooler-deepcool-ak620-digital') || null;
      const monitor = productsData.find((p) => p.id === 'mon-lg-ultragear-27gr75q') || null;
      const accessories = productsData.find((p) => p.id === 'acc-keychron-v1-custom') || null;

      setPcBuild({
        cpu,
        motherboard: mb,
        ram,
        gpu,
        storage: ssd,
        psu,
        casing,
        cooler,
        monitor,
        accessories,
      });
      showToast(language === 'bn' ? 'আলটিমেট গেমিং রিগ কনফিগারেশন লোড হয়েছে!' : 'Ultimate Gaming Rig configured!');
    } else if (preset === 'creator') {
      const cpu = productsData.find((p) => p.id === 'cpu-intel-core-i7-14700k') || null;
      const mb = productsData.find((p) => p.id === 'mb-msi-b760-tomahawk') || null;
      const ram = productsData.find((p) => p.id === 'ram-corsair-vengeance-32gb-ddr5') || null;
      const gpu = productsData.find((p) => p.id === 'gpu-sapphire-rx-7800-xt') || null;
      const ssd = productsData.find((p) => p.id === 'ssd-samsung-990-pro-1tb') || null;
      const psu = productsData.find((p) => p.id === 'psu-corsair-rm750e-gold') || null;
      const casing = productsData.find((p) => p.id === 'casing-montech-air-903-max') || null;
      const cooler = productsData.find((p) => p.id === 'cooler-deepcool-ak620-digital') || null;
      const monitor = productsData.find((p) => p.id === 'mon-lg-ultragear-27gr75q') || null;
      const accessories = productsData.find((p) => p.id === 'acc-keychron-v1-custom') || null;

      setPcBuild({
        cpu,
        motherboard: mb,
        ram,
        gpu,
        storage: ssd,
        psu,
        casing,
        cooler,
        monitor,
        accessories,
      });
      showToast(language === 'bn' ? 'প্রো এডিটর ও ক্রিয়েটর কনফিগারেশন লোড হয়েছে!' : 'Pro Creator configuration loaded!');
    } else {
      // Budget
      const cpu = productsData.find((p) => p.id === 'cpu-intel-core-i5-14400f') || null;
      const mb = productsData.find((p) => p.id === 'mb-gigabyte-b650m-gaming') || null;
      const ram = productsData.find((p) => p.id === 'ram-kingston-fury-16gb-ddr5') || null;
      const gpu = productsData.find((p) => p.id === 'gpu-zotac-rtx-4060-8gb') || null;
      const ssd = productsData.find((p) => p.id === 'ssd-kingston-kc3000-1tb') || null;
      const psu = productsData.find((p) => p.id === 'psu-deepcool-pk650d-bronze') || null;
      const casing = productsData.find((p) => p.id === 'casing-montech-air-903-max') || null;
      const cooler = productsData.find((p) => p.id === 'cooler-deepcool-ak620-digital') || null;
      const monitor = productsData.find((p) => p.id === 'mon-asus-tuf-vg249q3a') || null;
      const accessories = productsData.find((p) => p.id === 'acc-logitech-g502-hero') || null;

      setPcBuild({
        cpu,
        motherboard: mb,
        ram,
        gpu,
        storage: ssd,
        psu,
        casing,
        cooler,
        monitor,
        accessories,
      });
      showToast(language === 'bn' ? 'বেস্ট ভ্যালু বাজেট কনফিগারেশন লোড হয়েছে!' : 'Best Value Budget configuration loaded!');
    }
  };

  // Modals
  const openModal = (modal: ShopContextType['activeModal']) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const openPolicyModal = (tab: PolicyTab = 'about') => {
    setPolicyTab(tab);
    setActiveModal('policy');
  };

  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setActiveModal('productDetail');
  };

  // Navigation & Category Selection
  const selectCategory = (categoryId: string, subcategoryId?: string) => {
    setFilters((prev) => ({
      ...prev,
      category: categoryId,
      subcategory: subcategoryId || 'all',
      searchQuery: '',
    }));
    // scroll smoothly to product section
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'timeline'>): Order => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newOrderId = `JC-${randomNum}`;
    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const newOrder: Order = {
      ...orderData,
      id: newOrderId,
      createdAt: formattedDate,
      status: 'pending',
      timeline: [
        {
          status: 'Order Placed',
          statusBn: 'অর্ডার গ্রহণ করা হয়েছে',
          date: formattedDate,
          description: 'Your order has been recorded in Jannat Computers database',
          descriptionBn: 'জান্নাত কম্পিউটার্স সিস্টেমে আপনার অর্ডার নথিভুক্ত হয়েছে',
          done: true,
        },
        {
          status: 'Verification',
          statusBn: 'ফোন ভেরিফিকেশন',
          date: 'Within 30 mins',
          description: 'Our customer support will call to confirm billing details',
          descriptionBn: 'আমাদের প্রতিনিধি কল করে ঠিকানা ও অর্ডার কনফার্ম করবেন',
          done: false,
        },
        {
          status: 'Processing & QC Testing',
          statusBn: 'প্যাকেজিং ও কিউসি টেস্টিং',
          date: 'Next Step',
          description: 'Products tested and packaged safely with warranty stamps',
          descriptionBn: 'পণ্য টেস্ট করে সিকিউর বাবল র‍্যাপ ও ওয়ারেন্টি সিল লাগানো হবে',
          done: false,
        },
        {
          status: 'Dispatched with Courier',
          statusBn: 'কুরিয়ারে হস্তান্তর',
          date: 'In 24-48 Hours',
          description: 'Courier tracking code will be SMS sent to your phone',
          descriptionBn: 'আপনার মোবাইলে কুরিয়ার ট্র্যাকিং কোড এসএমএস যাবে',
          done: false,
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const findOrder = (orderId: string) => {
    return orders.find((o) => o.id.toLowerCase() === orderId.trim().toLowerCase());
  };

  return (
    <ShopContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        currentUser,
        isAdmin,
        isMarketAdmin,
        login,
        logout,
        footerSettings,
        updateFooterSettings,
        resetFooterSettings,
        heroBannerSettings,
        updateHeroBannerSettings,
        updateHeroSlide,
        addHeroSlide,
        deleteHeroSlide,
        updateHeroSidePromo,
        resetHeroBannerSettings,
        policySettings,
        updatePolicySettings,
        updateSinglePolicy,
        resetPolicySettings,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProducts,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        wishlist,
        toggleWishlist,
        isWishlisted,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
        pcBuild,
        setPCComponent,
        removePCComponent,
        clearPCBuild,
        pcBuildTotalPrice,
        pcBuildTotalWattage,
        addFullBuildToCart,
        applyPrebuiltRig,
        activeModal,
        openModal,
        closeModal,
        policyTab,
        setPolicyTab,
        openPolicyModal,
        selectedProduct,
        setSelectedProduct,
        viewProductDetails,
        filters,
        setFilters,
        resetFilters,
        selectCategory,
        orders,
        createOrder,
        lastPlacedOrder,
        findOrder,
        updateOrderStatus,
        deleteOrder,
        coupons,
        addCoupon,
        toggleCouponStatus,
        deleteCoupon,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
