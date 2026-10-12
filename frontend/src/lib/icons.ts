import {
  Laptop,
  Megaphone,
  Plane,
  Building2,
  Coffee,
  ShoppingBag,
  Car,
  FileText,
  Layers,
  CreditCard,
  Zap,
  Globe,
  Utensils,
  Wine,
  Sparkles,
  ShieldCheck,
  Scale,
  Gift,
  Wifi,
  Briefcase,
  Monitor,
  HeartHandshake,
  DollarSign,
  Receipt,
  LucideIcon
} from 'lucide-react';

export interface CategoryIconOption {
  name: string;
  label: string;
  icon: LucideIcon;
}

export const CATEGORY_ICONS: CategoryIconOption[] = [
  { name: 'Laptop', label: 'Tech & SaaS', icon: Laptop },
  { name: 'Megaphone', label: 'Marketing & Ads', icon: Megaphone },
  { name: 'Plane', label: 'Travel & Flights', icon: Plane },
  { name: 'Building2', label: 'Office & Rent', icon: Building2 },
  { name: 'Coffee', label: 'Meals & Snacks', icon: Coffee },
  { name: 'Utensils', label: 'Dining & Restaurants', icon: Utensils },
  { name: 'Wine', label: 'Client Entertainment', icon: Wine },
  { name: 'Car', label: 'Transportation & Fuel', icon: Car },
  { name: 'ShoppingBag', label: 'Supplies & Retail', icon: ShoppingBag },
  { name: 'FileText', label: 'Legal & Accounting', icon: FileText },
  { name: 'Zap', label: 'Utilities & Power', icon: Zap },
  { name: 'Wifi', label: 'Telecom & Internet', icon: Wifi },
  { name: 'ShieldCheck', label: 'Insurance & Security', icon: ShieldCheck },
  { name: 'Briefcase', label: 'Consulting & Talent', icon: Briefcase },
  { name: 'HeartHandshake', label: 'Client Relations', icon: HeartHandshake },
  { name: 'Layers', label: 'General / Operations', icon: Layers },
];

export const CATEGORY_COLORS = [
  { name: 'Indigo', hex: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { name: 'Sky', hex: '#0ea5e9', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { name: 'Teal', hex: '#14b8a6', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { name: 'Orange', hex: '#f97316', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  { name: 'Rose', hex: '#f43f5e', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  { name: 'Purple', hex: '#a855f7', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { name: 'Fuchsia', hex: '#d946ef', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
  { name: 'Slate', hex: '#64748b', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
];

export function getCategoryIcon(iconName: string): LucideIcon {
  const match = CATEGORY_ICONS.find((item) => item.name.toLowerCase() === (iconName || '').toLowerCase());
  return match ? match.icon : Layers;
}
