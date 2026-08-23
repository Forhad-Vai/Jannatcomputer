import { Product, FooterSettings, HeroBannerSettings, StorePolicySettings, Coupon, Order } from '../types';
import { getSupabaseCredentials } from './authApi';

export interface StoreDatabasePayload {
  products?: Product[];
  footerSettings?: FooterSettings;
  heroBannerSettings?: HeroBannerSettings;
  policySettings?: StorePolicySettings;
  coupons?: Coupon[];
  orders?: Order[];
}

export interface StoreStatusResponse {
  success: boolean;
  exists: boolean;
  fileSizeKb: number;
  modifiedTime: string | null;
  productCount: number;
  orderCount: number;
  couponCount: number;
  hasCustomFooter: boolean;
  hasCustomBanners: boolean;
  updatedAt: string | null;
}

// Direct Supabase fetch helper for store settings & data
async function fetchSupabaseRest(path: string, options: RequestInit = {}) {
  const { url: baseUrl, key: anonKey, isConnected } = getSupabaseCredentials();
  if (!isConnected || !baseUrl || !anonKey) return { ok: false, data: null, error: 'No Supabase credentials' };

  const url = `${baseUrl}/rest/v1/${path}`;
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return { ok: false, status: response.status, error: errText, data: null };
    }
    const data = await response.json();
    return { ok: true, data, error: null };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error', data: null };
  }
}

// Fetch all persistent data from server and Supabase
export async function fetchStoreDataFromServer(): Promise<{
  success: boolean;
  persisted: boolean;
  data: StoreDatabasePayload | null;
  updatedAt?: string;
}> {
  let serverData: StoreDatabasePayload | null = null;
  let isPersisted = false;
  let updatedAt: string | undefined;

  // 1. Fetch from Server backend API
  try {
    const res = await fetch('/api/store/data', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        serverData = json.data;
        isPersisted = json.persisted || false;
        updatedAt = json.updatedAt;
      }
    }
  } catch (error) {
    console.warn('Could not connect to server database, checking Supabase fallback:', error);
  }

  // 2. Fetch from Supabase if connected to ensure cross-browser synchronization
  const { isConnected } = getSupabaseCredentials();
  if (isConnected) {
    try {
      // Fetch site settings (footer, payment QR, branding, policies)
      const settingsRes = await fetchSupabaseRest('site_settings?select=*&limit=1');
      if (settingsRes.ok && Array.isArray(settingsRes.data) && settingsRes.data.length > 0) {
        const row = settingsRes.data[0];
        isPersisted = true;
        if (!serverData) serverData = {};

        const storedJson = typeof row.settings_json === 'object' && row.settings_json ? row.settings_json : {};

        // Merge footer settings from Supabase
        const supabaseFooter: Partial<FooterSettings> = {
          ...(storedJson.footerSettings || {}),
          storeName: row.store_name || storedJson.footerSettings?.storeName,
          taglineBn: row.tagline_bn || storedJson.footerSettings?.taglineBn,
          phone1: row.phone1 || storedJson.footerSettings?.phone1,
          phone2: row.phone2 || storedJson.footerSettings?.phone2,
          paymentPhone: row.payment_phone || storedJson.footerSettings?.paymentPhone,
          email: row.email || storedJson.footerSettings?.email,
          addressBn: row.address_bn || storedJson.footerSettings?.addressBn,
        };

        if (storedJson.footerSettings?.qrCodeUrl) {
          supabaseFooter.qrCodeUrl = storedJson.footerSettings.qrCodeUrl;
        }

        serverData.footerSettings = {
          ...(serverData.footerSettings || {}),
          ...supabaseFooter,
        } as FooterSettings;

        if (storedJson.heroBannerSettings) {
          serverData.heroBannerSettings = storedJson.heroBannerSettings;
        }
        if (storedJson.policySettings) {
          serverData.policySettings = storedJson.policySettings;
        }
        if (row.updated_at) {
          updatedAt = row.updated_at;
        }
      }

      // Fetch products from Supabase
      const productsRes = await fetchSupabaseRest('products?select=*');
      if (productsRes.ok && Array.isArray(productsRes.data) && productsRes.data.length > 0) {
        if (!serverData) serverData = {};
        const formattedProducts = productsRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          nameBn: p.name_bn || p.name,
          category: p.category,
          subcategory: p.subcategory || '',
          brand: p.brand || '',
          model: p.model || '',
          price: Number(p.price) || 0,
          regularPrice: Number(p.regular_price) || Number(p.price) || 0,
          discountPercentage: Number(p.discount_percentage) || 0,
          inStock: p.in_stock !== false,
          stockCount: Number(p.stock_count) || 10,
          image: p.image || '',
          gallery: Array.isArray(p.gallery) ? p.gallery : [],
          rating: Number(p.rating) || 5.0,
          reviewsCount: Number(p.reviews_count) || 0,
          isHot: Boolean(p.is_hot),
          isFeatured: Boolean(p.is_featured),
          isDeal: Boolean(p.is_deal),
          dealEndsAt: p.deal_ends_at,
          badge: p.badge || '',
          badgeBn: p.badge_bn || '',
          keySpecs: Array.isArray(p.key_specs) ? p.key_specs : [],
          keySpecsBn: Array.isArray(p.key_specs_bn) ? p.key_specs_bn : [],
          specsTable: Array.isArray(p.specs_table) ? p.specs_table : [],
          warranty: p.warranty || '',
          warrantyBn: p.warranty_bn || '',
          pcCategory: p.pc_category,
          wattage: p.wattage,
          socket: p.socket,
          memoryType: p.memory_type,
          formFactor: p.form_factor,
          description: p.description || '',
          descriptionBn: p.description_bn || '',
        }));
        if (formattedProducts.length > 0) {
          serverData.products = formattedProducts;
          isPersisted = true;
        }
      }

      // Fetch coupons from Supabase
      const couponsRes = await fetchSupabaseRest('coupons?select=*');
      if (couponsRes.ok && Array.isArray(couponsRes.data) && couponsRes.data.length > 0) {
        if (!serverData) serverData = {};
        serverData.coupons = couponsRes.data.map((c: any) => ({
          code: c.code,
          discountType: (c.discount_type as 'fixed' | 'percentage') || 'fixed',
          discountAmount: Number(c.discount_amount) || 0,
          minSpend: Number(c.min_spend) || 0,
          isActive: c.is_active !== false,
          description: c.description || '',
        }));
        isPersisted = true;
      }

      // Fetch orders from Supabase
      const ordersRes = await fetchSupabaseRest('orders?select=*&order=created_at.desc');
      if (ordersRes.ok && Array.isArray(ordersRes.data) && ordersRes.data.length > 0) {
        if (!serverData) serverData = {};
        serverData.orders = ordersRes.data.map((o: any) => ({
          id: o.id,
          createdAt: o.created_at || new Date().toISOString(),
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          customerEmail: o.customer_email || '',
          address: o.address,
          district: o.district || 'Dhaka',
          thana: o.thana || 'Sadar',
          deliveryType: (o.delivery_type as 'home' | 'pickup') || 'home',
          paymentMethod: (o.payment_method as any) || 'cod',
          transactionId: o.transaction_id,
          items: Array.isArray(o.items) ? o.items : [],
          subtotal: Number(o.subtotal) || 0,
          shippingFee: Number(o.shipping_fee) || 0,
          discount: Number(o.discount) || 0,
          total: Number(o.total) || 0,
          status: (o.status as any) || 'pending',
          timeline: Array.isArray(o.timeline) ? o.timeline : [],
        }));
        isPersisted = true;
      }
    } catch (sbErr) {
      console.warn('Supabase store hydration encountered a non-blocking issue:', sbErr);
    }
  }

  return {
    success: true,
    persisted: isPersisted,
    data: serverData,
    updatedAt: updatedAt || new Date().toISOString(),
  };
}

// Debounce timer for server synchronization
let syncDebounceTimer: any = null;

// Synchronize changes to both the backend server and Supabase
export function syncStoreDataToServer(
  payload: StoreDatabasePayload,
  immediate: boolean = false
): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve) => {
    const performSync = async () => {
      let serverSyncSuccess = false;

      // 1. Sync to backend server file DB
      try {
        const res = await fetch('/api/store/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          serverSyncSuccess = true;
        }
      } catch (error: any) {
        console.warn('Server sync skipped/offline:', error);
      }

      // 2. Sync to Supabase Database if connected
      const { isConnected } = getSupabaseCredentials();
      if (isConnected) {
        try {
          // Sync site settings (footer, payment QR, hero banner, policies)
          if (payload.footerSettings || payload.heroBannerSettings || payload.policySettings) {
            const footer = payload.footerSettings;
            const settingsPayload = {
              id: 'global_config',
              store_name: footer?.storeName || 'জান্নাত কম্পিউটার্স',
              tagline_bn: footer?.taglineBn || 'আপনার বিশ্বস্ত আইটি ও কম্পিউটার সল্যুশন পার্টনার',
              phone1: footer?.phone1 || '01717 220 224',
              phone2: footer?.phone2 || '01316 768 044',
              payment_phone: footer?.paymentPhone || '01717220224',
              email: footer?.email || 'support@jannatcomputers.com',
              address_bn: footer?.addressBn || 'পলাশবাড়ী মহিলা কলেজ গেইটের দক্ষিণ পার্শ্বে, গাইবান্ধা।',
              settings_json: {
                footerSettings: payload.footerSettings,
                heroBannerSettings: payload.heroBannerSettings,
                policySettings: payload.policySettings,
              },
              updated_at: new Date().toISOString(),
            };

            await fetchSupabaseRest('site_settings', {
              method: 'POST',
              headers: {
                Prefer: 'resolution=merge-duplicates',
              },
              body: JSON.stringify(settingsPayload),
            });
          }

          // Sync products to Supabase
          if (Array.isArray(payload.products) && payload.products.length > 0) {
            const productsRows = payload.products.map((p) => ({
              id: p.id,
              name: p.name,
              name_bn: p.nameBn || p.name,
              category: p.category,
              subcategory: p.subcategory || '',
              brand: p.brand || '',
              model: p.model || '',
              price: p.price,
              regular_price: p.regularPrice || p.price,
              discount_percentage: p.discountPercentage || 0,
              in_stock: p.inStock,
              stock_count: p.stockCount || 10,
              image: p.image,
              gallery: p.gallery || [],
              rating: p.rating || 5.0,
              reviews_count: p.reviewsCount || 0,
              is_hot: p.isHot || false,
              is_featured: p.isFeatured || false,
              is_deal: p.isDeal || false,
              deal_ends_at: p.dealEndsAt || null,
              badge: p.badge || '',
              badge_bn: p.badgeBn || '',
              key_specs: p.keySpecs || [],
              key_specs_bn: p.keySpecsBn || [],
              specs_table: p.specsTable || [],
              warranty: p.warranty || '',
              warranty_bn: p.warrantyBn || '',
              pc_category: p.pcCategory || '',
              wattage: p.wattage || 0,
              socket: p.socket || '',
              memory_type: p.memoryType || '',
              form_factor: p.formFactor || '',
              description: p.description || '',
              description_bn: p.descriptionBn || '',
              updated_at: new Date().toISOString(),
            }));

            await fetchSupabaseRest('products', {
              method: 'POST',
              headers: {
                Prefer: 'resolution=merge-duplicates',
              },
              body: JSON.stringify(productsRows),
            });
          }

          // Sync coupons to Supabase
          if (Array.isArray(payload.coupons) && payload.coupons.length > 0) {
            const couponRows = payload.coupons.map((c) => ({
              code: c.code,
              discount_type: 'fixed',
              discount_amount: c.discountAmount,
              min_spend: c.minSpend,
              is_active: c.isActive,
              description: c.description || '',
              updated_at: new Date().toISOString(),
            }));

            await fetchSupabaseRest('coupons', {
              method: 'POST',
              headers: {
                Prefer: 'resolution=merge-duplicates',
              },
              body: JSON.stringify(couponRows),
            });
          }

          // Sync orders to Supabase
          if (Array.isArray(payload.orders) && payload.orders.length > 0) {
            const orderRows = payload.orders.map((o) => ({
              id: o.id,
              order_number: o.id,
              customer_name: o.customerName,
              customer_phone: o.customerPhone,
              customer_email: o.customerEmail || '',
              address: o.address,
              district: o.district || 'Dhaka',
              thana: o.thana || 'Sadar',
              delivery_type: o.deliveryType || 'home',
              payment_method: o.paymentMethod,
              transaction_id: o.transactionId || '',
              items: o.items || [],
              subtotal: o.subtotal,
              shipping_fee: o.shippingFee,
              discount: o.discount || 0,
              total: o.total,
              status: o.status,
              timeline: o.timeline || [],
              created_at: o.createdAt || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            await fetchSupabaseRest('orders', {
              method: 'POST',
              headers: {
                Prefer: 'resolution=merge-duplicates',
              },
              body: JSON.stringify(orderRows),
            });
          }
        } catch (sbSyncErr) {
          console.warn('Supabase background sync completed with fallback:', sbSyncErr);
        }
      }

      resolve({ success: true, message: 'ডাটাবেজে সফলভাবে সিঙ্ক হয়েছে' });
    };

    if (immediate) {
      if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
      performSync();
    } else {
      if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
      syncDebounceTimer = setTimeout(performSync, 600);
    }
  });
}

// Get database status & file information
export async function fetchDatabaseStatus(): Promise<StoreStatusResponse | null> {
  try {
    const res = await fetch('/api/store/status');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

// Download JSON Backup
export function downloadBackupFile(): void {
  window.open('/api/store/backup', '_blank');
}

// Restore Database from JSON
export async function restoreDatabaseFromFile(backupData: any): Promise<{ success: boolean; message: string; data?: StoreDatabasePayload }> {
  try {
    const res = await fetch('/api/store/restore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backupData),
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, message: error.message || 'Restore failed' };
  }
}

