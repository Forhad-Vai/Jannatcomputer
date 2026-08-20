// Client-side authentication service (Zero hardcoded credentials in source code)
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

// 1. Staff Login (Admin & Market Role)
export async function loginRole(
  username: string,
  password: string,
  requestedRole?: 'admin' | 'market'
): Promise<LoginResponse> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.trim(),
        password: password,
        requestedRole,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success && data.token) {
      localStorage.setItem('jc_auth_token', data.token);
      return data;
    }

    return {
      success: false,
      message: data.message || 'ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।',
    };
  } catch {
    return {
      success: false,
      message: 'সার্ভার সংযোগে ত্রুটি। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।',
    };
  }
}

// 2. Customer Registration via Server (PBKDF2 Hash)
export async function customerRegister(
  name: string,
  phoneOrEmail: string,
  password: string
): Promise<LoginResponse> {
  try {
    const res = await fetch('/api/auth/customer/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        phoneOrEmail: phoneOrEmail.trim(),
        password,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success && data.token) {
      localStorage.setItem('jc_auth_token', data.token);
      return data;
    }

    return {
      success: false,
      message: data.message || 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।',
    };
  } catch {
    return {
      success: false,
      message: 'সার্ভার সংযোগে ত্রুটি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
    };
  }
}

// 3. Customer Login via Server (Salted PBKDF2 verification)
export async function customerLogin(
  phoneOrEmail: string,
  password: string
): Promise<LoginResponse> {
  try {
    const res = await fetch('/api/auth/customer/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneOrEmail: phoneOrEmail.trim(),
        password,
      }),
    });

    const data = await res.json();

    if (res.ok && data.success && data.token) {
      localStorage.setItem('jc_auth_token', data.token);
      return data;
    }

    return {
      success: false,
      message: data.message || 'মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।',
    };
  } catch {
    return {
      success: false,
      message: 'সার্ভার সংযোগে ত্রুটি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
    };
  }
}

// 4. Verify Active Session with Server
export async function verifyCurrentSession(): Promise<{ valid: boolean; user?: any }> {
  try {
    const token = localStorage.getItem('jc_auth_token');
    if (!token) return { valid: false };

    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      localStorage.removeItem('jc_auth_token');
      return { valid: false };
    }

    const data = await res.json();
    return data;
  } catch {
    return { valid: false };
  }
}

// 5. Change Password on Server
export async function changePasswordOnServer(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = localStorage.getItem('jc_auth_token');
    if (!token) {
      return { success: false, message: 'লগইন সেশন পাওয়া যায়নি।' };
    }

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    return {
      success: Boolean(res.ok && data.success),
      message: data.message || 'পাসওয়ার্ড পরিবর্তন করা সম্ভব হয়নি।',
    };
  } catch {
    return {
      success: false,
      message: 'সার্ভার সংযোগে ত্রুটি হয়েছে।',
    };
  }
}

// 6. Logout and clear session
export function logoutSession(): void {
  localStorage.removeItem('jc_auth_token');
  localStorage.removeItem('jc_user');
}
