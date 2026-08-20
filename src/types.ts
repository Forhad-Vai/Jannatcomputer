export type Language = 'bn' | 'en';

export type PCComponentCategory =
  | 'cpu'
  | 'cooler'
  | 'motherboard'
  | 'ram'
  | 'storage'
  | 'gpu'
  | 'psu'
  | 'casing'
  | 'monitor'
  | 'accessories';

export interface ProductSpec {
  label: string;
  labelBn: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  subcategory: string;
  brand: string;
  model: string;
  price: number;
  regularPrice: number;
  discountPercentage?: number;
  inStock: boolean;
  stockCount: number;
  image: string;
  gallery?: string[];
  rating: number;
  reviewsCount: number;
  isHot?: boolean;
  isFeatured?: boolean;
  isDeal?: boolean;
  dealEndsAt?: string;
  badge?: string;
  badgeBn?: string;
  keySpecs: string[];
  keySpecsBn: string[];
  specsTable: {
    category: string;
    categoryBn: string;
    items: ProductSpec[];
  }[];
  warranty: string;
  warrantyBn: string;
  // PC Builder specific attributes:
  pcCategory?: PCComponentCategory;
  wattage?: number; // estimated power consumption
  socket?: string; // e.g. AM5, LGA1700, AM4, LGA1200
  memoryType?: 'DDR4' | 'DDR5';
  formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX';
  description: string;
  descriptionBn: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  nameBn: string;
  iconName: string;
  featuredImage?: string;
  subcategories: {
    id: string;
    name: string;
    nameBn: string;
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Branch {
  id: string;
  name: string;
  nameBn: string;
  city: string;
  cityBn: string;
  address: string;
  addressBn: string;
  phone: string;
  hotline: string;
  email: string;
  hours: string;
  hoursBn: string;
  timing?: string;
  timingBn?: string;
  mapUrl?: string;
  isMainBranch?: boolean;
}

export interface Order {
  id: string;
  createdAt: string;
  date?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  district: string;
  thana: string;
  deliveryType: 'home' | 'pickup';
  pickupBranchId?: string;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'upay' | 'card' | 'emi';
  transactionId?: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'in_transit' | 'delivered';
  timeline: {
    status: string;
    statusBn: string;
    date: string;
    description: string;
    descriptionBn: string;
    done: boolean;
  }[];
}

export interface UserProfile {
  name: string;
  role: 'admin' | 'market' | 'customer';
  phone?: string;
  email?: string;
  avatar?: string;
}

export interface Coupon {
  code: string;
  discountType: 'fixed' | 'percentage';
  discountAmount: number;
  minSpend: number;
  isActive: boolean;
  description: string;
}

export interface FilterState {
  category: string;
  subcategory: string;
  brand: string[];
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: 'popular' | 'price_low' | 'price_high' | 'rating' | 'discount';
  searchQuery: string;
}

export interface FooterSettings {
  storeName: string;
  tagline: string;
  taglineBn: string;
  aboutText: string;
  aboutTextBn: string;
  address: string;
  addressBn: string;
  phone1: string;
  phone2: string;
  email: string;
  businessHours: string;
  businessHoursBn: string;
  tradeLicense: string;
  bcsMembership: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  qrCodeUrl: string;
  paymentPhone: string;
  logoUrl?: string;
}

export type PolicyTab =
  | 'about'
  | 'terms'
  | 'privacy'
  | 'refund'
  | 'delivery'
  | 'warranty'
  | 'emi'
  | 'corporate';

export interface PolicySection {
  title: string;
  titleBn: string;
  badge?: string;
  badgeBn?: string;
  highlightText: string;
  highlightTextBn: string;
  mainContent: string;
  mainContentBn: string;
  rulesList: string[];
  rulesListBn: string[];
}

export interface StorePolicySettings {
  about: PolicySection;
  warranty: PolicySection;
  refund: PolicySection;
  delivery: PolicySection;
  emi: PolicySection;
  corporate: PolicySection;
  terms: PolicySection;
  privacy: PolicySection;
}

