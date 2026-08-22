import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// HMAC signing secret (kept strictly on server)
const AUTH_SECRET = process.env.AUTH_SECRET_KEY || 'jannat_secure_jwt_session_secret_key_2026_gaibandha';

// -------------------------------------------------------------
// Cryptographic Password Hashing & Salt Utilities (PBKDF2)
// -------------------------------------------------------------
interface PasswordRecord {
  salt: string;
  hash: string;
}

function hashPassword(password: string, existingSalt?: string): PasswordRecord {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  const computedBuffer = Buffer.from(computedHash, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  if (computedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(computedBuffer, expectedBuffer);
}

// -------------------------------------------------------------
// Server-Side Role-Based Credential Store (InMemory + Env)
// Passwords are stored ONLY as salted cryptographic hashes
// -------------------------------------------------------------
const initialAdminPass = process.env.ADMIN_PASSWORD || 'admin123';
const initialMarketPass = process.env.MARKET_PASSWORD || 'market123';

const SERVER_ROLES_STORE = {
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    ...hashPassword(initialAdminPass),
    name: 'Jannat Super Admin',
    role: 'admin' as const,
    permissions: ['all', 'orders', 'coupons', 'footer', 'reports', 'settings', 'market'],
  },
  market: {
    username: process.env.MARKET_USERNAME || 'market',
    ...hashPassword(initialMarketPass),
    name: 'Jannat Inventory & Market Admin',
    role: 'market' as const,
    permissions: ['products', 'stock', 'categories', 'discounts'],
  },
};

// Customer Account Store (Salted & Hashed passwords on server)
interface CustomerRecord {
  id: string;
  name: string;
  phoneOrEmail: string;
  salt: string;
  hash: string;
  createdAt: string;
  role: 'customer';
  permissions: string[];
}

const CUSTOMER_STORE = new Map<string, CustomerRecord>();

// Pre-populate with a demo customer if needed
const demoCustPass = hashPassword('customer123');
CUSTOMER_STORE.set('01700000000', {
  id: 'cust-demo-1',
  name: 'আহমেদ হাসান',
  phoneOrEmail: '01700000000',
  salt: demoCustPass.salt,
  hash: demoCustPass.hash,
  createdAt: new Date().toISOString(),
  role: 'customer',
  permissions: ['view_orders', 'place_orders', 'wishlist'],
});

// -------------------------------------------------------------
// Rate Limiting & Anti-Brute-Force Protection
// -------------------------------------------------------------
interface AttemptRecord {
  count: number;
  blockedUntil: number;
}
const loginAttempts = new Map<string, AttemptRecord>();

function checkRateLimit(ip: string): { allowed: boolean; remainingSec?: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (attempt && attempt.blockedUntil > now) {
    return {
      allowed: false,
      remainingSec: Math.ceil((attempt.blockedUntil - now) / 1000),
    };
  }

  if (attempt && attempt.blockedUntil <= now && attempt.count >= 5) {
    // Reset after block expires
    loginAttempts.delete(ip);
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const current = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  current.count += 1;

  if (current.count >= 5) {
    // Block for 5 minutes after 5 consecutive failed attempts
    current.blockedUntil = now + 5 * 60 * 1000;
  }

  loginAttempts.set(ip, current);
}

function recordSuccessfulLogin(ip: string) {
  loginAttempts.delete(ip);
}

// -------------------------------------------------------------
// Cryptographic Token Signing & Verification (HS256 HMAC)
// -------------------------------------------------------------
interface TokenPayload {
  role: 'admin' | 'market' | 'customer';
  username: string;
  name: string;
  id?: string;
  iat?: number;
  exp?: number;
}

function generateSecureToken(payload: TokenPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, // 14 days session
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

function verifySecureToken(token: string): { valid: boolean; payload?: TokenPayload } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };

    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false };
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as TokenPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false }; // Token expired
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Staff Login (Admin & Market Roles)
app.post('/api/auth/login', (req: Request, res: Response): void => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const { allowed, remainingSec } = checkRateLimit(clientIp);

  if (!allowed) {
    res.status(429).json({
      success: false,
      message: `অনেকবার ভুল চেষ্টার কারণে একাউন্ট সাময়িকভাবে লক হয়েছে। অনুগ্রহ করে ${remainingSec} সেকেন্ড পর চেষ্টা করুন।`,
    });
    return;
  }

  const { username, password, requestedRole } = req.body;

  if (!username || !password) {
    res.status(400).json({
      success: false,
      message: 'ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন (Username and password are required)',
    });
    return;
  }

  const cleanUser = String(username).trim();
  let matchedUser: (typeof SERVER_ROLES_STORE)[keyof typeof SERVER_ROLES_STORE] | null = null;

  if (requestedRole === 'admin') {
    const admin = SERVER_ROLES_STORE.admin;
    if (cleanUser === admin.username && verifyPassword(password, admin.salt, admin.hash)) {
      matchedUser = admin;
    }
  } else if (requestedRole === 'market') {
    const market = SERVER_ROLES_STORE.market;
    if (cleanUser === market.username && verifyPassword(password, market.salt, market.hash)) {
      matchedUser = market;
    }
  } else {
    // Scan roles
    if (cleanUser === SERVER_ROLES_STORE.admin.username && verifyPassword(password, SERVER_ROLES_STORE.admin.salt, SERVER_ROLES_STORE.admin.hash)) {
      matchedUser = SERVER_ROLES_STORE.admin;
    } else if (cleanUser === SERVER_ROLES_STORE.market.username && verifyPassword(password, SERVER_ROLES_STORE.market.salt, SERVER_ROLES_STORE.market.hash)) {
      matchedUser = SERVER_ROLES_STORE.market;
    }
  }

  if (!matchedUser) {
    recordFailedAttempt(clientIp);
    res.status(401).json({
      success: false,
      message: 'ভুল ইউজারনেম অথবা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।',
    });
    return;
  }

  recordSuccessfulLogin(clientIp);

  const token = generateSecureToken({
    role: matchedUser.role,
    username: matchedUser.username,
    name: matchedUser.name,
  });

  res.json({
    success: true,
    token,
    user: {
      name: matchedUser.name,
      role: matchedUser.role,
      permissions: matchedUser.permissions,
      loginAt: new Date().toISOString(),
    },
    message: `${matchedUser.role === 'admin' ? 'এডমিন পোর্টাল' : 'মার্কেট প্যানেল'} এ সফলভাবে লগইন হয়েছে!`,
  });
});

// 3. Customer Registration Endpoint (Salted PBKDF2 hash on server)
app.post('/api/auth/customer/register', (req: Request, res: Response): void => {
  const { name, phoneOrEmail, password } = req.body;

  if (!name || !phoneOrEmail || !password) {
    res.status(400).json({
      success: false,
      message: 'নাম, মোবাইল/ইমেইল এবং পাসওয়ার্ড আবশ্যক।',
    });
    return;
  }

  const cleanIdentifier = String(phoneOrEmail).trim().toLowerCase();

  if (CUSTOMER_STORE.has(cleanIdentifier)) {
    res.status(409).json({
      success: false,
      message: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিপূর্বেই একটি একাউন্ট খোলা হয়েছে। অনুগ্রহ করে লগইন করুন।',
    });
    return;
  }

  const { salt, hash } = hashPassword(password);
  const newCustomer: CustomerRecord = {
    id: `cust-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    name: String(name).trim(),
    phoneOrEmail: cleanIdentifier,
    salt,
    hash,
    createdAt: new Date().toISOString(),
    role: 'customer',
    permissions: ['view_orders', 'place_orders', 'wishlist'],
  };

  CUSTOMER_STORE.set(cleanIdentifier, newCustomer);

  const token = generateSecureToken({
    role: 'customer',
    username: cleanIdentifier,
    name: newCustomer.name,
    id: newCustomer.id,
  });

  res.json({
    success: true,
    token,
    user: {
      id: newCustomer.id,
      name: newCustomer.name,
      phoneOrEmail: newCustomer.phoneOrEmail,
      role: 'customer',
      permissions: newCustomer.permissions,
    },
    message: 'সফলভাবে নতুন কাস্টমার একাউন্ট তৈরি হয়েছে!',
  });
});

// 4. Customer Login Endpoint (Verified on server)
app.post('/api/auth/customer/login', (req: Request, res: Response): void => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const { allowed, remainingSec } = checkRateLimit(clientIp);

  if (!allowed) {
    res.status(429).json({
      success: false,
      message: `অনেকবার ভুল চেষ্টার কারণে সাময়িক লক। অনুগ্রহ করে ${remainingSec} সেকেন্ড পর চেষ্টা করুন।`,
    });
    return;
  }

  const { phoneOrEmail, password } = req.body;

  if (!phoneOrEmail || !password) {
    res.status(400).json({
      success: false,
      message: 'মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড প্রদান করুন।',
    });
    return;
  }

  const cleanIdentifier = String(phoneOrEmail).trim().toLowerCase();
  const customer = CUSTOMER_STORE.get(cleanIdentifier);

  if (!customer || !verifyPassword(password, customer.salt, customer.hash)) {
    recordFailedAttempt(clientIp);
    res.status(401).json({
      success: false,
      message: 'ভুল মোবাইল নম্বর/ইমেইল বা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিন।',
    });
    return;
  }

  recordSuccessfulLogin(clientIp);

  const token = generateSecureToken({
    role: 'customer',
    username: cleanIdentifier,
    name: customer.name,
    id: customer.id,
  });

  res.json({
    success: true,
    token,
    user: {
      id: customer.id,
      name: customer.name,
      phoneOrEmail: customer.phoneOrEmail,
      role: 'customer',
      permissions: customer.permissions,
    },
    message: 'গ্রাহক একাউন্টে সফলভাবে লগইন হয়েছে!',
  });
});

// 5. Verify Session Token
app.post('/api/auth/verify', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.body.token;

  if (!token) {
    res.status(401).json({ valid: false, message: 'No token provided' });
    return;
  }

  const { valid, payload } = verifySecureToken(token);

  if (!valid || !payload) {
    res.status(401).json({ valid: false, message: 'Invalid or expired session token' });
    return;
  }

  if (payload.role === 'admin' || payload.role === 'market') {
    const roleConfig = SERVER_ROLES_STORE[payload.role];
    res.json({
      valid: true,
      user: {
        name: payload.name || (roleConfig ? roleConfig.name : 'Authorized User'),
        role: payload.role,
        permissions: roleConfig ? roleConfig.permissions : [],
      },
    });
  } else {
    // Customer session
    res.json({
      valid: true,
      user: {
        name: payload.name,
        role: 'customer',
        phoneOrEmail: payload.username,
        permissions: ['view_orders', 'place_orders', 'wishlist'],
      },
    });
  }
});

// 6. Admin / Staff Change Password Endpoint (Server-Side)
app.post('/api/auth/change-password', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : req.body.token;

  if (!token) {
    res.status(401).json({ success: false, message: 'অননুমোদিত রিকোয়েস্ট (Unauthorized)' });
    return;
  }

  const { valid, payload } = verifySecureToken(token);
  if (!valid || !payload || (payload.role !== 'admin' && payload.role !== 'market')) {
    res.status(403).json({ success: false, message: 'পাসওয়ার্ড পরিবর্তনের অনুমতি নেই।' });
    return;
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({
      success: false,
      message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
    });
    return;
  }

  const roleKey = payload.role;
  const roleObj = SERVER_ROLES_STORE[roleKey];

  if (!verifyPassword(currentPassword, roleObj.salt, roleObj.hash)) {
    res.status(400).json({
      success: false,
      message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।',
    });
    return;
  }

  const updatedHash = hashPassword(newPassword);
  roleObj.salt = updatedHash.salt;
  roleObj.hash = updatedHash.hash;

  res.json({
    success: true,
    message: `${roleKey === 'admin' ? 'এডমিন' : 'মার্কেট'} পাসওয়ার্ড সফলভাবে পরিবর্তিত ও সার্ভারে হ্যাশ করা হয়েছে!`,
  });
});

// -------------------------------------------------------------
// 7. Gemini AI Consultant Endpoint
// -------------------------------------------------------------
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

app.post('/api/ai/advisor', async (req: Request, res: Response): Promise<void> => {
  try {
    const { budget, purpose, customPrompt, language = 'bn' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        success: false,
        fallback: true,
        message: 'Gemini API not configured, fallback handled',
      });
      return;
    }

    const prompt = `You are the lead PC hardware consultant at "Jannat Computers" in Bangladesh.
A customer has a budget of ৳${budget} BDT for ${purpose} usage.
Additional preferences: ${customPrompt || 'None'}.
Recommend the best custom PC build available in Bangladesh with genuine parts (AMD/Intel CPU, Motherboard, RAM, GPU, SSD, PSU, Casing, Cooler).
Language response required: ${language === 'bn' ? 'Bangla' : 'English'}.
Provide:
1. Rig Title
2. Short explanation of why this configuration excels
3. Detailed component spec list
4. Estimated total in BDT`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// 8. Server-Side Persistent Store Database Engine (Durable File DB)
// Ensures products, orders, banners, policies, and QR settings
// NEVER reset or revert to default, even across browsers or restarts.
// -------------------------------------------------------------
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'store_database.json');
const DB_BACKUP_FILE = path.join(DB_DIR, 'store_database.backup.json');

function ensureDbDirectory(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

interface PersistentStoreDatabase {
  products?: any[];
  footerSettings?: any;
  heroBannerSettings?: any;
  policySettings?: any;
  coupons?: any[];
  orders?: any[];
  updatedAt?: string;
  version?: string;
}

function loadPersistedDatabase(): PersistentStoreDatabase | null {
  try {
    ensureDbDirectory();
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading store database file:', err);
    // If primary is corrupted, try reading backup
    try {
      if (fs.existsSync(DB_BACKUP_FILE)) {
        const backupRaw = fs.readFileSync(DB_BACKUP_FILE, 'utf-8');
        return JSON.parse(backupRaw);
      }
    } catch {
      // ignore
    }
  }
  return null;
}

function savePersistedDatabase(data: PersistentStoreDatabase): boolean {
  try {
    ensureDbDirectory();
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
      version: '2026.1.0',
    };
    const jsonStr = JSON.stringify(payload, null, 2);

    // Save backup first if main exists
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, DB_BACKUP_FILE);
      } catch {
        // ignore
      }
    }

    // Atomic write to temporary file then rename
    const tempFile = path.join(DB_DIR, `store_temp_${Date.now()}.json`);
    fs.writeFileSync(tempFile, jsonStr, 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error saving store database file:', err);
    return false;
  }
}

// 8.1 GET Store Data (Used on app startup by all clients)
app.get('/api/store/data', (req: Request, res: Response): void => {
  const data = loadPersistedDatabase();
  if (data) {
    res.json({
      success: true,
      persisted: true,
      data,
      updatedAt: data.updatedAt,
    });
  } else {
    res.json({
      success: true,
      persisted: false,
      data: null,
      message: 'No server database yet. Client will seed initial data.',
    });
  }
});

// 8.2 POST Sync Store Data (Used whenever Admin/Market edits products, banners, footer, QR, coupons, or orders)
app.post('/api/store/sync', (req: Request, res: Response): void => {
  try {
    const incomingData = req.body;
    if (!incomingData || typeof incomingData !== 'object') {
      res.status(400).json({ success: false, message: 'Invalid payload' });
      return;
    }

    const existing = loadPersistedDatabase() || {};
    const merged: PersistentStoreDatabase = {
      ...existing,
      ...(incomingData.products ? { products: incomingData.products } : {}),
      ...(incomingData.footerSettings ? { footerSettings: incomingData.footerSettings } : {}),
      ...(incomingData.heroBannerSettings ? { heroBannerSettings: incomingData.heroBannerSettings } : {}),
      ...(incomingData.policySettings ? { policySettings: incomingData.policySettings } : {}),
      ...(incomingData.coupons ? { coupons: incomingData.coupons } : {}),
      ...(incomingData.orders ? { orders: incomingData.orders } : {}),
    };

    const saved = savePersistedDatabase(merged);
    if (saved) {
      res.json({
        success: true,
        message: 'সব ডাটা সার্ভার ডাটাবেজে স্থায়ীভাবে সেভ হয়েছে!',
        updatedAt: new Date().toISOString(),
        productCount: Array.isArray(merged.products) ? merged.products.length : 0,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'ডাটাবেজে ফাইল রাইট করার সময় ত্রুটি হয়েছে।',
      });
    }
  } catch (error: any) {
    console.error('API /api/store/sync error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8.3 GET Full Database Backup JSON Download
app.get('/api/store/backup', (req: Request, res: Response): void => {
  const data = loadPersistedDatabase();
  const backupData = {
    store: 'Jannat Computers (জান্নাত কম্পিউটার্স)',
    exportedAt: new Date().toISOString(),
    database: data || {},
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=jannat_computers_backup_${Date.now()}.json`);
  res.send(JSON.stringify(backupData, null, 2));
});

// 8.4 POST Restore Database from JSON
app.post('/api/store/restore', (req: Request, res: Response): void => {
  try {
    const { database, products, footerSettings, heroBannerSettings, policySettings, coupons, orders } = req.body;
    const toRestore = database || { products, footerSettings, heroBannerSettings, policySettings, coupons, orders };

    if (!toRestore || typeof toRestore !== 'object') {
      res.status(400).json({ success: false, message: 'Invalid backup file format' });
      return;
    }

    const saved = savePersistedDatabase(toRestore);
    if (saved) {
      res.json({
        success: true,
        message: 'ব্যাকআপ ফাইল থেকে সফলভাবে ডাটাবেজ রিস্টোর করা হয়েছে!',
        data: toRestore,
      });
    } else {
      res.status(500).json({ success: false, message: 'রিস্টোর করার সময় সমস্যা হয়েছে।' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8.5 GET Database Status & Health
app.get('/api/store/status', (req: Request, res: Response): void => {
  try {
    ensureDbDirectory();
    const exists = fs.existsSync(DB_FILE);
    let fileSizeKb = 0;
    let modifiedTime = null;
    let data: PersistentStoreDatabase | null = null;

    if (exists) {
      const stats = fs.statSync(DB_FILE);
      fileSizeKb = Math.round(stats.size / 1024);
      modifiedTime = stats.mtime.toISOString();
      data = loadPersistedDatabase();
    }

    res.json({
      success: true,
      exists,
      fileSizeKb,
      modifiedTime,
      productCount: data?.products?.length || 0,
      orderCount: data?.orders?.length || 0,
      couponCount: data?.coupons?.length || 0,
      hasCustomFooter: Boolean(data?.footerSettings),
      hasCustomBanners: Boolean(data?.heroBannerSettings),
      updatedAt: data?.updatedAt || null,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// 9. Vite Middleware & Static Serving Setup
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Jannat Computers] Fullstack Secure Server running on port ${PORT}`);
  });
}

startServer();
