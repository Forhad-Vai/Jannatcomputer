import React, { useState } from 'react';
import {
  X,
  LayoutDashboard,
  ShoppingCart,
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Search,
  Check,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Boxes,
  RotateCcw,
  Sparkles,
  Phone,
  MapPin,
  ExternalLink,
  Copy,
  SlidersHorizontal,
  Package,
  Percent,
  Layers,
  ChevronRight,
  ShieldAlert,
  Printer,
  FileText,
  User,
  Mail,
  CreditCard,
  Store,
  Globe,
  QrCode,
  Save,
  Upload,
  RotateCcw as ResetIcon,
  FileCheck2,
  Lock,
  KeyRound,
  Shield,
  Loader2,
  Database,
  HardDrive,
  Download,
  RefreshCw,
  Code,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order, Coupon, FooterSettings } from '../../types';
import { PaymentQRCode } from '../Common/PaymentQRCode';
import { PolicyEditorTab } from './PolicyEditorTab';
import { HeroBannerEditorTab } from './HeroBannerEditorTab';
import { changePasswordOnServer, getSupabaseCredentials, saveSupabaseCredentials } from '../../utils/authApi';

// Helper to read QR Code image file losslessly (preserving 100% crisp pixels for scanners)
const readQrImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }
    // If under 5MB, read directly as data URL to preserve 100% exact pixels and scanner compatibility
    if (file.size < 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }
    // For very large images (>5MB), process with lossless PNG canvas
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false; // keep crisp edges for QR code modules
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(readerEvent.target?.result as string);
        }
      };
      img.onerror = () => resolve(readerEvent.target?.result as string);
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// Helper to compress and convert general banner image file to Base64 data URL
const compressAndReadFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
        } else {
          resolve(readerEvent.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(readerEvent.target?.result as string);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const AdminDashboardModal: React.FC = () => {
  const {
    language,
    t,
    closeModal,
    openModal,
    orders,
    updateOrderStatus,
    deleteOrder,
    coupons,
    addCoupon,
    toggleCouponStatus,
    deleteCoupon,
    showToast,
    logout,
    products,
    footerSettings,
    updateFooterSettings,
    resetFooterSettings,
    isServerSynced,
    lastServerSyncTime,
    syncAllToServer,
    downloadBackup,
    restoreFromBackup,
    isAdmin,
  } = useShop();

  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [backupRestoreMessage, setBackupRestoreMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleManualSyncClick = async () => {
    setIsManualSyncing(true);
    await syncAllToServer();
    setIsManualSyncing(false);
  };

  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        setIsRestoringBackup(true);
        const parsed = JSON.parse(ev.target?.result as string);
        const dataToRestore = parsed.database || parsed;
        const ok = await restoreFromBackup(dataToRestore);
        if (ok) {
          setBackupRestoreMessage({
            text: t('ব্যাকআপ ফাইল থেকে সফলভাবে সকল প্রোডাক্ট ও সেটিংস রিস্টোর হয়েছে!', 'All products and settings restored successfully from backup!'),
            type: 'success',
          });
        } else {
          setBackupRestoreMessage({
            text: t('ব্যাকআপ ফাইল ফরম্যাট সঠিক নয়।', 'Invalid backup file format.'),
            type: 'error',
          });
        }
      } catch (err: any) {
        setBackupRestoreMessage({
          text: t('ফাইল রিড করতে ব্যর্থ: ', 'Failed to read file: ') + err.message,
          type: 'error',
        });
      } finally {
        setIsRestoringBackup(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('অনুগ্রহ করে ব্রাউজারের পপ-আপ অনুমোদন করুন (Please allow popups to print)');
      return;
    }

    const itemsRows = order.items
      .map(
        (item, index) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; text-align: center; color: #64748b; font-size: 12px;">${index + 1}</td>
          <td style="padding: 10px;">
            <div style="font-weight: 700; color: #0f172a; font-size: 13px;">${item.product.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">মডেল / ক্যাটাগরি: ${item.product.category?.toUpperCase() || 'HARDWARE'}</div>
          </td>
          <td style="padding: 10px; text-align: center; font-weight: 700; color: #0f172a; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 10px; text-align: right; color: #334155; font-size: 13px;">৳${item.product.price.toLocaleString('en-IN')}</td>
          <td style="padding: 10px; text-align: right; font-weight: 800; color: #e11d48; font-size: 13px;">৳${(item.product.price * item.quantity).toLocaleString('en-IN')}</td>
        </tr>
      `
      )
      .join('');

    const formatPaymentLabel = (method: string) => {
      switch (method) {
        case 'bkash': return 'বিকাশ (bKash)';
        case 'nagad': return 'নগদ (Nagad)';
        case 'rocket': return 'রকেট (DBBL Rocket)';
        case 'upay': return 'উপায় (UCB Upay)';
        case 'card': return 'কার্ড / ব্যাংকিং (Cards)';
        case 'emi': return '০% কিস্তি (EMI)';
        case 'cod': return 'ক্যাশ অন ডেলিভারি (COD)';
        default: return (method || '').toUpperCase();
      }
    };

    const invoiceHtml = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${order.id} - Jannat Computers</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hind Siliguri", sans-serif;
          }
          body {
            margin: 0;
            padding: 24px;
            color: #0f172a;
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e11d48;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand-title {
            font-size: 24px;
            font-weight: 900;
            color: #e11d48;
            margin: 0;
          }
          .brand-sub {
            font-size: 12px;
            color: #475569;
            margin-top: 4px;
            line-height: 1.4;
          }
          .invoice-badge {
            text-align: right;
          }
          .invoice-title {
            font-size: 22px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: 1px;
            margin: 0;
          }
          .invoice-id {
            display: inline-block;
            background: #ffe4e6;
            color: #e11d48;
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 800;
            font-size: 14px;
            margin-top: 6px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
          }
          .box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px;
          }
          .box-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            color: #e11d48;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 4px;
          }
          .info-row {
            display: flex;
            font-size: 12px;
            margin-bottom: 5px;
            line-height: 1.4;
          }
          .info-label {
            width: 90px;
            color: #64748b;
            font-weight: 600;
            flex-shrink: 0;
          }
          .info-val {
            color: #0f172a;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #0f172a;
            color: #fff;
            text-align: left;
            padding: 10px;
            font-size: 12px;
            font-weight: 700;
          }
          .summary-table {
            width: 280px;
            margin-left: auto;
            margin-bottom: 30px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            padding: 6px 0;
            color: #475569;
          }
          .summary-total {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 900;
            padding: 10px 0;
            border-top: 2px solid #0f172a;
            color: #e11d48;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #64748b;
          }
          .print-bar {
            background: #0f172a;
            color: #fff;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            margin: -24px -24px 20px -24px;
          }
          @media print {
            .print-bar {
              display: none !important;
            }
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-bar">
          <div style="font-weight: 700; font-size: 14px;">📄 Jannat Computers - Official Invoice (${order.id})</div>
          <div>
            <button onclick="window.print()" style="background: #e11d48; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px; margin-right: 8px;">
              🖨️ প্রিন্ট করুন (Print / Save as PDF)
            </button>
            <button onclick="window.close()" style="background: #334155; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">
              ✕ বন্ধ করুন
            </button>
          </div>
        </div>

        <div class="header">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${footerSettings.logoUrl || 'https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png'}" alt="Logo" style="height: 52px; width: auto; object-fit: contain; filter: drop-shadow(0 3px 6px rgba(225,29,72,0.25));" />
            <div>
              <h1 class="brand-title">${footerSettings.storeName}</h1>
              <div class="brand-sub">
                ${footerSettings.addressBn || footerSettings.address}<br>
                হটলাইন: <strong>${footerSettings.phone1} ${footerSettings.phone2 ? ', ' + footerSettings.phone2 : ''}</strong> | ইমেইল: ${footerSettings.email}<br>
                ট্রেড লাইসেন্স: ${footerSettings.tradeLicense} | মেম্বারশিপ: ${footerSettings.bcsMembership}
              </div>
            </div>
          </div>
          <div class="invoice-badge">
            <div class="invoice-title">INVOICE / বিল</div>
            <div class="invoice-id"># ${order.id}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">তারিখ: ${order.createdAt || new Date().toLocaleDateString('en-GB')}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="box">
            <div class="box-title">গ্রাহকের সম্পূর্ণ বিবরণ (Customer Details)</div>
            <div class="info-row">
              <span class="info-label">গ্রাহকের নাম:</span>
              <span class="info-val">${order.customerName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">মোবাইল নম্বর:</span>
              <span class="info-val" style="color: #e11d48;">${order.customerPhone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ইমেইল:</span>
              <span class="info-val">${order.customerEmail || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ডেলিভারি ঠিকানা:</span>
              <span class="info-val">${order.address}, ${order.thana}, ${order.district}</span>
            </div>
          </div>

          <div class="box">
            <div class="box-title">অর্ডার ও ডেলিভারি তথ্য (Order & Dispatch Info)</div>
            <div class="info-row">
              <span class="info-label">অর্ডার স্ট্যাটাস:</span>
              <span class="info-val" style="text-transform: uppercase; color: #16a34a;">${order.status.replace('_', ' ')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">পেমেন্ট মাধ্যম:</span>
              <span class="info-val">${formatPaymentLabel(order.paymentMethod)} ${order.transactionId ? `(TrxID: ${order.transactionId})` : ''}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ডেলিভারি ধরন:</span>
              <span class="info-val">${order.deliveryType === 'home' ? 'হোম ডেলিভারি (Courier Express)' : 'শোরুম পিকআপ'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">জেলা:</span>
              <span class="info-val">${order.district} (থানা: ${order.thana})</span>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>পণ্যের নাম ও বিবরণ (Product Description)</th>
              <th style="width: 70px; text-align: center;">পরিমাণ</th>
              <th style="width: 110px; text-align: right;">একক মূল্য</th>
              <th style="width: 120px; text-align: right;">মোট মূল্য</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="summary-table">
          <div class="summary-row">
            <span>সাবটোটাল (Subtotal):</span>
            <span>৳${order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div class="summary-row">
            <span>ডেলিভারি চার্জ (Shipping):</span>
            <span>৳${order.shippingFee}</span>
          </div>
          ${
            order.discount > 0
              ? `
          <div class="summary-row" style="color: #16a34a; font-weight: 700;">
            <span>ডিসকাউন্ট (Coupon Discount):</span>
            <span>- ৳${order.discount.toLocaleString('en-IN')}</span>
          </div>
          `
              : ''
          }
          <div class="summary-total">
            <span>সর্বমোট প্রদেয় (Total):</span>
            <span>৳${order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px;">
          <div style="text-align: center; width: 180px;">
            <div style="border-top: 1px dashed #64748b; padding-top: 6px; font-size: 11px; font-weight: 600; color: #475569;">গ্রাহকের স্বাক্ষর</div>
          </div>
          <div style="text-align: center; width: 180px;">
            <div style="border-top: 1px dashed #64748b; padding-top: 6px; font-size: 11px; font-weight: 600; color: #475569;">অনুমোদিত স্বাক্ষর (জান্নাত কম্পিউটার্স)</div>
          </div>
        </div>

        <div class="footer">
          <div>* বিক্রিত পণ্য ৭ দিনের মধ্যে প্রস্তুতকারকের শর্তসাপেক্ষে রিপ্লেসমেন্ট ওয়ারেন্টি প্রযোজ্য।</div>
          <div>ধন্যবাদ জান্নাত কম্পিউটার্স-এর সাথে থাকার জন্য!</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'payment' | 'hero' | 'coupons' | 'policies' | 'footer' | 'security'>('orders');
  const [footerFormData, setFooterFormData] = useState<FooterSettings>(footerSettings);
  const [footerSubTab, setFooterSubTab] = useState<'general' | 'contact' | 'social' | 'payment'>('general');

  // Security & Password Change State
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passChangeSuccess, setPassChangeSuccess] = useState('');
  const [passChangeError, setPassChangeError] = useState('');

  // Supabase Database Connection State
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseCredentials().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseCredentials().key);
  const [supabaseSavedSuccess, setSupabaseSavedSuccess] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const supabaseSqlScript = `-- =========================================================================
-- JANNAT COMPUTERS: COMPLETE SUPABASE DATABASE & AUTHENTICATION SCHEMA
-- Run this in Supabase -> SQL Editor -> New Query -> Run
-- =========================================================================

-- ১. প্রয়োজনীয় এক্সটেনশন সক্রিয় করা
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ২. পুরোনো টেবিল ক্লিন করা (Clean reset)
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- ৩. [এডমিন ও মার্কেট লগইন টেবিল]
CREATE TABLE public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'admin',
  password_plain TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['all'],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- এডমিন ও মার্কেট ডিফল্ট ইউজার ইনসার্ট
INSERT INTO public.admin_users (username, full_name, phone, role, password_plain, permissions)
VALUES 
  (
    'admin', 
    'জান্নাত সুপার এডমিন', 
    '01717220224', 
    'admin', 
    'admin123', 
    ARRAY['all', 'orders', 'coupons', 'footer', 'reports', 'settings', 'market']
  ),
  (
    'market', 
    'জান্নাত ইনভেন্টরি ও মার্কেট এডমিন', 
    '01700000000', 
    'market', 
    'market123', 
    ARRAY['products', 'stock', 'categories', 'discounts']
  );

-- ৪. [কাস্টমার ইউজার অ্যাকাউন্ট ও লগইন টেবিল]
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  password_hash TEXT NOT NULL,
  password_plain TEXT,
  role TEXT DEFAULT 'customer',
  address TEXT DEFAULT '',
  district TEXT DEFAULT '',
  thana TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৫. [প্রোডাক্টস ও ইনভেন্টরি টেবিল]
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT DEFAULT '',
  brand TEXT DEFAULT '',
  model TEXT DEFAULT '',
  price NUMERIC NOT NULL,
  regular_price NUMERIC NOT NULL,
  discount_percentage NUMERIC DEFAULT 0,
  in_stock BOOLEAN DEFAULT TRUE,
  stock_count INTEGER DEFAULT 10,
  image TEXT NOT NULL,
  gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  is_hot BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_deal BOOLEAN DEFAULT FALSE,
  deal_ends_at TIMESTAMPTZ,
  badge TEXT DEFAULT '',
  badge_bn TEXT DEFAULT '',
  key_specs TEXT[] DEFAULT ARRAY[]::TEXT[],
  key_specs_bn TEXT[] DEFAULT ARRAY[]::TEXT[],
  specs_table JSONB DEFAULT '[]'::JSONB,
  warranty TEXT DEFAULT '',
  warranty_bn TEXT DEFAULT '',
  pc_category TEXT DEFAULT '',
  wattage INTEGER DEFAULT 0,
  socket TEXT DEFAULT '',
  memory_type TEXT DEFAULT '',
  form_factor TEXT DEFAULT '',
  description TEXT DEFAULT '',
  description_bn TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৬. [কাস্টমার অর্ডার ও ট্র্যাকিং টেবিল]
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  address TEXT NOT NULL,
  district TEXT DEFAULT '',
  thana TEXT DEFAULT '',
  delivery_type TEXT DEFAULT 'home',
  pickup_branch_id TEXT DEFAULT '',
  payment_method TEXT NOT NULL,
  transaction_id TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  timeline JSONB NOT NULL DEFAULT '[]'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৭. [কুপন ও ডিসকাউন্ট ভাউচার টেবিল]
CREATE TABLE public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
  discount_amount NUMERIC NOT NULL,
  min_spend NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT DEFAULT '',
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ডিফল্ট ডিসকাউন্ট কুপন ইনসার্ট
INSERT INTO public.coupons (code, discount_type, discount_amount, min_spend, is_active, description)
VALUES 
  ('JANNAT100', 'fixed', 100, 1000, true, '১০০০ টাকার অর্ডারে ১০০ টাকা ছাড়'),
  ('SUPER5', 'percentage', 5, 5000, true, '৫০০০ টাকার কেনাকাটায় ৫% বিশেষ ছাড়')
ON CONFLICT (code) DO NOTHING;

-- ৮. [সাইট ও ফুটার সেটিংস টেবিল]
CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_config',
  store_name TEXT DEFAULT 'জান্নাত কম্পিউটার্স',
  tagline_bn TEXT DEFAULT 'আপনার বিশ্বস্ত আইটি ও কম্পিউটার সল্যুশন পার্টনার',
  phone1 TEXT DEFAULT '01717220224',
  phone2 TEXT DEFAULT '01700000000',
  payment_phone TEXT DEFAULT '01717220224',
  email TEXT DEFAULT 'info@jannatcomputers.com',
  address_bn TEXT DEFAULT 'গাইবান্ধা সদর, রংপুর বিভাগ, বাংলাদেশ',
  settings_json JSONB DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৯. [অ্যাক্টিভিটি লগ টেবিল]
CREATE TABLE public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_name TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ১০. [নিরাপত্তা ও অ্যাক্সেস পলিসি এনাবল (Row Level Security)]
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All for admin_users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All for users" ON public.users FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All for products" ON public.products FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All for orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All for coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All for site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All for activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);`;

  const handleCopySqlScript = () => {
    navigator.clipboard.writeText(supabaseSqlScript);
    setSqlCopied(true);
    showToast(t('SQL কোড কপি করা হয়েছে! Supabase SQL Editor এ পেস্ট করুন।', 'SQL script copied to clipboard!'), 'success');
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
    setSupabaseSavedSuccess(true);
    showToast(t('Supabase ডেটাবেজ সেটিংস সফলভাবে সেভ হয়েছে!', 'Supabase config saved successfully!'), 'success');
    setTimeout(() => setSupabaseSavedSuccess(false), 4000);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeSuccess('');
    setPassChangeError('');

    if (newAdminPassword !== confirmAdminPassword) {
      const err = t('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলেনি!', 'New password and confirm password do not match!');
      setPassChangeError(err);
      showToast(err, 'error');
      return;
    }

    if (newAdminPassword.length < 6) {
      const err = t('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'New password must be at least 6 characters.');
      setPassChangeError(err);
      showToast(err, 'error');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changePasswordOnServer(currentAdminPassword, newAdminPassword);
      if (res.success) {
        setPassChangeSuccess(res.message);
        showToast(res.message, 'success');
        setCurrentAdminPassword('');
        setNewAdminPassword('');
        setConfirmAdminPassword('');
      } else {
        setPassChangeError(res.message);
        showToast(res.message, 'error');
      }
    } catch {
      const err = t('পাসওয়ার্ড পরিবর্তনের রিকোয়েস্ট ব্যর্থ হয়েছে।', 'Failed to update password.');
      setPassChangeError(err);
      showToast(err, 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  React.useEffect(() => {
    setFooterFormData(footerSettings);
  }, [footerSettings]);

  const handleFooterFieldChange = (field: keyof FooterSettings, val: string) => {
    setFooterFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveFooter = (e: React.FormEvent) => {
    e.preventDefault();
    updateFooterSettings(footerFormData);
  };

  // Order filters and state
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // New coupon form
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Coupon>({
    code: '',
    discountType: 'fixed',
    discountAmount: 500,
    minSpend: 10000,
    isActive: true,
    description: '',
  });

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'pending' ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const inTransitCount = orders.filter((o) => o.status === 'in_transit' || o.status === 'processing').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase();
    const matchQuery =
      !orderSearchQuery ||
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q);
    return matchStatus && matchQuery;
  });

  // Create Coupon handler
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) {
      showToast(t('কুপন কোড লিখুন', 'Enter coupon code'), 'error');
      return;
    }
    addCoupon({
      ...newCoupon,
      code: newCoupon.code.trim().toUpperCase(),
    });
    setIsAddingCoupon(false);
    setNewCoupon({
      code: '',
      discountType: 'fixed',
      discountAmount: 500,
      minSpend: 10000,
      isActive: true,
      description: '',
    });
    showToast(t('নতুন কুপন সফলভাবে সক্রিয় করা হয়েছে', 'New coupon code created successfully'));
  };

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
        <div className="bg-slate-900 text-white w-full max-w-md rounded-2xl shadow-2xl border border-amber-500/40 overflow-hidden my-auto p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-amber-300">
            {t('এডমিন পারমিশন প্রয়োজন', 'Admin Access Required')}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t(
              'এই ড্যাশবোর্ডটি শুধুমাত্র অনুমোদিত সুপার এডমিনদের জন্য সংরক্ষিত। এডমিন পাসওয়ার্ড দিয়ে লগইন করে প্রবেশ করুন।',
              'This dashboard is strictly restricted to Super Administrators. Please log in with your Admin credentials to gain access.'
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
                openModal('adminLogin');
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {t('এডমিন লগইন', 'Admin Login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 text-slate-100 w-full max-w-6xl rounded-2xl shadow-2xl border border-amber-500/40 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-950 to-slate-950 px-4 sm:px-6 py-4 border-b border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-amber-500/30 rounded-xl blur-md"></div>
              <img
                src={footerSettings.logoUrl || 'https://cdn.phototourl.com/free/2026-08-18-98718101-691f-402b-af90-3cb095b635e0.png'}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="relative h-10 w-auto object-contain drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-white tracking-tight">
                  {t('এডমিন মাস্টার ড্যাশবোর্ড (অর্ডার ও সেলস)', 'Admin Master Dashboard (Orders & Operations)')}
                </h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                {t('গ্রাহকদের অর্ডার প্রসেসিং, ডেলিভারি ট্র্যাকিং, ডিসকাউন্ট ভাউচার ও রেভিনিউ', 'Customer orders, dispatch tracking, discount vouchers & revenue')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('payment')}
              className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                activeTab === 'payment'
                  ? 'bg-amber-500 text-slate-950 font-black border-amber-400'
                  : 'bg-slate-800 hover:bg-amber-950/40 text-amber-300 hover:text-amber-200 border-amber-500/40'
              }`}
              title={t('পেমেন্ট নম্বর ও QR কোড সরাসরি এডিট করুন', 'Edit Payment Number & QR Code')}
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">{t('পেমেন্ট ও QR কোড', 'Payment & QR')}</span>
            </button>

            <button
              onClick={() => {
                closeModal();
                openModal('market');
              }}
              className="text-xs bg-slate-800 hover:bg-rose-950/60 text-rose-300 hover:text-rose-200 px-3 py-1.5 rounded-lg border border-rose-500/30 transition cursor-pointer flex items-center gap-1.5"
              title={t('প্রোডাক্ট ও ইনভেন্টরি মার্কেট প্যানেলে যান', 'Go to Product Catalog & Inventory')}
            >
              <Package className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">{t('মার্কেট প্যানেল', 'Market Panel')}</span>
            </button>

            <button
              onClick={() => {
                logout();
                closeModal();
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              {t('লগআউট', 'Logout')}
            </button>

            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Fully Responsive and Categorized */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs font-bold scrollbar-thin scrollbar-thumb-slate-700">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 bg-slate-900/60'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t('১. অর্ডার প্রসেসিং ও ডেলিভারি', '1. Orders & Deliveries')}</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-rose-600 text-white font-black px-2 py-0.2 rounded-full text-[10px] animate-pulse">
                {pendingOrdersCount} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap border ${
              activeTab === 'payment'
                ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md ring-2 ring-amber-500/30'
                : 'text-amber-300 hover:text-amber-100 hover:bg-amber-950/40 bg-slate-900 border-amber-500/40'
            }`}
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>{t('২. পেমেন্ট ও QR কোড সেটিংস', '2. Payment & QR Settings')}</span>
            <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
              bKash / Nagad
            </span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'hero'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 bg-slate-900/60'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t('৩. হিরো ব্যানার (Hero CMS)', '3. Hero Banner CMS')}</span>
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase">
              Banners
            </span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 bg-slate-900/60'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>{t('৪. ডিসকাউন্ট কুপন', '4. Coupons')}</span>
            <span className="bg-slate-800 px-1.5 py-0.2 rounded-full text-[10px]">
              {coupons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'policies'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 bg-slate-900/60'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{t('৫. পলিসি পেজ (Policy CMS)', '5. Policy CMS')}</span>
            <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase">
              8 Pages
            </span>
          </button>

          <button
            onClick={() => setActiveTab('footer')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'footer'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 bg-slate-900/60'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{t('৬. ফুটার ও শপ তথ্য', '6. Footer & Store Info')}</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 bg-slate-900/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t('৭. সেলস রিপোর্ট', '7. Sales & Revenue')}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 bg-slate-900/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('৮. সিকিউরিটি ও ব্যাকআপ', '8. Security & DB')}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">{t('মোট অর্ডার', 'Total Orders')}</div>
                    <div className="text-base font-extrabold text-white">{orders.length} টি</div>
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">{t('পেন্ডিং যাচাই', 'Pending')}</div>
                    <div className="text-base font-extrabold text-amber-400">{pendingOrdersCount} টি</div>
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">{t('ডেলিভারি চলছে', 'In Transit')}</div>
                    <div className="text-base font-extrabold text-purple-400">{inTransitCount} টি</div>
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">{t('ডেলিভারি সম্পন্ন', 'Delivered')}</div>
                    <div className="text-base font-extrabold text-emerald-400">{deliveredCount} টি</div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder={t('অর্ডার আইডি, কাস্টমার নাম বা ফোন নাম্বার খুঁজুন...', 'Search by Order ID, Name or Phone...')}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg pl-9 pr-3 py-2 outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2 outline-hidden cursor-pointer"
                  >
                    <option value="all">{t('সকল স্ট্যাটাস', 'All Statuses')}</option>
                    <option value="pending">{t('পেন্ডিং (নতুন)', 'Pending')}</option>
                    <option value="confirmed">{t('কনফার্মড', 'Confirmed')}</option>
                    <option value="processing">{t('প্রসেসিং ও টেস্টিং', 'Processing')}</option>
                    <option value="in_transit">{t('কুরিয়ারে অন-ওয়ে', 'In Transit')}</option>
                    <option value="delivered">{t('ডেলিভারড', 'Delivered')}</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3">অর্ডার আইডি ও তারিখ</th>
                        <th className="py-3 px-3">কাস্টমার তথ্য</th>
                        <th className="py-3 px-3">আইটেম সংখ্যা</th>
                        <th className="py-3 px-3 text-right">মোট টাকা</th>
                        <th className="py-3 px-3 text-center">স্ট্যাটাস পরিবর্তন</th>
                        <th className="py-3 px-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            {t('কোনো অর্ডার পাওয়া যায়নি', 'No matching orders found')}
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-800/60 transition">
                            <td className="py-3 px-3">
                              <div className="font-mono font-bold text-amber-400">{order.id}</div>
                              <div className="text-[10px] text-slate-400">{order.createdAt}</div>
                            </td>

                            <td className="py-3 px-3">
                              <div className="font-bold text-white">{order.customerName}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-400" />
                                <a href={`tel:${order.customerPhone}`} className="hover:underline text-emerald-300">
                                  {order.customerPhone}
                                </a>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{order.address}</div>
                            </td>

                            <td className="py-3 px-3">
                              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                                {order.items.reduce((sum, it) => sum + it.quantity, 0)} টি আইটেম
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="font-extrabold text-white text-sm text-emerald-400">
                                ৳{order.total.toLocaleString('en-IN')}
                              </div>
                              <div className="flex items-center justify-end gap-1 mt-0.5">
                                <span
                                  className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                    order.paymentMethod === 'bkash'
                                      ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                                      : order.paymentMethod === 'nagad'
                                      ? 'bg-orange-950 text-orange-300 border border-orange-800/50'
                                      : order.paymentMethod === 'rocket'
                                      ? 'bg-purple-950 text-purple-300 border border-purple-800/50'
                                      : order.paymentMethod === 'upay'
                                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                                      : order.paymentMethod === 'card'
                                      ? 'bg-blue-950 text-blue-300 border border-blue-800/50'
                                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                                  }`}
                                >
                                  {order.paymentMethod === 'bkash'
                                    ? 'bKash'
                                    : order.paymentMethod === 'nagad'
                                    ? 'Nagad'
                                    : order.paymentMethod === 'rocket'
                                    ? 'Rocket'
                                    : order.paymentMethod === 'upay'
                                    ? 'Upay'
                                    : order.paymentMethod === 'card'
                                    ? 'Card'
                                    : order.paymentMethod === 'emi'
                                    ? 'EMI'
                                    : 'COD'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border outline-hidden cursor-pointer ${
                                  order.status === 'pending'
                                    ? 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                                    : order.status === 'confirmed'
                                    ? 'bg-blue-950/60 text-blue-400 border-blue-500/40'
                                    : order.status === 'processing'
                                    ? 'bg-indigo-950/60 text-indigo-400 border-indigo-500/40'
                                    : order.status === 'in_transit'
                                    ? 'bg-purple-950/60 text-purple-400 border-purple-500/40'
                                    : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                                }`}
                              >
                                <option value="pending">পেন্ডিং (Pending)</option>
                                <option value="confirmed">কনফার্মড (Confirmed)</option>
                                <option value="processing">প্রসেসিং (Processing)</option>
                                <option value="in_transit">কুরিয়ারে (In Transit)</option>
                                <option value="delivered">ডেলিভারড (Delivered)</option>
                              </select>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedOrderForDetail(order)}
                                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition cursor-pointer"
                                >
                                  {t('ডিটেইলস', 'Details')}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOrderToDelete(order);
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-800/40 transition cursor-pointer"
                                  title="Delete"
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

              {/* Order Detail Modal popup */}
              {selectedOrderForDetail && (
                <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 animate-in fade-in">
                  <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-white text-base">
                            {t('অর্ডার বিবরণী ও কাস্টমার প্রোফাইল', 'Order Details & Customer Profile')}
                          </h4>
                          <span className="text-amber-400 font-mono font-black text-sm bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                            #{selectedOrderForDetail.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{selectedOrderForDetail.createdAt}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForDetail(null)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Customer Full Details Card */}
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2.5 text-xs">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 border-b border-slate-700/60 pb-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{t('কাস্টমার ফুল ডিটেইলস (Customer Full Information)', 'Customer Full Information')}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                        <div>
                          <span className="text-slate-400 block text-[10px]">{t('গ্রাহকের নাম:', 'Customer Name:')}</span>
                          <span className="font-bold text-white text-sm">{selectedOrderForDetail.customerName}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">{t('মোবাইল নম্বর:', 'Phone Number:')}</span>
                          <a
                            href={`tel:${selectedOrderForDetail.customerPhone}`}
                            className="font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{selectedOrderForDetail.customerPhone}</span>
                          </a>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">{t('ইমেইল অ্যাড্রেস:', 'Email Address:')}</span>
                          <span className="font-medium text-slate-200">{selectedOrderForDetail.customerEmail || 'N/A'}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">{t('পেমেন্ট মেথড:', 'Payment Method:')}</span>
                          <span className="font-bold text-amber-400">
                            {selectedOrderForDetail.paymentMethod === 'bkash'
                              ? 'বিকাশ (bKash)'
                              : selectedOrderForDetail.paymentMethod === 'nagad'
                              ? 'নগদ (Nagad)'
                              : selectedOrderForDetail.paymentMethod === 'rocket'
                              ? 'রকেট (DBBL Rocket)'
                              : selectedOrderForDetail.paymentMethod === 'upay'
                              ? 'উপায় (UCB Upay)'
                              : selectedOrderForDetail.paymentMethod === 'card'
                              ? 'কার্ড / ব্যাংকিং (Cards)'
                              : selectedOrderForDetail.paymentMethod === 'emi'
                              ? '০% কিস্তি (EMI)'
                              : 'ক্যাশ অন ডেলিভারি (COD)'}
                          </span>
                          {selectedOrderForDetail.transactionId && (
                            <div className="text-[11px] font-mono font-bold text-rose-400 mt-0.5">
                              TrxID: {selectedOrderForDetail.transactionId}
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <span className="text-slate-400 block text-[10px]">{t('ডেলিভারি সম্পূর্ণ ঠিকানা:', 'Full Delivery Address:')}</span>
                          <div className="font-medium text-slate-200 flex items-start gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>
                              {selectedOrderForDetail.address}, থানা: {selectedOrderForDetail.thana}, জেলা: {selectedOrderForDetail.district}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>{t('অর্ডারকৃত পণ্যসমূহ:', 'Ordered Items:')}</span>
                        <span className="text-slate-400 font-normal text-[11px]">{selectedOrderForDetail.items.length} টি আইটেম</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {selectedOrderForDetail.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-800 p-2.5 rounded-lg text-xs border border-slate-700/50">
                            <div className="flex items-center gap-2.5">
                              <img src={item.product.image} className="w-9 h-9 object-contain bg-white rounded p-0.5 shrink-0" />
                              <div>
                                <div className="line-clamp-1 text-slate-200 font-bold">{item.product.name}</div>
                                <div className="text-[11px] text-slate-400">
                                  একক মূল্য: ৳{item.product.price.toLocaleString('en-IN')} × {item.quantity}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-rose-400 font-black">৳{(item.product.price * item.quantity).toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>সাবটোটাল:</span>
                        <span>৳{selectedOrderForDetail.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>ডেলিভারি চার্জ:</span>
                        <span>৳{selectedOrderForDetail.shippingFee}</span>
                      </div>
                      {selectedOrderForDetail.discount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>ডিসকাউন্ট:</span>
                          <span>-৳{selectedOrderForDetail.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                        <span>সর্বমোট প্রদেয় বিল:</span>
                        <span className="text-amber-400 font-black text-base">৳{selectedOrderForDetail.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => handlePrintInvoice(selectedOrderForDetail)}
                        className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-950/60"
                        title={t('আলাদা পেজে প্রিন্ট ও পিডিএফ ডাউনলোড করুন', 'Print & Save as PDF in New Window')}
                      >
                        <Printer className="w-4 h-4" />
                        <span>{t('ইনভয়েস প্রিন্ট / পিডিএফ (Print Invoice/PDF)', 'Print Invoice / PDF')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedOrderForDetail(null)}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition border border-slate-700"
                      >
                        {t('বন্ধ করুন', 'Close')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PAYMENT & QR CODE MANAGEMENT (PRIMARY CMS) */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 p-5 sm:p-6 rounded-2xl border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-md">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {t('বিকাশ, নগদ ও রকেট পেমেন্ট QR কোড সেটিংস', 'bKash, Nagad & Rocket Payment QR Code Settings')}
                      </h3>
                      <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Live Checkout QR
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {t(
                        'গ্রাহকদের চেকআউটে পেমেন্ট করার জন্য অফিসিয়াল বিকাশ/নগদ নম্বর এবং মার্চেন্ট QR কোডের ছবি আপলোড বা আপডেট করুন।',
                        'Configure official payment receiving phone number and custom merchant QR code image displayed to customers during checkout.'
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleFooterFieldChange('paymentPhone', '01717220224');
                    handleFooterFieldChange('qrCodeUrl', '');
                    showToast(t('পেমেন্ট ডিফল্ট সেটিংস রিস্টোর করা হয়েছে।', 'Payment defaults restored.'), 'info');
                  }}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700 shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('ডিফল্ট রিস্টোর', 'Reset Defaults')}</span>
                </button>
              </div>

              {/* Main Form */}
              <form onSubmit={handleSaveFooter} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Phone & Direct Upload (7 cols) */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Official Phone Number Card */}
                    <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                      <label className="block text-xs font-black text-slate-200 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-amber-400" />
                          <span>{t('পেমেন্ট গ্রহণের অফিসিয়াল মোবাইল নম্বর *', 'Official Payment Receiving Mobile Number *')}</span>
                        </span>
                        <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          bKash • Nagad • Rocket • Upay
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        value={footerFormData.paymentPhone}
                        onChange={(e) => handleFooterFieldChange('paymentPhone', e.target.value)}
                        placeholder="e.g. 01717220224"
                        className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-base text-rose-400 outline-hidden font-mono font-black shadow-inner tracking-wider"
                      />
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span>💡</span>
                        <span>{t('এই নম্বরটি গ্রাহক চেকআউট পেজে কপি করতে পারবে এবং QR কোডেও এই নম্বর স্বয়ংক্রিয়ভাবে সংযুক্ত হবে।', 'Customers can copy this number at checkout, and dynamic QR codes will also encode this number.')}</span>
                      </p>
                    </div>

                    {/* Direct QR Image Upload Card */}
                    <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-md">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-black text-slate-200 flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>{t('মার্চেন্ট বা পার্সোনাল QR কোড ছবি আপলোড', 'Upload Custom Payment QR Image')}</span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {t('মোবাইল / কম্পিউটার থেকে সরাসরি', 'Direct from device')}
                        </span>
                      </div>

                        {/* Hidden File Input */}
                        <input
                          type="file"
                          id="primary-payment-qr-file-input"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const dataUrl = await readQrImageFile(file);
                                handleFooterFieldChange('qrCodeUrl', dataUrl);
                                showToast(language === 'bn' ? 'QR কোড ছবি ক্রিস্টাল ক্লিয়ার কোয়ালিটিতে লোড হয়েছে!' : 'QR Code image loaded with crisp quality!');
                              } catch (err) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handleFooterFieldChange('qrCodeUrl', reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }
                            e.target.value = '';
                          }}
                        />

                      {/* Interactive Drag & Drop Box */}
                      <div
                        onClick={() => document.getElementById('primary-payment-qr-file-input')?.click()}
                        className="cursor-pointer bg-slate-950/80 hover:bg-slate-950 border-2 border-dashed border-amber-500/60 hover:border-amber-400 rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-3 group shadow-inner"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition border border-amber-500/20 group-hover:scale-105 shadow">
                          <Upload className="w-7 h-7" />
                        </div>
                        <div>
                          <span className="text-sm font-black text-white group-hover:text-amber-400 transition block">
                            {t('ফোন বা কম্পিউটার থেকে QR কোড ছবি সিলেক্ট করুন', 'Click to Select QR Code Photo File')}
                          </span>
                          <span className="text-xs text-slate-400 block mt-1">
                            {t('বিকাশ বা নগদ মার্চেন্ট QR কোডের ছবি / স্ক্রিনশট (JPG, PNG, WEBP)', 'bKash/Nagad merchant QR photo or screenshot (JPG, PNG, WEBP)')}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="px-4 py-1.5 bg-amber-500 group-hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg shadow pointer-events-none"
                        >
                          {t('ফাইল ব্রাউজ করুন', 'Browse Image File')}
                        </button>
                      </div>

                      {/* Web Image URL Alternative */}
                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          {t('অথবা অনলাইন ইমেজ লিংক দিন (URL):', 'Or enter image web URL:')}
                        </label>
                        <input
                          type="text"
                          value={footerFormData.qrCodeUrl}
                          onChange={(e) => handleFooterFieldChange('qrCodeUrl', e.target.value)}
                          placeholder="https://... অথবা খালি রাখলে স্বয়ংক্রিয় স্মার্ট ভেক্টর QR কোড তৈরি হবে"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 outline-hidden font-mono"
                        />
                      </div>

                      {footerFormData.qrCodeUrl ? (
                        <div className="flex items-center justify-between p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{t('কাস্টম মার্চেন্ট QR কোড সক্রিয় আছে', 'Custom Merchant QR Image is Active')}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleFooterFieldChange('qrCodeUrl', '');
                              showToast(t('ভেক্টর QR কোড রিসেট করা হয়েছে।', 'Reset to smart vector QR.'), 'info');
                            }}
                            className="text-xs text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                          >
                            {t('রিমুভ করে ভেক্টর QR ব্যবহার করুন', 'Remove & Use Dynamic Vector QR')}
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>{t('কোনো ছবি না দিলে সিস্টেম স্বয়ংক্রিয়ভাবে নম্বরের সাথে স্মার্ট কিউআর তৈরি করবে।', 'If no custom image is uploaded, system renders an interactive smart dynamic QR.')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Live Interactive QR Preview (5 cols) */}
                  <div className="lg:col-span-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4" />
                        <span>{t('লাইভ স্মার্ট QR কোড প্রিভিউ:', 'Live Smart QR Preview:')}</span>
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                        {footerFormData.qrCodeUrl ? 'Custom Image Mode' : 'Smart Dynamic Vector'}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center shadow-inner">
                      <PaymentQRCode
                        paymentMethod="bkash"
                        phoneNumber={footerFormData.paymentPhone || '01717220224'}
                        amount={5000}
                        customImageUrl={footerFormData.qrCodeUrl}
                        storeName={footerFormData.storeName}
                        size={175}
                        showControls={true}
                      />

                      <div className="mt-4 pt-3 border-t border-slate-800/80 w-full text-center space-y-1">
                        <span className="text-xs font-bold text-white block">
                          {t('গ্রাহক চেকআউট ভিউ', 'Customer Checkout Preview')}
                        </span>
                        <span className="text-[11px] text-slate-400 block max-w-xs mx-auto">
                          {t(
                            'গ্রাহক অর্ডার কনফার্মেশনের সময় এই QR কোডটি সরাসরি স্ক্যান করে টাকা পাঠাতে পারবেন।',
                            'Customers will scan this exact QR code during checkout to send payment.'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-3 flex justify-end border-t border-slate-800">
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-black transition cursor-pointer flex items-center gap-2 shadow-xl shadow-amber-950/70 hover:scale-[1.01]"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('পেমেন্ট ও QR কোড তথ্য সেভ করুন', 'Save Payment & QR Code Settings')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-amber-900/40 to-slate-800 p-4 rounded-xl border border-amber-500/30">
                  <div className="text-xs text-amber-300 font-bold mb-1">{t('মোট বিক্রয় রেভিনিউ', 'Total Completed Sales')}</div>
                  <div className="text-2xl font-black text-white">৳{totalRevenue.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{t('সফল ও প্রসেসিং অর্ডারের সমষ্টি', 'Aggregated from active store orders')}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-slate-800 p-4 rounded-xl border border-blue-500/30">
                  <div className="text-xs text-blue-300 font-bold mb-1">{t('মোট ক্যাটালগ প্রোডাক্ট', 'Catalog Components')}</div>
                  <div className="text-2xl font-black text-white">{products.length} টি</div>
                  <div className="text-[11px] text-slate-400 mt-1">{t('মার্কেট প্যানেল দ্বারা নিয়ন্ত্রিত', 'Controlled via Market Panel')}</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-900/40 to-slate-800 p-4 rounded-xl border border-emerald-500/30">
                  <div className="text-xs text-emerald-300 font-bold mb-1">{t('অর্ডার সাকসেস রেট', 'Order Fulfillment Rate')}</div>
                  <div className="text-2xl font-black text-white">
                    {orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 100}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{deliveredCount} টি অর্ডার সফলভাবে গ্রাহকের হাতে পৌঁছেছে</div>
                </div>
              </div>

              {/* Quick links to actions */}
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
                <h4 className="font-extrabold text-sm text-white">{t('দ্রুত অ্যাকশন শর্টকাট', 'Quick Action Shortcuts')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      closeModal();
                      openModal('market');
                    }}
                    className="p-3 bg-slate-900 hover:bg-rose-950/40 border border-rose-500/30 rounded-xl text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
                      <Package className="w-4 h-4" />
                      <span>{t('মার্কেট প্যানেলে নতুন পণ্য যোগ করুন', 'Open Market Panel & Add Products')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {t('ওয়েবসাইটে কম্পিউটার কম্পোনেন্ট, ল্যাপটপ বা এক্সেসরিজ যোগ বা মূল্য পরিবর্তন করুন।', 'Manage computer components, update live prices and stock.')}
                    </p>
                  </button>

                  <button
                    onClick={() => setActiveTab('coupons')}
                    className="p-3 bg-slate-900 hover:bg-amber-950/40 border border-amber-500/30 rounded-xl text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                      <Tag className="w-4 h-4" />
                      <span>{t('নতুন ডিসকাউন্ট কুপন তৈরি করুন', 'Create New Discount Coupon')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {t('কাস্টমারদের স্পেশাল ক্যাশব্যাক বা ছাড়ের জন্য প্রোমো কোড তৈরি করুন।', 'Generate promotional codes for special discounts & campaigns.')}
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div>
                  <h4 className="font-bold text-xs text-white">{t('ডিসকাউন্ট ও প্রোমো কোড ব্যবস্থাপনা', 'Manage Promotional Discount Codes')}</h4>
                  <p className="text-[11px] text-slate-400">{t('চেকআউটে গ্রাহক এই কুপন ব্যবহার করে ছাড় পাবেন', 'Customers apply these vouchers during checkout')}</p>
                </div>
                <button
                  onClick={() => setIsAddingCoupon(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('নতুন কুপন', 'New Coupon')}</span>
                </button>
              </div>

              {isAddingCoupon && (
                <form onSubmit={handleCreateCoupon} className="bg-slate-800 border border-amber-500/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="font-bold text-xs text-white">{t('নতুন কুপন কোড তৈরি', 'Create New Coupon')}</span>
                    <button type="button" onClick={() => setIsAddingCoupon(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">কুপন কোড *</label>
                      <input
                        type="text"
                        required
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                        placeholder="e.g. JANNAT1000"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono font-bold uppercase outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">ছাড়ের পরিমাণ (টাকা) *</label>
                      <input
                        type="number"
                        required
                        value={newCoupon.discountAmount}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountAmount: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-semibold">সর্বনিম্ন অর্ডারের সীমা (টাকা)</label>
                      <input
                        type="number"
                        value={newCoupon.minSpend}
                        onChange={(e) => setNewCoupon({ ...newCoupon, minSpend: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-hidden"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCoupon(false)}
                      className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs rounded-lg"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg"
                    >
                      কুপন সক্রিয় করুন
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {coupons.map((coupon, idx) => (
                  <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-3 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-amber-400 text-sm bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => toggleCouponStatus(coupon.code)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer border ${
                          coupon.isActive
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {coupon.isActive ? 'Active (সক্রিয়)' : 'Disabled'}
                      </button>
                    </div>
                    <div className="text-xs text-slate-300 font-semibold">
                      ছাড়: <span className="text-white font-bold">৳{coupon.discountAmount}</span> (সর্বনিম্ন খরচ ৳{coupon.minSpend.toLocaleString('en-IN')})
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => deleteCoupon(coupon.code)}
                        className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>মুছে ফেলুন</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: POLICIES CMS */}
          {activeTab === 'policies' && <PolicyEditorTab />}

          {/* TAB: FOOTER SETTINGS */}
          {activeTab === 'footer' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-4 rounded-xl border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">
                      {t('ওয়েবসাইট ফুটার ও শপ তথ্য সেটিংস', 'Website Footer & Shop Info Settings')}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {t('ফুটারের নাম, ঠিকানা, হেল্পলাইন নম্বর, সোশ্যাল লিংক ও পেমেন্ট QR কোড এখান থেকেই পরিবর্তন করুন', 'Edit footer contact info, address, helpline numbers, social URLs & QR Code')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(language === 'bn' ? 'ফুটার তথ্য ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?' : 'Reset footer settings to default?')) {
                        resetFooterSettings();
                        setFooterFormData(footerSettings);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
                  >
                    <ResetIcon className="w-3.5 h-3.5" />
                    <span>{t('ডিফল্ট রিস্টোর', 'Reset Defaults')}</span>
                  </button>
                </div>
              </div>

              {/* Sub tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold scrollbar-none">
                {[
                  { id: 'general', label: t('১. শপ নাম ও পরিচিতি', '1. Brand & About'), icon: <Store className="w-3.5 h-3.5" /> },
                  { id: 'contact', label: t('২. শোরুমের ঠিকানা ও হেল্পলাইন', '2. Address & Helpline'), icon: <Phone className="w-3.5 h-3.5" /> },
                  { id: 'social', label: t('৩. সোশ্যাল মিডিয়া ও লাইসেন্স', '3. Social & License'), icon: <Globe className="w-3.5 h-3.5" /> },
                  { id: 'payment', label: t('৪. পেমেন্ট QR কোড ও নম্বর', '4. Payment QR & Phone'), icon: <QrCode className="w-3.5 h-3.5" /> },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFooterSubTab(st.id as any)}
                    className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                      footerSubTab === st.id
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {st.icon}
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>

              {/* Footer Edit Form */}
              <form onSubmit={handleSaveFooter} className="space-y-4">
                {footerSubTab === 'general' && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('দোকান / প্রতিষ্ঠানের পূর্ণ নাম (Store Name) *', 'Store Name *')}
                        </label>
                        <input
                          type="text"
                          required
                          value={footerFormData.storeName}
                          onChange={(e) => handleFooterFieldChange('storeName', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {t('স্লোগান (বাংলা)', 'Tagline (Bangla)')}
                          </label>
                          <input
                            type="text"
                            value={footerFormData.taglineBn}
                            onChange={(e) => handleFooterFieldChange('taglineBn', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            {t('স্লোগান (English)', 'Tagline (English)')}
                          </label>
                          <input
                            type="text"
                            value={footerFormData.tagline}
                            onChange={(e) => handleFooterFieldChange('tagline', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('ফুটার সংক্ষিপ্ত পরিচিতি বিবরণ (বাংলা)', 'About Store Description (Bangla)')}
                        </label>
                        <textarea
                          rows={3}
                          value={footerFormData.aboutTextBn}
                          onChange={(e) => handleFooterFieldChange('aboutTextBn', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden leading-relaxed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('ফুটার সংক্ষিপ্ত পরিচিতি বিবরণ (English)', 'About Store Description (English)')}
                        </label>
                        <textarea
                          rows={3}
                          value={footerFormData.aboutText}
                          onChange={(e) => handleFooterFieldChange('aboutText', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {footerSubTab === 'contact' && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('দোকান / শোরুমের পূর্ণ ঠিকানা (বাংলা) *', 'Showroom Address (Bangla) *')}
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={footerFormData.addressBn}
                          onChange={(e) => handleFooterFieldChange('addressBn', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('দোকান / শোরুমের পূর্ণ ঠিকানা (English)', 'Showroom Address (English)')}
                        </label>
                        <textarea
                          rows={2}
                          value={footerFormData.address}
                          onChange={(e) => handleFooterFieldChange('address', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('হেল্পলাইন ফোন ১ *', 'Helpline Phone 1 *')}
                        </label>
                        <input
                          type="text"
                          required
                          value={footerFormData.phone1}
                          onChange={(e) => handleFooterFieldChange('phone1', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('হেল্পলাইন ফোন ২ (ঐচ্ছিক)', 'Helpline Phone 2 (Optional)')}
                        </label>
                        <input
                          type="text"
                          value={footerFormData.phone2}
                          onChange={(e) => handleFooterFieldChange('phone2', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('অফিশিয়াল ইমেইল (Email)', 'Official Email')}
                        </label>
                        <input
                          type="email"
                          value={footerFormData.email}
                          onChange={(e) => handleFooterFieldChange('email', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('দোকান খোলা থাকার সময় (বাংলা)', 'Business Hours (Bangla)')}
                        </label>
                        <input
                          type="text"
                          value={footerFormData.businessHoursBn}
                          onChange={(e) => handleFooterFieldChange('businessHoursBn', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {footerSubTab === 'social' && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('Facebook পেজ URL', 'Facebook Page URL')}
                        </label>
                        <input
                          type="url"
                          value={footerFormData.facebookUrl}
                          onChange={(e) => handleFooterFieldChange('facebookUrl', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('YouTube চ্যানেল URL', 'YouTube Channel URL')}
                        </label>
                        <input
                          type="url"
                          value={footerFormData.youtubeUrl}
                          onChange={(e) => handleFooterFieldChange('youtubeUrl', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('Instagram প্রোফাইল URL', 'Instagram Profile URL')}
                        </label>
                        <input
                          type="url"
                          value={footerFormData.instagramUrl}
                          onChange={(e) => handleFooterFieldChange('instagramUrl', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('LinkedIn পেজ URL', 'LinkedIn Page URL')}
                        </label>
                        <input
                          type="url"
                          value={footerFormData.linkedinUrl}
                          onChange={(e) => handleFooterFieldChange('linkedinUrl', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('ট্রেড লাইসেন্স নম্বর (Trade License No)', 'Trade License No')}
                        </label>
                        <input
                          type="text"
                          value={footerFormData.tradeLicense}
                          onChange={(e) => handleFooterFieldChange('tradeLicense', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          {t('কম্পিউটার সমিতি / অ্যাসোসিয়েশন মেম্বারশিপ', 'Association Membership')}
                        </label>
                        <input
                          type="text"
                          value={footerFormData.bcsMembership}
                          onChange={(e) => handleFooterFieldChange('bcsMembership', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {footerSubTab === 'payment' && (
                  <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-5">
                    <div className="flex items-center gap-3 border-b border-slate-700/80 pb-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">
                          {t('বিকাশ / নগদ / রকেট পেমেন্ট ও QR কোড ম্যানেজমেন্ট', 'Bkash, Nagad, Rocket Payment & QR Management')}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {t('গ্রাহকদের চেকআউট ও পেমেন্টের জন্য অফিশিয়াল নম্বর ও কাস্টম মার্চেন্ট QR কোড যুক্ত করুন', 'Set official payment number and custom QR code for customer checkout')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                            <span>{t('পেমেন্ট গ্রহণের অফিশিয়াল মোবাইল নম্বর *', 'Official Payment Mobile Number *')}</span>
                            <span className="text-[11px] text-amber-400 font-normal">বিকাশ / নগদ / রকেট / উপায়</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={footerFormData.paymentPhone}
                            onChange={(e) => handleFooterFieldChange('paymentPhone', e.target.value)}
                            placeholder="e.g. 01717220224"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-rose-400 focus:border-amber-500 outline-hidden font-mono font-bold shadow-inner"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            এই নম্বরেই গ্রাহক টাকা পাঠাবে এবং QR কোডেও এই নম্বর স্বয়ংক্রিয়ভাবে সংযুক্ত হবে।
                          </p>
                        </div>

                        {/* Direct QR Image Upload Box */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                            <Upload className="w-4 h-4 text-amber-400" />
                            <span>{t('মার্চেন্ট / পার্সোনাল QR কোড ছবি আপলোড', 'Upload Custom Payment QR Image')}</span>
                          </label>
                          
                          {/* Hidden File Input */}
                          <input
                            type="file"
                            id="qr-code-file-upload-input"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const dataUrl = await readQrImageFile(file);
                                  handleFooterFieldChange('qrCodeUrl', dataUrl);
                                  showToast(language === 'bn' ? 'QR কোড ছবি ক্রিস্টাল ক্লিয়ার কোয়ালিটিতে লোড হয়েছে!' : 'QR Code image loaded with crisp quality!');
                                } catch (err) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    handleFooterFieldChange('qrCodeUrl', reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }
                              e.target.value = '';
                            }}
                          />

                          {/* Upload Area / Card */}
                          <div
                            onClick={() => document.getElementById('qr-code-file-upload-input')?.click()}
                            className="cursor-pointer bg-slate-900/90 hover:bg-slate-950 border-2 border-dashed border-amber-500/50 hover:border-amber-400 rounded-2xl p-4 text-center transition flex flex-col items-center justify-center gap-2 group shadow-sm"
                          >
                            <div className="w-11 h-11 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs font-black text-white group-hover:text-amber-400 transition block">
                                {t('ফোন বা কম্পিউটার থেকে QR কোড ছবি সিলেক্ট করুন', 'Click to Upload QR Code Image File')}
                              </span>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                JPG, PNG বা WEBP (বিকাশ বা নগদ মার্চেন্ট QR কোডের স্ক্রিনশট বা ছবি)
                              </span>
                            </div>
                          </div>

                          {/* Image Link Input (Optional alternative) */}
                          <div className="mt-3">
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">
                              {t('অথবা অনলাইন ইমেজ লিংক (URL):', 'Or Image URL:')}
                            </label>
                            <input
                              type="text"
                              value={footerFormData.qrCodeUrl}
                              onChange={(e) => handleFooterFieldChange('qrCodeUrl', e.target.value)}
                              placeholder="https://... অথবা খালি রাখলে স্বয়ংক্রিয় স্মার্ট ভেক্টর QR তৈরি হবে"
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-hidden font-mono"
                            />
                          </div>

                          {footerFormData.qrCodeUrl ? (
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {t('কাস্টম QR ছবি সক্রিয় আছে', 'Custom QR Image Active')}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleFooterFieldChange('qrCodeUrl', '')}
                                className="text-[11px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                              >
                                {t('রিমুভ করে ভেক্টর QR ব্যবহার করুন', 'Remove & Use Default Vector QR')}
                              </button>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                              <span>💡</span>
                              <span>{t('কোনো ছবি না দিলে সিস্টেম স্বয়ংক্রিয়ভাবে নম্বরের সাথে স্মার্ট কিউআর তৈরি করবে।', 'If no image is uploaded, system generates an interactive smart QR.')}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Live Preview Container */}
                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center shadow-lg">
                        <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                          <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                            <QrCode className="w-4 h-4" />
                            {t('লাইভ স্মার্ট QR কোড প্রিভিউ:', 'Live Smart QR Preview:')}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                            {footerFormData.qrCodeUrl ? 'Custom Image' : 'Smart Dynamic QR'}
                          </span>
                        </div>

                        <PaymentQRCode
                          paymentMethod="bkash"
                          phoneNumber={footerFormData.paymentPhone || '01717220224'}
                          amount={5000}
                          customImageUrl={footerFormData.qrCodeUrl}
                          storeName={footerFormData.storeName}
                          size={160}
                          showControls={true}
                        />

                        <span className="text-[11px] text-slate-400 mt-3 max-w-xs">
                          {t(
                            'গ্রাহক চেকআউটে এই QR কোড স্ক্যান করে সরাসরি বিকাশ / নগদ অ্যাপ থেকে পেমেন্ট করতে পারবেন।',
                            'Customers can scan this QR code directly during checkout.'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-950/60"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('ফুটার তথ্য সেভ ও আপডেট করুন', 'Save Footer Information')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: SECURITY & RBAC MANAGEMENT */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Role-Based Access Control Architecture Overview */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">
                        {t('রোল বেসড অ্যাক্সেস কন্ট্রোল (RBAC) স্ট্যাটাস', 'Role-Based Access Control (RBAC) Status')}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {t('সার্ভার সাইড সল্টেড হ্যাশ ও ক্রিপ্টোগ্রাফিক সেশন ভেরিফিকেশন', 'Server-side salted PBKDF2 hashing & cryptographic session verification')}
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>100% Protected</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400">Super Admin (এডমিন)</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">Full Access</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      অর্ডার প্রসেসিং, ইনভয়েস প্রিন্ট, কুপন তৈরি, পলিসি এডিটর ও শপ সেটিংস নিয়ন্ত্রণ।
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-xl border border-rose-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-400">Market Admin (মার্কেট)</span>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">Catalog Only</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      প্রোডাক্ট সংযোজন, মূল্য পরিবর্তন, স্টক ও ক্যাটালগ ম্যানেজমেন্টে সীমাবদ্ধ।
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-xl border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-400">Customer (গ্রাহক)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Client Level</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      নিরাপদ অর্ডার প্লেসিং, কার্ট, উইশলিস্ট ও ব্যক্তিগত ট্র্যাকিং অ্যাক্সেস।
                    </p>
                  </div>
                </div>
              </div>

              {/* Super Admin Password Change Form */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      {t('এডমিন পাসওয়ার্ড পরিবর্তন (Server-Side)', 'Change Admin Password (Server-Side)')}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {t('পাসওয়ার্ড সরাসরি ব্যাকএন্ড সার্ভারে ক্রিপ্টোগ্রাফিক সল্ট সহ হ্যাশ করে সংরক্ষিত হবে।', 'Password is saved with PBKDF2 salt & hash on the server.')}
                    </p>
                  </div>
                </div>

                {passChangeSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3.5 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passChangeSuccess}</span>
                  </div>
                )}

                {passChangeError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passChangeError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {t('বর্তমান এডমিন পাসওয়ার্ড *', 'Current Admin Password *')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={currentAdminPassword}
                        onChange={(e) => setCurrentAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {t('নতুন পাসওয়ার্ড *', 'New Password *')}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="কমপক্ষে ৬ অক্ষর"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {t('পাসওয়ার্ড পুনরায় লিখুন *', 'Confirm Password *')}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={confirmAdminPassword}
                          onChange={(e) => setConfirmAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 text-slate-950 text-xs font-black transition cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-950/60"
                    >
                      {isChangingPass ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('আপডেট হচ্ছে...', 'Updating...')}</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          <span>{t('পাসওয়ার্ড সুরক্ষিতভাবে আপডেট করুন', 'Update Password Securely')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Permanent Server Database & Backup Engine (Never Reset / Lose Products) */}
              <div className="bg-slate-950/90 rounded-2xl border border-emerald-500/40 p-6 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">
                          {t('সার্ভার ও ক্লাউড ডাটাবেজ স্থায়িত্ব (Permanent Database Storage)', 'Permanent Server Database & Cloud Persistence')}
                        </h4>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {t('অ্যাক্টিভ ও স্থায়ী', 'ACTIVE & DURABLE')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t(
                          'আপনার যুক্ত বা এডিট করা সকল প্রোডাক্ট, পেমেন্ট QR কোড, ব্যানার এবং পলিসি সার্ভারে পার্মানেন্ট সেভ থাকে—ব্রাউজার ক্যাশ ক্লিয়ার হলেও কোনো কিছু ডিফল্ট হবে না।',
                          'All your added/edited products, payment QR codes, banners, and policies are permanently preserved on the server—data never resets even if browser cache is cleared.'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleManualSyncClick}
                      disabled={isManualSyncing}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} />
                      <span>{isManualSyncing ? t('সিঙ্ক হচ্ছে...', 'Syncing...') : t('তাৎক্ষণিক সার্ভার সিঙ্ক', 'Force Sync Now')}</span>
                    </button>
                  </div>
                </div>

                {backupRestoreMessage && (
                  <div
                    className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                      backupRestoreMessage.type === 'success'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {backupRestoreMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{backupRestoreMessage.text}</span>
                  </div>
                )}

                {/* Status bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{t('মোট সংরক্ষিত প্রোডাক্ট', 'Total Saved Products')}</div>
                      <div className="font-bold text-white text-sm">{products.length} {t('টি আইটেম', 'Items')}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{t('সর্বশেষ সার্ভার সিঙ্ক', 'Last Server Sync')}</div>
                      <div className="font-semibold text-slate-300 text-xs">
                        {lastServerSyncTime ? new Date(lastServerSyncTime).toLocaleTimeString('bn-BD') : t('সবেমাত্র সিঙ্ক হয়েছে', 'Just now')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{t('অটো-রিস্টোর সুরক্ষা', 'Auto-Restore Protection')}</div>
                      <div className="font-bold text-sky-300 text-xs">{t('১০০% এনাবল্ড', '100% ENABLED')}</div>
                    </div>
                  </div>
                </div>

                {/* Backup & Restore Action Buttons */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-amber-400" />
                        <span>{t('অফলাইন ডাটাবেজ ব্যাকআপ ও রিস্টোর (JSON Backup & Restore)', 'Offline JSON Database Backup & Restore')}</span>
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        {t('ভবিষ্যতের নিরাপত্তার জন্য ১-ক্লিকে পুরো ওয়েবসাইটের সব প্রোডাক্ট, ইমেজ, QR কোড ও সেটিংস ডাউনলোড করে রাখুন।', 'Download a full offline snapshot of all products, images, QR codes, and settings in 1 click.')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={downloadBackup}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('ফুল ব্যাকআপ ডাউনলোড (.json)', 'Download Backup (.json)')}</span>
                      </button>

                      <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1.5">
                        {isRestoringBackup ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{isRestoringBackup ? t('রিস্টোর হচ্ছে...', 'Restoring...') : t('ব্যাকআপ ফাইল রিস্টোর করুন', 'Restore from JSON')}</span>
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleBackupFileSelect}
                          className="hidden"
                          disabled={isRestoringBackup}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supabase Cloud Database Direct Connection */}
              <div className="bg-slate-950/80 rounded-2xl border border-amber-500/40 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {t('Supabase লাইভ ক্লাউড ডেটাবেজ সংযোগ', 'Supabase Cloud Database Live Connection')}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {t('এখানে আপনার Supabase URL ও anon key সেভ করলে SQL এ পরিবর্তন করা পাসওয়ার্ড সাথে সাথে সিঙ্ক হবে।', 'Save your Supabase Project URL & Anon Key here to sync directly with Supabase SQL tables.')}
                      </p>
                    </div>
                  </div>
                  {getSupabaseCredentials().isConnected ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('কানেক্টেড (LIVE)', 'CONNECTED (LIVE)')}
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-1 rounded-full">
                      {t('কনফিগার করুন', 'NOT CONFIGURED')}
                    </span>
                  )}
                </div>

                {supabaseSavedSuccess && (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{t('Supabase ক্রেডেনশিয়ালস সফলভাবে কানেক্ট ও সেভ হয়েছে!', 'Supabase credentials connected and saved successfully!')}</span>
                  </div>
                )}

                <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {t('Supabase Project URL', 'Supabase Project URL')}
                      </label>
                      <input
                        type="url"
                        value={supabaseUrlInput}
                        onChange={(e) => setSupabaseUrlInput(e.target.value)}
                        placeholder="https://xyzcompany.supabase.co"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {t('Supabase Anon Public API Key', 'Supabase Anon Public API Key')}
                      </label>
                      <input
                        type="password"
                        value={supabaseKeyInput}
                        onChange={(e) => setSupabaseKeyInput(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-slate-400">
                      💡 {t('Supabase Dashboard -> Settings -> API থেকে URL ও anon key পাবেন।', 'Get URL and anon key from Supabase Dashboard -> Settings -> API.')}
                    </p>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t('কানেকশন সেভ করুন', 'Save Connection')}</span>
                    </button>
                  </div>
                </form>

                {/* Ready-to-run Separate Roles SQL Code Snippet */}
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <h5 className="font-bold text-xs text-white">
                          {t('আলাদা এডমিন ও মার্কেট ইউজার তৈরীর জন্য Supabase SQL কোড', 'SQL Script for Distinct Admin & Market Roles')}
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          {t('এই কোডটি Supabase SQL Editor এ পেস্ট করে Run করুন। এতে এডমিন ও মার্কেট পাসওয়ার্ড কখনোই একটি আরেকটিতে কাজ করবে না।', 'Run this in Supabase SQL Editor. Ensures Admin & Market passwords never overlap or conflict.')}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopySqlScript}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-amber-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {sqlCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{sqlCopied ? t('কপি হয়েছে!', 'Copied!') : t('SQL কোড কপি করুন', 'Copy SQL Script')}</span>
                    </button>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto whitespace-pre leading-relaxed select-all">
                    {supabaseSqlScript}
                  </div>
                </div>
              </div>

              {/* Security Shield Highlights */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  {t(
                    'সকল রোল ভেরিফিকেশন এবং পাসওয়ার্ড যাচাইকরণ সম্পূর্ণভাবে ডেটাবেজ ও সার্ভারে সম্পাদিত হয়।',
                    'All role verification and password comparisons are strictly executed via authenticated database/server verification.'
                  )}
                </span>
              </div>
            </div>
          )}

          {/* TAB: HERO BANNER CMS */}
          {activeTab === 'hero' && <HeroBannerEditorTab />}
        </div>
      </div>

      {/* Order Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/60 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                {t('অর্ডার রেকর্ড ডিলিট', 'Delete Order Record')}
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                {language === 'bn' ? (
                  <>
                    আপনি কি নিশ্চিত অর্ডার <strong className="text-amber-400 font-mono font-bold">#{orderToDelete.id}</strong> (গ্রাহক: {orderToDelete.customerName}) তালিকা থেকে ডিলিট করতে চান?
                  </>
                ) : (
                  <>
                    Are you sure you want to delete order record <strong className="text-amber-400 font-mono font-bold">#{orderToDelete.id}</strong> ({orderToDelete.customerName})?
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer border border-slate-700"
              >
                {t('বাতিল (Cancel)', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
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
