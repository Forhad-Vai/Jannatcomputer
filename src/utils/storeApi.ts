import { Product, FooterSettings, HeroBannerSettings, StorePolicySettings, Coupon, Order } from '../types';

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

// Fetch all persistent data from the backend server
export async function fetchStoreDataFromServer(): Promise<{
  success: boolean;
  persisted: boolean;
  data: StoreDatabasePayload | null;
  updatedAt?: string;
}> {
  try {
    const res = await fetch('/api/store/data', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) {
      return { success: false, persisted: false, data: null };
    }
    return await res.json();
  } catch (error) {
    console.warn('Could not connect to server database, using local storage:', error);
    return { success: false, persisted: false, data: null };
  }
}

// Debounce timer for server synchronization
let syncDebounceTimer: any = null;

// Synchronize changes to the backend server
export function syncStoreDataToServer(
  payload: StoreDatabasePayload,
  immediate: boolean = false
): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve) => {
    const performSync = async () => {
      try {
        const res = await fetch('/api/store/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        resolve(json);
      } catch (error: any) {
        console.warn('Server sync skipped/offline:', error);
        resolve({ success: false, message: error.message });
      }
    };

    if (immediate) {
      if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
      performSync();
    } else {
      if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
      syncDebounceTimer = setTimeout(performSync, 800);
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
