import {
  Bus,
  HeartPulse,
  Home,
  PiggyBank,
  Receipt,
  ShoppingBag,
  Smartphone,
  Utensils,
  Zap,
  Gift,
  GraduationCap,
  Shirt,
  type LucideIcon,
} from 'lucide-react'

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  food: Utensils,
  transport: Bus,
  phone: Smartphone,
  bills: Zap,
  home: Home,
  health: HeartPulse,
  savings: PiggyBank,
  other: Receipt,
  shopping: ShoppingBag,
  gift: Gift,
  school: GraduationCap,
  clothes: Shirt,
}

// Full class names so Tailwind can see them. `bar` is used for charts.
export const CATEGORY_COLORS: Record<string, { chip: string; bar: string }> = {
  orange: { chip: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300', bar: 'bg-orange-500' },
  blue: { chip: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300', bar: 'bg-blue-500' },
  violet: { chip: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300', bar: 'bg-violet-500' },
  amber: { chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300', bar: 'bg-amber-500' },
  rose: { chip: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300', bar: 'bg-rose-500' },
  red: { chip: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300', bar: 'bg-red-500' },
  emerald: { chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300', bar: 'bg-emerald-500' },
  slate: { chip: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300', bar: 'bg-slate-500' },
  teal: { chip: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300', bar: 'bg-teal-500' },
  pink: { chip: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300', bar: 'bg-pink-500' },
}
