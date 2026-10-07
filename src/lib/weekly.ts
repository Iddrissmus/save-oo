import type { Transaction } from '@/db/schema'
import { addDays, eachDay, startOfWeek } from './dates'
import { totalOf } from './stats'

/** The last full Monday-to-Sunday week before `today`, and the week before that. */
export function lastWeekRange(today: string) {
  const from = addDays(startOfWeek(today), -7)
  return { from, to: addDays(from, 6), prevFrom: addDays(from, -7), prevTo: addDays(from, -1) }
}

export interface WeeklySummary {
  from: string
  to: string
  total: number
  count: number
  prevTotal: number
  changePct: number | null // null when there is no previous week to compare
  topCategoryId?: number
  topCategoryTotal: number
  noSpendDays: number
  biggestDay?: { date: string; total: number }
}

export function summarizeWeek(week: Transaction[], prevWeek: Transaction[], from: string, to: string): WeeklySummary {
  const total = totalOf(week)
  const prevTotal = totalOf(prevWeek)

  const byCat = new Map<number, number>()
  for (const t of week) byCat.set(t.categoryId, (byCat.get(t.categoryId) ?? 0) + t.amount)
  const top = [...byCat].sort((a, b) => b[1] - a[1])[0]

  const byDay = new Map<string, number>()
  for (const t of week) byDay.set(t.date, (byDay.get(t.date) ?? 0) + t.amount)
  const biggest = [...byDay].sort((a, b) => b[1] - a[1])[0]

  return {
    from,
    to,
    total,
    count: week.length,
    prevTotal,
    changePct: prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null,
    topCategoryId: top?.[0],
    topCategoryTotal: top?.[1] ?? 0,
    noSpendDays: eachDay(from, to).filter((d) => !byDay.has(d)).length,
    biggestDay: biggest && { date: biggest[0], total: biggest[1] },
  }
}
