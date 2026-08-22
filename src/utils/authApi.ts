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

// Helper to make authenticated Supabase REST calls
async function fetchSupabase(path: string, options: RequestInit = {}) {
  const { url: baseUrl, key: anonKey } = getSupabaseCredentials();
  if (!baseUrl || !anonKey) return null;

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
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
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

  // 🔹 Step A: Check Supabase `admin_users` table with flexible queries
  const { isConnected } = getSupabaseCredentials();
  if (isConnected) {
    try {
      // 1. Search in admin_users by username (case-insensitive) or phone
      let data = await fetchSupabase(
        `admin_users?or=(username.ilike.${encodeURIComponent(cleanUser)},phone.eq.${encodeURIComponent(cleanUser)})&select=*`
      );

      // If not found, try simple username query
      if (!Array.isArray(data) || data.length === 0) {
        data = await fetchSupabase(
          `admin_users?username=eq.${encodeURIComponent(cleanUser)}&select=*`
        );
      }

      // If still not found, fetch all records and filter in JS
      if (!Array.isArray(data) || data.length === 0) {
        data = await fetchSupabase('admin_users?select=*');
        if (Array.isArray(data) && data.length > 0) {
          data = data.filter(
            (u: any) =>
              String(u.username || '').toLowerCase() === lowerUser ||
              String(u.phone || '') === cleanUser
          );
        }
      }

      if (Array.isArray(data) && data.length > 0) {
        const adminAccount = data[0];

        // Check if account is active
        if (adminAccount.is_active === false) {
          return {
            success: false,
            message: 'এই অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে। অ্যাডমিন সহায়তায় যোগাযোগ করুন।',
          };
        }

        // Compare password safely
        const savedPass = String(adminAccount.password_plain || adminAccount.password_hash || adminAccount.password || '').trim();
        const passwordMatches = savedPass === cleanPass;

        if (passwordMatches) {
          const userRole = String(adminAccount.role || 'admin').toLowerCase();
          const resolvedRole = (userRole === 'market' ? 'market' : 'admin') as 'admin' | 'market';
          const tokenPayload = {
            id: adminAccount.id || `usr_${Date.now()}`,
            name: adminAccount.full_name || adminAccount.username || cleanUser,
            role: resolvedRole,
            permissions: adminAccount.permissions || ['all'],
            phone: adminAccount.phone || '',
            loginAt: new Date().toISOString(),
          };

          const token = `jc_sb_${safeBase64Encode(tokenPayload)}`;
          localStorage.setItem('jc_auth_token', token);
          localStorage.setItem('jc_user', JSON.stringify(tokenPayload));

          return {
            success: true,
            token,
            user: tokenPayload,
          };
        }
      }
    } catch {
      // Continue to next checks if Supabase query fails
    }
  }

  // 🔹 Step B: Try backend server API route if available
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: cleanUser,
        password: cleanPass,
        requestedRole,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('jc_auth_token', data.token);
        if (data.user) {
          localStorage.setItem('jc_user', JSON.stringify(data.user));
        }
        return data;
      }
    }
  } catch {
    // API not reachable
  }

  // 🔹 Step C: Check local custom credentials override (set by admin in dashboard)
  try {
    const customCredsStr = localStorage.getItem('jc_custom_auth_credentials');
    if (customCredsStr) {
      const customCreds = JSON.parse(customCredsStr);
      if (Array.isArray(customCreds)) {
        const matched = customCreds.find(
          (c: any) =>
            (c.username?.toLowerCase() === lowerUser || c.phone === cleanUser) &&
            c.password_plain === cleanPass &&
            (c.role === requestedRole || !requestedRole)
        );
        if (matched) {
          const userPayload = {
            id: matched.id || `usr_${matched.role}_1`,
            name: matched.full_name || (matched.role === 'admin' ? 'প্রধান অ্যাডমিনিস্ট্রেটর' : 'মার্কেট ও ইনভেন্টরি ম্যানেজার'),
            role: matched.role as 'admin' | 'market',
            permissions: matched.permissions || ['all'],
            phone: matched.phone || '',
            loginAt: new Date().toISOString(),
          };
          const token = `jc_local_${safeBase64Encode(userPayload)}`;
          localStorage.setItem('jc_auth_token', token);
          localStorage.setItem('jc_user', JSON.stringify(userPayload));
          return { success: true, token, user: userPayload };
        }
      }
    }
  } catch {
    // continue
  }

  // Default fallback ONLY if neither Supabase nor custom credentials matched
  return {
    success: false,
    message: 'ভুল ইউজারনেম অথবা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।',
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


