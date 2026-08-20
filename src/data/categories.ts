import { CategoryInfo } from '../types';

export const categoriesData: CategoryInfo[] = [
  {
    id: 'laptop',
    name: 'Laptop & Notebook',
    nameBn: 'ল্যাপটপ ও নোটবুক',
    iconName: 'Laptop',
    subcategories: [
      { id: 'gaming-laptop', name: 'Gaming Laptop', nameBn: 'গেমিং ল্যাপটপ' },
      { id: 'premium-ultrabook', name: 'Ultrabook', nameBn: 'আল্ট্রাবুক' },
      { id: 'budget-laptop', name: 'Student & Office Laptop', nameBn: 'স্টুডেন্ট ও অফিস ল্যাপটপ' },
      { id: 'macbook', name: 'Apple MacBook', nameBn: 'অ্যাপল ম্যাকবুক' },
    ],
  },
  {
    id: 'desktop',
    name: 'Desktop & All-in-One',
    nameBn: 'ডেস্কটপ ও অল-ইন-ওয়ান',
    iconName: 'Monitor',
    subcategories: [
      { id: 'gaming-pc', name: 'Custom Gaming PC', nameBn: 'গেমিং পিসি' },
      { id: 'brand-pc', name: 'Brand PC (HP, Dell, Asus)', nameBn: 'ব্র্যান্ড পিসি' },
      { id: 'all-in-one', name: 'All-in-One PC', nameBn: 'অল-ইন-ওয়ান পিসি' },
      { id: 'mini-pc', name: 'Mini PC', nameBn: 'মিনি পিসি' },
    ],
  },
  {
    id: 'component',
    name: 'PC Components',
    nameBn: 'কম্পিউটার কম্পোনেন্টস',
    iconName: 'Cpu',
    subcategories: [
      { id: 'processor', name: 'Processor (CPU)', nameBn: 'প্রসেসর' },
      { id: 'motherboard', name: 'Motherboard', nameBn: 'মাদারবোর্ড' },
      { id: 'graphics-card', name: 'Graphics Card (GPU)', nameBn: 'গ্রাফিক্স কার্ড' },
      { id: 'ram', name: 'RAM (Memory)', nameBn: 'র‍্যাম' },
      { id: 'storage', name: 'SSD & Hard Disk', nameBn: 'এসএসডি ও হার্ডডিস্ক' },
      { id: 'power-supply', name: 'Power Supply (PSU)', nameBn: 'পাওয়ার সাপ্লাই' },
      { id: 'casing', name: 'Casing & Fan', nameBn: 'কেসিং ও ফ্যান' },
      { id: 'cooler', name: 'CPU Cooler (AIO / Air)', nameBn: 'সিপিইউ কুলার' },
    ],
  },
  {
    id: 'monitor',
    name: 'Monitor',
    nameBn: 'মনিটর',
    iconName: 'Tv',
    subcategories: [
      { id: 'gaming-monitor', name: 'Gaming Monitor (144Hz+)', nameBn: 'গেমিং মনিটর' },
      { id: '4k-monitor', name: '4K & OLED Monitor', nameBn: '৪কে ও ওলেড মনিটর' },
      { id: 'curved-monitor', name: 'Curved Monitor', nameBn: 'কার্ভড মনিটর' },
      { id: 'budget-monitor', name: 'Standard Office Monitor', nameBn: 'স্ট্যান্ডার্ড মনিটর' },
    ],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    nameBn: 'এক্সেসরিজ',
    iconName: 'Keyboard',
    subcategories: [
      { id: 'keyboard', name: 'Mechanical Keyboard', nameBn: 'মেকানিক্যাল কিবোর্ড' },
      { id: 'mouse', name: 'Gaming Mouse', nameBn: 'গেমিং মাউস' },
      { id: 'headset', name: 'Headphone & Headset', nameBn: 'হেডফোন ও হেডসেট' },
      { id: 'speaker', name: 'Soundbar & Speaker', nameBn: 'স্পিকার' },
      { id: 'ups', name: 'UPS & Voltage Stabilizer', nameBn: 'ইউপিএস' },
    ],
  },
  {
    id: 'networking',
    name: 'Networking',
    nameBn: 'নেটওয়ার্কিং',
    iconName: 'Wifi',
    subcategories: [
      { id: 'router', name: 'WiFi 6 / 7 Router', nameBn: 'ওয়াইফাই রাউটার' },
      { id: 'switch', name: 'Network Switch', nameBn: 'নেটওয়ার্ক সুইচ' },
      { id: 'lan-card', name: 'LAN & WiFi Adapter', nameBn: 'ওয়াইফাই এডাপ্টার' },
    ],
  },
  {
    id: 'office',
    name: 'Printer & Office',
    nameBn: 'প্রিন্টার ও অফিস ইকুইপমেন্ট',
    iconName: 'Printer',
    subcategories: [
      { id: 'inkjet-printer', name: 'Color Ink Tank Printer', nameBn: 'কালার ইঙ্ক ট্যাঙ্ক প্রিন্টার' },
      { id: 'laser-printer', name: 'Laser Printer', nameBn: 'লেজার প্রিন্টার' },
      { id: 'scanner', name: 'Document Scanner', nameBn: 'স্ক্যানার' },
      { id: 'projector', name: 'Projector', nameBn: 'প্রজেক্টর' },
    ],
  },
  {
    id: 'gadgets',
    name: 'Smart Gadgets & Camera',
    nameBn: 'স্মার্ট গ্যাজেট ও ক্যামেরা',
    iconName: 'Camera',
    subcategories: [
      { id: 'webcam', name: 'Webcam & Streaming Gear', nameBn: 'ওয়েবক্যাম ও স্ট্রিমিং' },
      { id: 'smart-watch', name: 'Smartwatch', nameBn: 'স্মার্টওয়াচ' },
      { id: 'cctv', name: 'CCTV & IP Camera', nameBn: 'সিসিটিভি ক্যামেরা' },
    ],
  },
];
