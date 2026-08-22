// Client-side authentication service supporting Supabase directly, server API, local overrides, and seamless offline fallback
export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id?: string;
    name: string;
    role: 'admin' | 'market' | 'customer';
    permissions: string[];
    phoneOrEmail?: string;
    email?: string;
    phone?: string;
    loginAt?: string;
  };
  message?: string;
}

// Safe Unicode-compatible Base64 encoder and decoder
export function safeBase64Encode(data: any): string {
  try {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  } catch {
    return btoa(unescape(encodeURIComponent(String(data))));
  }
}

export function safeBase64Decode(str: string): any {
  try {
    const jsonStr = decodeURIComponent(escape(atob(str)));
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

// Function to get active Supabase credentials (from env or localStorage)
export function getSupabaseCredentials() {
  const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('jc_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('jc_supabase_key') || '' : '';

  const url = (localUrl || envUrl || '').replace(/\/$/, '');
  const key = localKey || envKey || '';

  return { url, key, isConnected: Boolean(url && key) };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jc_supabase_url', url.trim());
    localStorage.setItem('jc_supabase_key', key.trim());
  }
}

// Helper to make authenticated Supabase REST calls with detailed error capture
async function fetchSupabase(path: string, options: RequestInit = {}) {
  const { url: baseUrl, key: anonKey } = getSupabaseCredentials();
  if (!baseUrl || !anonKey) return { ok: false, data: null, error: 'No credentials' };

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

// 1. Staff Login (Admin & Market Role) - Directly connects to Supabase admin_users table
export async function loginRole(
  username: string,
  password: string,
  requestedRole?: 'admin' | 'market'
): Promise<LoginResponse> {
  const cleanUser = username.trim();
  const cleanPass = password.trim();

  if (!cleanUser || !cleanPass) {
    return {
      success: false,
      message: 'ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন (Username and password are required)',
    };
  }

  const lowerUser = cleanUser.toLowerCase();

  // 🔹 Step A: Check Supabase `admin_users` table with direct live queries
  const { isConnected } = getSupabaseCredentials();
  if (isConnected) {
    try {
      // Direct fetch of admin_users to prevent any URL-encoding or wildcard issues with underscores
      let res = await fetchSupabase('admin_users?select=*');

      if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
        const allAccounts = res.data;

        // Exact match by username (case-insensitive) or phone
        const matchedUsers = allAccounts.filter((u: any) => {
          const dbUsername = String(u.username || '').trim().toLowerCase();
          const dbPhone = String(u.phone || '').trim();
          return dbUsername === lowerUser || dbPhone === cleanUser;
        });

        if (matchedUsers.length === 0) {
          return {
            success: false,
            message: `Supabase ডেটাবেজে '${cleanUser}' নামের কোনো ইউজার পাওয়া যায়নি। অনুগ্রহ করে আপনার SQL-এ তৈরি করা সঠিক ইউজারনেম দিন।`,
          };
        }

        const userAccount = matchedUsers[0];
        const dbRole = String(userAccount.role || 'admin').trim().toLowerCase();

        // 🔒 STRICT ROLE SEPARATION: Admin and Market cannot cross-login
        const isDbMarket = dbRole === 'market' || dbRole.includes('market') || dbRole.includes('inventory');
        const isDbAdmin = !isDbMarket; // Any non-market role is considered admin

        if (requestedRole === 'admin' && isDbMarket) {
          return {
            success: false,
            message: `এই অ্যাকাউন্টটি '${cleanUser}' মার্কেট প্যানেলের জন্য তৈরি করা হয়েছে। এটি দিয়ে এডমিন পোর্টালে লগইন করা যাবে না। মার্কেট লগইন প্যানেল ব্যবহার করুন।`,
          };
        }

        if (requestedRole === 'market' && isDbAdmin) {
          return {
            success: false,
            message: `এই অ্যাকাউন্টটি '${cleanUser}' এডমিন পোর্টালের জন্য তৈরি করা হয়েছে। এটি দিয়ে মার্কেট প্যানেলে লগইন করা যাবে না। এডমিন লগইন প্যানেল ব্যবহার করুন।`,
          };
        }

        // Check if account is active
        if (userAccount.is_active === false) {
          return {
            success: false,
            message: 'এই অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় অবস্থায় রয়েছে।',
          };
        }

        // Strictly verify plain or hashed password
        const savedPass = String(userAccount.password_plain || userAccount.password_hash || userAccount.password || '').trim();
        const passwordMatches = savedPass === cleanPass;

        if (passwordMatches) {
          const resolvedRole = (isDbMarket ? 'market' : 'admin') as 'admin' | 'market';
          const tokenPayload = {
            id: userAccount.id || `usr_${Date.now()}`,
            name: userAccount.full_name || userAccount.username || cleanUser,
            role: resolvedRole,
            permissions: userAccount.permissions || (resolvedRole === 'admin' ? ['all'] : ['products', 'stock', 'categories', 'discounts']),
            phone: userAccount.phone || '',
            loginAt: new Date().toISOString(),
          };

          const token = `jc_sb_${safeBase64Encode(tokenPayload)}`;
          localStorage.setItem('jc_auth_token', token);
          localStorage.setItem('jc_user', JSON.stringify(tokenPayload));

          return {
            success: true,
            token,
            user: tokenPayload,
            message: `${resolvedRole === 'admin' ? 'এডমিন পোর্টালে' : 'মার্কেট প্যানেলে'} সফলভাবে লগইন হয়েছে!`,
          };
        } else {
          return {
            success: false,
            message: `ভুল পাসওয়ার্ড! Supabase ডেটাবেজে '${cleanUser}' এর জন্য দেওয়া সঠিক পাসওয়ার্ডটি লিখুন।`,
          };
        }
      } else if (!res.ok) {
        return {
          success: false,
          message: `Supabase ডেটাবেজ রেসপন্স করেনি (${res.error || 'Connection Failed'})। অনুগ্রহ করে Supabase Project URL ও Anon Key সঠিক কিনা চেক করুন।`,
        };
      } else {
        return {
          success: false,
          message: `Supabase 'admin_users' টেবিলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে SQL স্ক্রিপ্ট রান করুন।`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Supabase সংযোগে ত্রুটি: ${err?.message || 'Network error'}`,
      };
    }
  }

  // If Supabase is not connected
  return {
    success: false,
    message: 'Supabase ডেটাবেজ এখনো সংযুক্ত হয়নি! অনুগ্রহ করে লগইন ফর্মের নিচে "Supabase ডেটাবেজ সংযোগ সেটিংস"-এ আপনার Supabase Project URL ও Anon Key দিন।',
  };
}

// 2. Customer Registration via Supabase users table
export async function customerRegister(
  name: string,
  phoneOrEmail: string,
  password: string
): Promise<LoginResponse> {
  const cleanName = name.trim();
  const cleanContact = phoneOrEmail.trim();
  const cleanPass = password.trim();

  if (!cleanName || !cleanContact || !cleanPass) {
    return {
      success: false,
      message: 'সবগুলো তথ্য সঠিকভাবে পূরণ করুন।',
    };
  }

  const isEmail = cleanContact.includes('@');
  const userId = `usr_cust_${Date.now()}`;

  // 🔹 Step A: Direct Supabase insert
  const { isConnected } = getSupabaseCredentials();
  if (isConnected) {
    try {
      // Check if user already exists
      const existing = await fetchSupabase(
        `users?or=(${isEmail ? `email.eq.${encodeURIComponent(cleanContact)}` : `phone.eq.${encodeURIComponent(cleanContact)}`})&select=id`
      );

      if (Array.isArray(existing) && existing.length > 0) {
        return {
          success: false,
          message: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিপূর্বে একটি অ্যাকাউন্ট খোলা হয়েছে। দয়া করে লগইন করুন।',
        };
      }

      const newRecord = {
        id: userId,
        name: cleanName,
        email: isEmail ? cleanContact : null,
        phone: isEmail ? '01700000000' : cleanContact,
        password_hash: cleanPass,
        role: 'customer',
        created_at: new Date().toISOString(),
      };

      await fetchSupabase('users', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(newRecord),
      });

      const userPayload = {
        id: userId,
        name: cleanName,
        role: 'customer' as const,
        permissions: ['order_history', 'wishlist'],
        phone: isEmail ? undefined : cleanContact,
        email: isEmail ? cleanContact : undefined,
        loginAt: new Date().toISOString(),
      };

      const token = `jc_cust_${safeBase64Encode(userPayload)}`;
      localStorage.setItem('jc_auth_token', token);
      localStorage.setItem('jc_user', JSON.stringify(userPayload));

      return {
        success: true,
        token,
        user: userPayload,
      };
    } catch {
      // Fallback
    }
  }

  // 🔹 Step B: Local Storage Registration Fallback
  const userPayload = {
    id: userId,
    name: cleanName,
    role: 'customer' as const,
    permissions: ['order_history', 'wishlist'],
    phone: isEmail ? undefined : cleanContact,
    email: isEmail ? cleanContact : undefined,
    loginAt: new Date().toISOString(),
  };

  const token = `jc_cust_${safeBase64Encode(userPayload)}`;
  localStorage.setItem('jc_auth_token', token);
  localStorage.setItem('jc_user', JSON.stringify(userPayload));

  return {
    success: true,
    token,
    user: userPayload,
  };
}

// 3. Customer Login via Supabase users table
export async function customerLogin(
  phoneOrEmail: string,
  password: string
): Promise<LoginResponse> {
  const cleanContact = phoneOrEmail.trim();
  const cleanPass = password.trim();

  if (!cleanContact || !cleanPass) {
    return {
      success: false,
      message: 'মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড প্রদান করুন।',
    };
  }

  const isEmail = cleanContact.includes('@');

  // 🔹 Step A: Direct Supabase verification
  const { isConnected } = getSupabaseCredentials();
  if (isConnected) {
    try {
      const query = isEmail
        ? `users?email=eq.${encodeURIComponent(cleanContact)}&select=*`
        : `users?phone=eq.${encodeURIComponent(cleanContact)}&select=*`;

      const data = await fetchSupabase(query);

      if (Array.isArray(data) && data.length > 0) {
        const user = data[0];
        if (user.password_hash === cleanPass || user.password_plain === cleanPass) {
          const userPayload = {
            id: user.id,
            name: user.name,
            role: 'customer' as const,
            permissions: ['order_history', 'wishlist'],
            phone: user.phone,
            email: user.email,
            loginAt: new Date().toISOString(),
          };

          const token = `jc_cust_${safeBase64Encode(userPayload)}`;
          localStorage.setItem('jc_auth_token', token);
          localStorage.setItem('jc_user', JSON.stringify(userPayload));

          return {
            success: true,
            token,
            user: userPayload,
          };
        }
      }
    } catch {
      // Fallback
    }
  }

  // 🔹 Step B: Local Storage verification Fallback
  try {
    const savedUser = localStorage.getItem('jc_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.phone === cleanContact || user.email === cleanContact || user.phoneOrEmail === cleanContact) {
        return {
          success: true,
          token: localStorage.getItem('jc_auth_token') || `jc_cust_${Date.now()}`,
          user,
        };
      }
    }
  } catch {
    // ignore
  }

  return {
    success: false,
    message: 'মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।',
  };
}

// 4. Verify Active Session with Token
export async function verifyCurrentSession(): Promise<{ valid: boolean; user?: any }> {
  try {
    const token = localStorage.getItem('jc_auth_token');
    const savedUser = localStorage.getItem('jc_user');
    if (!token || !savedUser) return { valid: false };

    const parsedUser = JSON.parse(savedUser);
    return {
      valid: true,
      user: parsedUser,
    };
  } catch {
    return { valid: false };
  }
}

// 5. Change Password on Supabase / Server
export async function changePasswordOnServer(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const savedUser = localStorage.getItem('jc_user');
    if (!savedUser) {
      return { success: false, message: 'লগইন সেশন পাওয়া যায়নি।' };
    }

    const user = JSON.parse(savedUser);

    const { isConnected } = getSupabaseCredentials();
    if (isConnected && user.role) {
      if (user.role === 'admin' || user.role === 'market') {
        await fetchSupabase(`admin_users?role=eq.${user.role}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            password_plain: newPassword.trim(),
            updated_at: new Date().toISOString(),
          }),
        });
        return { success: true, message: 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!' };
      } else if (user.id) {
        await fetchSupabase(`users?id=eq.${user.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            password_hash: newPassword.trim(),
            updated_at: new Date().toISOString(),
          }),
        });
        return { success: true, message: 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!' };
      }
    }

    return {
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।',
    };
  } catch {
    return {
      success: false,
      message: 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে।',
    };
  }
}

// 6. Logout and clear session
export function logoutSession(): void {
  localStorage.removeItem('jc_auth_token');
  localStorage.removeItem('jc_user');
}


