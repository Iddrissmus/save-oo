import type { Transaction } from '@/db/schema'
import { eachDay, fromISO, monthRange } from './dates'
import { sumPesewas } from './money'

/** Spend per category, biggest first. */
export function totalsByCategory(transactions: Transaction[]): { categoryId: number; total: number }[] {
  const totals = new Map<number, number>()
  for (const t of transactions) totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount)
  return [...totals]
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total)
}

/** One entry per day in [from, to], including zero-spend days. */
export function dailyTotals(transactions: Transaction[], from: string, to: string): { date: string; total: number }[] {
  const byDay = new Map<string, number>()
  for (const t of transactions) byDay.set(t.date, (byDay.get(t.date) ?? 0) + t.amount)
  return eachDay(from, to).map((date) => ({ date, total: byDay.get(date) ?? 0 }))
}

export interface BudgetStatus {
  left: number // pesewas, negative when over budget
  daysLeft: number // including today
  perDay: number // pesewas safe to spend per remaining day (0 when over)
  percentUsed: number // 0-100+
}

/** Budget position for the month containing `today`, given total spent so far. */
export function budgetStatus(budget: number, spent: number, today: string): BudgetStatus {
  const { to } = monthRange(today)
  const daysLeft = Math.max(1, fromISO(to).getDate() - fromISO(today).getDate() + 1)
  const left = budget - spent
  return {
    left,
    daysLeft,
    perDay: left > 0 ? Math.floor(left / daysLeft) : 0,
    percentUsed: budget > 0 ? Math.round((spent / budget) * 100) : 0,
  }
}

export function totalOf(transactions: Transaction[]): number {
  return sumPesewas(transactions.map((t) => t.amount))
}
