import React, { useState } from 'react';
import {
  X,
  Package,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  DollarSign,
  Boxes,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  Save,
  RefreshCw,
  Copy,
  Layers,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Tag,
  Lock,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product, PCComponentCategory } from '../../types';
import { categoriesData } from '../../data/categories';
import { ProductImageUploader } from '../Common/ProductImageUploader';

const PRESET_HARDWARE_IMAGES = [
  { name: 'Processor / CPU', url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80' },
  { name: 'Graphics Card / GPU', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80' },
  { name: 'Laptop / MacBook', url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80' },
  { name: 'Motherboard', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80' },
  { name: 'RAM Memory', url: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80' },
  { name: 'NVMe SSD Storage', url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Gaming Monitor', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80' },
  { name: 'Gaming Casing', url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Gaming Headset', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Mechanical Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80' },
];

export const MarketPanelModal: React.FC = () => {
  const {
    language,
    t,
    closeModal,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
    showToast,
    openModal,
    logout,
    isMarketAdmin,
  } = useShop();

  // Product to delete state for modal confirmation
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filters and state
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newSpecInput, setNewSpecInput] = useState('');
  const [editSpecInput, setEditSpecInput] = useState('');

  // New product initial state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    nameBn: '',
    brand: 'AMD',
    model: '',
    category: 'processor',
    subcategory: 'processor',
    price: 15000,
    regularPrice: 17000,
    discountPercentage: 12,
    inStock: true,
    stockCount: 10,
    rating: 5.0,
    reviewsCount: 1,
    image: '',
    warranty: '3 Years Official Replacement',
    warrantyBn: '৩ বছর অফিসিয়াল রিপ্লেসমেন্ট ওয়ারেন্টি',
    keySpecs: [
      'Official Jannat Computers Warranty',
      'High Performance Genuine Component',
      'Authentic Brand Authorized Product',
    ],
    keySpecsBn: [
      'জান্নাত কম্পিউটার্স অফিসিয়াল ওয়ারেন্টি',
      'হাই পারফর্মেন্স ১০০% জেনুইন কম্পোনেন্ট',
      'অথরাইজড ডিস্ট্রিবিউটর পণ্য',
    ],
    badge: 'Official Warranty',
    badgeBn: 'অফিসিয়াল ওয়ারেন্টি',
    description: 'Original computer component with official Jannat Computers warranty support across Bangladesh.',
    descriptionBn: 'জান্নাত কম্পিউটার্স অফিশিয়াল ওয়ারেন্টি সাপোর্ট সহ ১০০% আসল কম্পিউটার কম্পোনেন্ট।',
  });

  // Calculate statistics
  const inStockProductsCount = products.filter((p) => p.inStock).length;
  const outOfStockProductsCount = products.filter((p) => !p.inStock).length;
  const totalInventoryValuation = products.reduce((acc, p) => acc + p.price * (p.stockCount || 5), 0);

  // Filtered products
  const filteredProducts = products.filter((product) => {
    const matchCat = productCategoryFilter === 'all' || product.category === productCategoryFilter;
    const matchStock =
      productStockFilter === 'all' ||
      (productStockFilter === 'inStock' && product.inStock) ||
      (productStockFilter === 'outOfStock' && !product.inStock);
    const q = productSearchQuery.toLowerCase();
    const matchQuery =
      !productSearchQuery ||
      product.name.toLowerCase().includes(q) ||
      product.nameBn.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q) ||
      product.model.toLowerCase().includes(q);
    return matchCat && matchStock && matchQuery;
  });

  // Add Spec to New Product
  const handleAddNewProductSpec = () => {
    if (!newSpecInput.trim()) return;
    const currentSpecs = newProduct.keySpecs || [];
    const currentSpecsBn = newProduct.keySpecsBn || [];
    setNewProduct({
      ...newProduct,
      keySpecs: [...currentSpecs, newSpecInput.trim()],
      keySpecsBn: [...currentSpecsBn, newSpecInput.trim()],
    });
    setNewSpecInput('');
  };

  const handleRemoveNewProductSpec = (index: number) => {
    const currentSpecs = [...(newProduct.keySpecs || [])];
    const currentSpecsBn = [...(newProduct.keySpecsBn || [])];
    currentSpecs.splice(index, 1);
    currentSpecsBn.splice(index, 1);
    setNewProduct({
      ...newProduct,
      keySpecs: currentSpecs,
      keySpecsBn: currentSpecsBn,
    });
  };

  // Add Spec to Editing Product
  const handleAddEditProductSpec = () => {
    if (!editSpecInput.trim() || !editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      keySpecs: [...(editingProduct.keySpecs || []), editSpecInput.trim()],
      keySpecsBn: [...(editingProduct.keySpecsBn || []), editSpecInput.trim()],
    });
    setEditSpecInput('');
  };

  const handleRemoveEditProductSpec = (index: number) => {
    if (!editingProduct) return;
    const updatedSpecs = [...(editingProduct.keySpecs || [])];
    const updatedSpecsBn = [...(editingProduct.keySpecsBn || [])];
    updatedSpecs.splice(index, 1);
    updatedSpecsBn.splice(index, 1);
    setEditingProduct({
      ...editingProduct,
      keySpecs: updatedSpecs,
      keySpecsBn: updatedSpecsBn,
    });
  };

  // Create Product handler
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name?.trim() || !newProduct.price) {
      showToast(t('পণ্যের নাম এবং মূল্য আবশ্যক', 'Product name and price are required'), 'error');
      return;
    }

    const regular = Number(newProduct.regularPrice || newProduct.price);
    const offer = Number(newProduct.price);
    const calculatedDiscount = regular > offer ? Math.round(((regular - offer) / regular) * 100) : 0;

    const created: Product = {
      id: `jc-prod-${Date.now()}`,
      name: newProduct.name.trim(),
      nameBn: newProduct.nameBn?.trim() || newProduct.name.trim(),
      brand: newProduct.brand?.trim() || 'Jannat Tech',
      model: newProduct.model?.trim() || 'Standard Edition',
      category: newProduct.category || 'processor',
      subcategory: newProduct.subcategory || newProduct.category || 'processor',
      pcCategory: (newProduct.category === 'processor' ? 'cpu' : newProduct.category) as PCComponentCategory,
      price: offer,
      regularPrice: regular,
      discountPercentage: newProduct.discountPercentage ?? calculatedDiscount,
      inStock: newProduct.inStock ?? true,
      stockCount: Number(newProduct.stockCount || 10),
      rating: 5.0,
      reviewsCount: 1,
      image: newProduct.image?.trim() || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80',
      gallery: newProduct.gallery && newProduct.gallery.length > 0 ? newProduct.gallery : [],
      warranty: newProduct.warranty?.trim() || '3 Years Official',
      warrantyBn: newProduct.warrantyBn?.trim() || '৩ বছর অফিসিয়াল ওয়ারেন্টি',
      badge: newProduct.badge || 'Official Warranty',
      badgeBn: newProduct.badgeBn || 'অফিসিয়াল ওয়ারেন্টি',
      keySpecs:
        newProduct.keySpecs && newProduct.keySpecs.length > 0
          ? newProduct.keySpecs
          : ['Official Jannat Computers Warranty', '100% Original Brand Component'],
      keySpecsBn:
        newProduct.keySpecsBn && newProduct.keySpecsBn.length > 0
          ? newProduct.keySpecsBn
          : ['অফিসিয়াল জান্নাত কম্পিউটার্স ওয়ারেন্টি', '১০০% অরিজিনাল কম্পোনেন্ট'],
      specsTable: [
        {
          category: 'Basic Specs',
          categoryBn: 'প্রাথমিক বিবরণ',
          items: [
            { label: 'Brand', labelBn: 'ব্র্যান্ড', value: newProduct.brand || 'Original' },
            { label: 'Model', labelBn: 'মডেল', value: newProduct.model || 'Standard' },
            { label: 'Warranty', labelBn: 'ওয়ারেন্টি', value: newProduct.warranty || '3 Years' },
          ],
        },
      ],
      description: newProduct.description?.trim() || 'Official Jannat Computers genuine IT product with replacement warranty.',
      descriptionBn: newProduct.descriptionBn?.trim() || 'জান্নাত কম্পিউটার্স অফিসিয়াল ওয়ারেন্টি সুবিধা সহ জেনুইন আইটি পণ্য।',
    };

    addProduct(created);
    setIsAddingProduct(false);
    showToast(
      language === 'bn'
        ? `"${created.nameBn}" পণ্যটি সফলভাবে যুক্ত হয়েছে!`
        : `"${created.name}" added to catalog!`
    );

    // Reset Form
    setNewProduct({
      name: '',
      nameBn: '',
      brand: 'AMD',
      model: '',
      category: 'processor',
      subcategory: 'processor',
      price: 15000,
      regularPrice: 17000,
      discountPercentage: 12,
      inStock: true,
      stockCount: 10,
      image: '',
      gallery: [],
      warranty: '3 Years Official Replacement',
      warrantyBn: '৩ বছর অফিসিয়াল রিপ্লেসমেন্ট ওয়ারেন্টি',
      keySpecs: [
        'Official Jannat Computers Warranty',
        'High Performance Genuine Component',
      ],
      keySpecsBn: [
        'জান্নাত কম্পিউটার্স অফিসিয়াল ওয়ারেন্টি',
        'হাই পারফর্মেন্স ১০০% জেনুইন কম্পোনেন্ট',
      ],
    });
  };

  // Save Edited Product handler
  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const regular = Number(editingProduct.regularPrice || editingProduct.price);
    const offer = Number(editingProduct.price);
    const calculatedDiscount = regular > offer ? Math.round(((regular - offer) / regular) * 100) : 0;

    updateProduct(editingProduct.id, {
      ...editingProduct,
      price: offer,
      regularPrice: regular,
      discountPercentage: editingProduct.discountPercentage ?? calculatedDiscount,
    });

    showToast(
      language === 'bn'
        ? `"${editingProduct.nameBn || editingProduct.name}" সফলভাবে আপডেট হয়েছে!`
        : `"${editingProduct.name}" successfully updated!`
    );
    setEditingProduct(null);
  };

  // Duplicate / Clone Product handler
  const handleDuplicateProduct = (p: Product) => {
    const clone: Product = {
      ...p,
      id: `jc-prod-${Date.now()}`,
      name: `${p.name} (Copy)`,
      nameBn: `${p.nameBn} (কপি)`,
    };
    addProduct(clone);
    showToast(
      language === 'bn'
        ? `"${p.nameBn}" এর একটি নতুন কপি তৈরি হয়েছে`
        : `Cloned "${p.name}" successfully`
    );
  };

  if (!isMarketAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
        <div className="bg-slate-900 text-white w-full max-w-md rounded-2xl shadow-2xl border border-rose-600/40 overflow-hidden my-auto p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-rose-400">
            {t('মার্কেট প্যানেল পারমিশন প্রয়োজন', 'Market Access Required')}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t(
              'এই প্যানেলটি শুধুমাত্র অনুমোদিত মার্কেট ও ইনভেন্টরি অ্যাকাউন্টদের জন্য সংরক্ষিত। মার্কেট পাসওয়ার্ড দিয়ে লগইন করে প্রবেশ করুন।',
              'This panel is restricted to Market & Inventory Managers. Please log in with your Market account credentials to continue.'
            )}
          </p>
          <div className="pt-2 flex gap-3">
            <button
              onClick={closeModal}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              {t('বন্ধ করুন', 'Close')}
            </button>
            <button
              onClick={() => {
                closeModal();
                openModal('marketLogin');
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-black transition cursor-pointer shadow-lg shadow-rose-600/20"
            >
              {t('মার্কেট লগইন', 'Market Login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 text-slate-100 w-full max-w-6xl rounded-2xl shadow-2xl border border-rose-900/60 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Market Panel Header */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-950 to-slate-950 px-4 sm:px-6 py-4 border-b border-rose-900/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/50 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-white tracking-tight">
                  {t('মার্কেট প্যানেল (প্রোডাক্ট ক্যাটালগ ও ইনভেন্টরি)', 'Market Panel (Product Catalog & Inventory)')}
                </h2>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  MERCHANT HUB
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {t('সার্ভার ডিবি সেভ্ড', 'SERVER DB SAVED')}
                </span>
              </div>
              <p className="text-xs text-rose-200/70">
                {t('এখানে ওয়েবসাইটের যাবতীয় পণ্য যোগ, এডিট, ডিলিট, স্টক ও মূল্য পরিবর্তন করুন (সবকিছু সার্ভারে স্থায়ীভাবে সংরক্ষিত হয়)', 'Add, edit, delete products, manage stock & live pricing (permanently saved to server)')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                closeModal();
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              {t('লগআউট', 'Log Out')}
            </button>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Market Panel Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">{t('মোট পণ্য সংখ্যা', 'Total Products')}</div>
                <div className="text-base font-extrabold text-white">{products.length} টি</div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">{t('স্টকে সক্রিয় আছে', 'In Stock')}</div>
                <div className="text-base font-extrabold text-emerald-400">{inStockProductsCount} টি</div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">{t('স্টক আউট পণ্য', 'Out of Stock')}</div>
                <div className="text-base font-extrabold text-amber-400">{outOfStockProductsCount} টি</div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">{t('ইনভেন্টরি মূল্যমান', 'Inventory Value')}</div>
                <div className="text-sm font-extrabold text-purple-300 truncate">
                  ৳{totalInventoryValuation.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder={t('পণ্যের নাম, মডেল বা ব্র্যান্ড খুঁজুন...', 'Search product name, model or brand...')}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg pl-9 pr-3 py-2 outline-hidden focus:border-rose-500"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-2 outline-hidden cursor-pointer"
              >
                <option value="all">{t('সকল ক্যাটাগরি', 'All Categories')}</option>
                {categoriesData.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'bn' ? cat.nameBn : cat.name}
                  </option>
                ))}
              </select>

              <select
                value={productStockFilter}
                onChange={(e) => setProductStockFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-2 outline-hidden cursor-pointer"
              >
                <option value="all">{t('সকল স্টক স্ট্যাটাস', 'All Stock Status')}</option>
                <option value="inStock">{t('স্টকে আছে শুধুমাত্র', 'In Stock Only')}</option>
                <option value="outOfStock">{t('স্টক আউট শুধুমাত্র', 'Out of Stock Only')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (
                    confirm(
                      language === 'bn'
                        ? 'আপনি কি ডিফল্ট ২৫টি পণ্য ক্যাটালগে পুনরায় রিস্টোর করতে চান?'
                        : 'Restore default 24 IT products catalog?'
                    )
                  ) {
                    resetProducts();
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 transition cursor-pointer"
                title={t('ডিফল্ট পণ্য ক্যাটালগ রিস্টোর করুন', 'Restore Default Catalog')}
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">{t('ডিফল্ট রিস্টোর', 'Restore Default')}</span>
              </button>

              <button
                onClick={() => {
                  setIsAddingProduct(true);
                  setEditingProduct(null);
                }}
                className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('নতুন পণ্য যোগ করুন', 'Add New Product')}</span>
              </button>
            </div>
          </div>

          {/* Form 1: ADD NEW PRODUCT */}
          {isAddingProduct && (
            <form
              onSubmit={handleCreateProduct}
              className="bg-slate-800 border-2 border-rose-500/70 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-3 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black">
                    +
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      {t('নতুন কম্পিউটার পণ্য যোগ করার ফর্ম', 'Add New Product to Store')}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {t('তথ্য পূরণ করে সেভ করলেই ওয়েবসাইটে লাইভ প্রদর্শিত হবে', 'Product will be immediately available in store & search')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Hardware Image Presets */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                <div className="text-[11px] font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t('দ্রুত ছবি সিলেক্ট করুন (Hardware Presets):', 'Quick Hardware Image Presets:')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_HARDWARE_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, image: preset.url })}
                      className={`text-[10px] px-2 py-1 rounded-md border transition cursor-pointer ${
                        newProduct.image === preset.url
                          ? 'bg-rose-600 text-white border-rose-500 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('পণ্যের পূর্ণ নাম (English) *', 'Product Full Name (English) *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. AMD Ryzen 7 7800X3D Gaming Processor"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-hidden focus:border-rose-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('পণ্যের বাংলা নাম (বাংলা টাইটেল)', 'Product Bengali Name')}
                  </label>
                  <input
                    type="text"
                    value={newProduct.nameBn}
                    onChange={(e) => setNewProduct({ ...newProduct, nameBn: e.target.value })}
                    placeholder="e.g. এএমডি রাইজেন ৭ ৭৮০০এক্স৩ডি গেমিং প্রসেসর"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('ব্র্যান্ড (Brand) *', 'Brand *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="e.g. AMD, Intel, ASUS, MSI, HP, Dell"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('মডেল (Model)', 'Model')}
                  </label>
                  <input
                    type="text"
                    value={newProduct.model}
                    onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                    placeholder="e.g. 7800X3D / RTX 4070 / B650M"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('ক্যাটাগরি (Category) *', 'Category *')}
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        category: e.target.value,
                        subcategory: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden cursor-pointer"
                  >
                    {categoriesData.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.nameBn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('বিক্রয় মূল্য Offer Price (৳) *', 'Selling Price (BDT) *')}
                  </label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-rose-400 font-black text-sm outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('রেগুলার / MRP প্রাইস (৳)', 'Regular / MRP Price')}
                  </label>
                  <input
                    type="number"
                    value={newProduct.regularPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, regularPrice: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('স্টক পরিমাণ (Quantity)', 'Stock Count')}
                  </label>
                  <input
                    type="number"
                    value={newProduct.stockCount}
                    onChange={(e) => setNewProduct({ ...newProduct, stockCount: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('স্টক অবস্থা (Stock Status)', 'Stock Status')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewProduct({ ...newProduct, inStock: !newProduct.inStock })}
                    className={`w-full p-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      newProduct.inStock
                        ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-600/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {newProduct.inStock ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>In Stock (স্টকে আছে)</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Out of Stock (স্টক শেষ)</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('ওয়ারেন্টি পলিসি (Warranty)', 'Warranty')}
                  </label>
                  <input
                    type="text"
                    value={newProduct.warranty}
                    onChange={(e) => setNewProduct({ ...newProduct, warranty: e.target.value })}
                    placeholder="e.g. 3 Years Official Replacement"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ProductImageUploader
                    currentImage={newProduct.image || ''}
                    gallery={newProduct.gallery || []}
                    onImagesChange={(mainImg, galleryImgs) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        image: mainImg,
                        gallery: galleryImgs,
                      }))
                    }
                    category={newProduct.category}
                    label={t('প্রোডাক্টের একাধিক ছবি আপলোড করুন (ছবি ফাইল / ড্র্যাগ ও ড্রপ)', 'Upload Multiple Product Images (File / Drag & Drop)')}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('ব্যাজ / ট্যাগ (Badge / Tag)', 'Badge / Promotion Tag')}
                  </label>
                  <select
                    value={newProduct.badge || 'Official Warranty'}
                    onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value, badgeBn: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden cursor-pointer"
                  >
                    <option value="Official Warranty">Official Warranty (অফিসিয়াল ওয়ারেন্টি)</option>
                    <option value="Hot Deal">Hot Deal (হট ডিল)</option>
                    <option value="Best Seller">Best Seller (বেস্ট সেলার)</option>
                    <option value="New Arrival">New Arrival (নতুন কালেকশন)</option>
                    <option value="Gaming Edition">Gaming Edition (গেমিং স্পেশাল)</option>
                    <option value="Special Offer">Special Offer (স্পেশাল অফার)</option>
                  </select>
                </div>
              </div>

              {/* Key Specs Builder */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  {t('মূল স্পেসিফিকেশন বুলেট পয়েন্ট (Key Specs Bullets):', 'Key Feature Bullets:')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecInput}
                    onChange={(e) => setNewSpecInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewProductSpec();
                      }
                    }}
                    placeholder="e.g. 8 Cores 16 Threads, 5.0GHz Boost, 104MB Cache"
                    className="flex-1 bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-white outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewProductSpec}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-600 transition cursor-pointer"
                  >
                    {t('+ বুলেট যোগ করুন', '+ Add Bullet')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {newProduct.keySpecs?.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="bg-slate-800 border border-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5"
                    >
                      <span>• {spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewProductSpec(sIdx)}
                        className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs rounded-lg cursor-pointer transition"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-rose-900/40 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('পণ্য সেভ করুন (Save Product)', 'Save Product to Catalog')}</span>
                </button>
              </div>
            </form>
          )}

          {/* Form 2: EDIT PRODUCT */}
          {editingProduct && (
            <form
              onSubmit={handleSaveEditedProduct}
              className="bg-slate-800 border-2 border-amber-500/80 rounded-2xl p-5 space-y-4 animate-in zoom-in-95 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <Edit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      {t('পণ্যের যাবতীয় তথ্য এডিট ও পরিবর্তন', 'Edit Product Details')}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      ID: <span className="font-mono text-amber-400">{editingProduct.id}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Multi-Image Gallery & Uploader for Edit Mode */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700">
                <ProductImageUploader
                  currentImage={editingProduct.image}
                  gallery={editingProduct.gallery || []}
                  onImagesChange={(mainImg, galleryImgs) =>
                    setEditingProduct((prev) =>
                      prev
                        ? {
                            ...prev,
                            image: mainImg,
                            gallery: galleryImgs,
                          }
                        : null
                    )
                  }
                  category={editingProduct.category}
                  label={t(
                    'পণ্যের ছবি ও গ্যালারি পরিবর্তন করুন (একাধিক ছবি সাপোর্ট)',
                    'Product Images & Multi-Photo Gallery'
                  )}
                />
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('পণ্যের নাম (English Title) *', 'Product Name (English) *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('পণ্যের বাংলা নাম (Bangla Title)', 'Bengali Name')}
                  </label>
                  <input
                    type="text"
                    value={editingProduct.nameBn || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameBn: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('ব্র্যান্ড (Brand)', 'Brand')}
                  </label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('মডেল (Model)', 'Model')}
                  </label>
                  <input
                    type="text"
                    value={editingProduct.model || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('ক্যাটাগরি (Category)', 'Category')}
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden cursor-pointer"
                  >
                    {categoriesData.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.nameBn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('বিক্রয় মূল্য Offer Price (৳) *', 'Selling Price (৳) *')}
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-black text-sm outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('রেগুলার মূল্য (৳)', 'Regular Price (৳)')}
                  </label>
                  <input
                    type="number"
                    value={editingProduct.regularPrice || editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, regularPrice: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('স্টক পরিমাণ', 'Stock Quantity')}
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stockCount ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('স্টক স্ট্যাটাস', 'Stock Status')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, inStock: !editingProduct.inStock })}
                    className={`w-full p-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                      editingProduct.inStock
                        ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-600/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {editingProduct.inStock ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>In Stock (স্টকে আছে)</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Out of Stock (স্টক শেষ)</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('ওয়ারেন্টি', 'Warranty')}
                  </label>
                  <input
                    type="text"
                    value={editingProduct.warranty || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, warranty: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ProductImageUploader
                    currentImage={editingProduct.image || ''}
                    gallery={editingProduct.gallery || []}
                    onImagesChange={(mainImg, galleryImgs) =>
                      setEditingProduct({ ...editingProduct, image: mainImg, gallery: galleryImgs })
                    }
                    onImageChange={(imgUrl) => setEditingProduct({ ...editingProduct, image: imgUrl })}
                    category={editingProduct.category}
                    label={t('প্রোডাক্টের ছবি পরিবর্তন / একাধিক ছবি আপলোড করুন', 'Change / Upload Multiple Product Images')}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {t('ব্যাজ / ট্যাগ', 'Badge')}
                  </label>
                  <select
                    value={editingProduct.badge || 'Official Warranty'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden cursor-pointer"
                  >
                    <option value="Official Warranty">Official Warranty (অফিসিয়াল ওয়ারেন্টি)</option>
                    <option value="Hot Deal">Hot Deal (হট ডিল)</option>
                    <option value="Best Seller">Best Seller (বেস্ট সেলার)</option>
                    <option value="New Arrival">New Arrival (নতুন কালেকশন)</option>
                    <option value="Gaming Edition">Gaming Edition (গেমিং স্পেশাল)</option>
                    <option value="Special Offer">Special Offer (স্পেশাল অফার)</option>
                  </select>
                </div>
              </div>

              {/* Specs Editor */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700 space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  {t('স্পেসিফিকেশন বুলেটসমূহ:', 'Feature Bullets:')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editSpecInput}
                    onChange={(e) => setEditSpecInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEditProductSpec();
                      }
                    }}
                    placeholder="e.g. 5000MB/s Read Speed, Heatsink Included"
                    className="flex-1 bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-white outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditProductSpec}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    {t('+ যোগ করুন', '+ Add')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {editingProduct.keySpecs?.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="bg-slate-800 border border-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5"
                    >
                      <span>• {spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEditProductSpec(sIdx)}
                        className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs rounded-lg cursor-pointer transition"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-lg shadow-lg shadow-amber-900/30 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('আপডেট সংরক্ষণ করুন (Save Changes)', 'Save Changes')}</span>
                </button>
              </div>
            </form>
          )}

          {/* PRODUCT LIST TABLE */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                  {t('লাইভ প্রোডাক্ট ক্যাটালগ তালিকা', 'Live Product Catalog')}
                </span>
                <span className="bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {filteredProducts.length} টি পাওয়া গেছে
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {t('সরাসরি স্টক বা প্রাইস পরিবর্তন করুন', 'Quick toggle stock or modify pricing')}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">পণ্য / ছবি</th>
                    <th className="py-3 px-3">ক্যাটাগরি ও ব্র্যান্ড</th>
                    <th className="py-3 px-3 text-right">বিক্রয় মূল্য</th>
                    <th className="py-3 px-3 text-center">স্টক অবস্থা</th>
                    <th className="py-3 px-3 text-center">ওয়ারেন্টি</th>
                    <th className="py-3 px-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p>{t('কোনো পণ্য পাওয়া যায়নি', 'No products found')}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/60 transition group">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-11 h-11 object-contain bg-white rounded-lg p-1 border border-slate-700 shrink-0"
                            />
                            <div className="max-w-[240px] sm:max-w-xs">
                              <div className="font-bold text-white line-clamp-1 group-hover:text-rose-400 transition-colors">
                                {language === 'bn' ? p.nameBn || p.name : p.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                ID: <span className="font-mono text-slate-500">{p.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="inline-block bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold text-slate-300">
                              {p.category}
                            </span>
                            <div className="text-[11px] font-semibold text-slate-400">{p.brand}</div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="font-extrabold text-white text-sm text-rose-400">
                            ৳{p.price.toLocaleString('en-IN')}
                          </div>
                          {p.regularPrice && p.regularPrice > p.price && (
                            <div className="text-[10px] text-slate-500 line-through">
                              ৳{p.regularPrice.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => updateProduct(p.id, { inStock: !p.inStock })}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition cursor-pointer border ${
                              p.inStock
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/60'
                                : 'bg-rose-950/60 text-rose-300 border-rose-600/40 hover:bg-rose-900/60'
                            }`}
                            title="Click to toggle Stock Status"
                          >
                            {p.inStock ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>স্টকে আছে</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 text-rose-400" />
                                <span>স্টক শেষ</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {language === 'bn' ? p.warrantyBn || p.warranty : p.warranty}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Clone Button */}
                            <button
                              onClick={() => handleDuplicateProduct(p)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
                              title={t('পণ্য কপি/ক্লোন করুন', 'Duplicate/Clone Product')}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Full Edit Button */}
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsAddingProduct(false);
                              }}
                              className="p-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-slate-950 transition cursor-pointer border border-amber-500/30"
                              title={t('সম্পূর্ণ এডিট করুন', 'Edit Product Details')}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProductToDelete(p);
                              }}
                              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition cursor-pointer border border-rose-500/30"
                              title={t('পণ্য ডিলিট করুন', 'Delete Product')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal (iFrame safe without window.confirm blockage) */}
      {productToDelete && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/60 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                {t('পণ্য ডিলিট কনফার্মেশন', 'Confirm Product Deletion')}
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                {language === 'bn' ? (
                  <>
                    আপনি কি নিশ্চিত <strong className="text-rose-400 font-bold">"{productToDelete.nameBn || productToDelete.name}"</strong> পণ্যটি স্থায়ীভাবে মুছে ফেলতে চান?
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete <strong className="text-rose-400 font-bold">"{productToDelete.name}"</strong> from catalog?
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer border border-slate-700"
              >
                {t('বাতিল (Cancel)', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs transition cursor-pointer shadow-lg shadow-rose-950/60 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('হ্যাঁ, ডিলিট করুন', 'Yes, Delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
