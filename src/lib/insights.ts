import type { Category, Transaction } from '@/db/schema'
import { fromISO, monthRange } from './dates'
import { formatCedis } from './money'
import { totalOf } from './stats'

export type InsightKind = 'warning' | 'tip' | 'info' | 'good'

export interface Insight {
  id: string
  kind: InsightKind
  title: string
  body: string
  saving?: number // pesewas per month this could free up
}

export interface InsightInput {
  today: string
  month: Transaction[] // current month so far
  previous: Transaction[] // up to 3 earlier full months
  categories: Category[]
  budget: number // pesewas, 0 = not set
  income: number // pesewas received this month
}

const SMALL_SPEND = 1000 // GH₵10
const MIN_ENTRIES = 5
const RANK: Record<InsightKind, number> = { warning: 0, tip: 1, info: 2, good: 3 }
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const daysInMonth = (iso: string) => fromISO(monthRange(iso).to).getDate()
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/** Plain-statistics advice from the user's own history. No network, no model. */
export function buildInsights(input: InsightInput): Insight[] {
  const { today, month, previous, categories, budget, income } = input
  if (month.length + previous.length < MIN_ENTRIES) {
    return [
      {
        id: 'keep-logging',
        kind: 'info',
        title: 'Keep logging',
        body: 'Log your spending for a few more days and personalised tips will appear here.',
      },
    ]
  }

  const out: Insight[] = []
  const name = (id: number) => categories.find((c) => c.id === id)?.name ?? 'Other'
  const spent = totalOf(month)
  const day = fromISO(today).getDate()
  const dim = daysInMonth(today)
  const prevMonths = new Set(previous.map((t) => t.date.slice(0, 7))).size

  // 1. Month-end forecast against the budget.
  if (budget > 0 && day >= 5 && spent > 0) {
    const projected = Math.round((spent / day) * dim)
    if (projected > budget) {
      const perDay = Math.max(0, Math.floor((budget - spent) / (dim - day + 1)))
      out.push({
        id: 'forecast-over',
        kind: 'warning',
        title: 'On track to overspend',
        body: `At this pace you'll spend ${formatCedis(projected)} this month, ${formatCedis(projected - budget)} over your ${formatCedis(budget)} budget. ${perDay > 0 ? `Keep it under ${formatCedis(perDay)} a day to stay within budget.` : 'You have already used your budget.'}`,
        saving: projected - budget,
      })
    } else if (projected <= budget * 0.9) {
      out.push({
        id: 'forecast-ok',
        kind: 'good',
        title: 'On track under budget',
        body: `At this pace you'll spend about ${formatCedis(projected)}, leaving around ${formatCedis(budget - projected)} of your budget unused.`,
      })
    }
  }

  // 2. Categories running above their usual level.
  const flagged = new Set<number>()
  if (prevMonths >= 1 && day >= 7) {
    const thisByCat = new Map<number, number>()
    for (const t of month) thisByCat.set(t.categoryId, (thisByCat.get(t.categoryId) ?? 0) + t.amount)
    for (const [catId, catSpent] of thisByCat) {
      const usual = totalOf(previous.filter((t) => t.categoryId === catId)) / prevMonths
      const projected = Math.round((catSpent / day) * dim)
      if (projected > usual * 1.25 && projected - usual >= 2000) {
        flagged.add(catId)
        out.push({
          id: `high-${catId}`,
          kind: 'warning',
          title: `${name(catId)} is running high`,
          body: `At this pace you'll spend ${formatCedis(projected)} on ${name(catId)} this month, compared with your usual ${formatCedis(Math.round(usual))}.`,
          saving: Math.round(projected - usual),
        })
      }
    }
  }

  // 3. Many small spends (the "I don't know where it went" leak).
  const small = month.filter((t) => t.amount < SMALL_SPEND)
  if (small.length >= 8) {
    const sum = totalOf(small)
    out.push({
      id: 'small-spends',
      kind: 'tip',
      title: `${small.length} small spends added up to ${formatCedis(sum)}`,
      body: `Purchases under ${formatCedis(SMALL_SPEND)} are easy to miss. Skipping or bundling a fifth of them could save about ${formatCedis(Math.round(sum * 0.2))}.`,
      saving: Math.round(sum * 0.2),
    })
  }

  // 4. Biggest category dominates the month.
  if (month.length >= MIN_ENTRIES && spent >= 5000) {
    const byCat = new Map<number, number>()
    for (const t of month) byCat.set(t.categoryId, (byCat.get(t.categoryId) ?? 0) + t.amount)
    const [topId, topTotal] = [...byCat].sort((a, b) => b[1] - a[1])[0]
    const share = topTotal / spent
    if (share > 0.4 && !flagged.has(topId)) {
      out.push({
        id: `top-${topId}`,
        kind: 'tip',
        title: `${name(topId)} is ${Math.round(share * 100)}% of your spending`,
        body: `Trimming ${name(topId)} by just 10% would free up about ${formatCedis(Math.round(topTotal * 0.1))} this month.`,
        saving: Math.round(topTotal * 0.1),
      })
    }
  }

  // 5. Weekday pattern, needs enough history to mean something.
  const all = [...previous, ...month]
  if (all.length >= 20) {
    const byDay = new Array<number>(7).fill(0)
    for (const t of all) byDay[fromISO(t.date).getDay()] += t.amount
    const total = byDay.reduce((a, b) => a + b, 0)
    const top = byDay.indexOf(Math.max(...byDay))
    if (total > 0 && byDay[top] / total >= 0.3) {
      out.push({
        id: 'weekday',
        kind: 'info',
        title: `You spend most on ${WEEKDAYS[top]}s`,
        body: `${Math.round((byDay[top] / total) * 100)}% of your spending lands on ${WEEKDAYS[top]}s. Plan ahead for those days.`,
      })
    }
  }

  // 6. Savings rate, when income is known.
  if (income > 0) {
    const rate = (income - spent) / income
    const target = Math.round(income * 0.2)
    if (rate < 0) {
      out.push({
        id: 'overspent-income',
        kind: 'warning',
        title: "You've spent more than you earned",
        body: `Spending is ${formatCedis(spent - income)} above your income this month. Cut back where you can until it balances.`,
        saving: spent - income,
      })
    } else if (rate < 0.1) {
      out.push({
        id: 'low-savings',
        kind: 'warning',
        title: `You're saving ${Math.round(rate * 100)}% of your income`,
        body: `A common target is 20%, about ${formatCedis(target)} a month for you. Even a small automatic transfer on payday helps.`,
      })
    } else if (rate < 0.2) {
      out.push({
        id: 'ok-savings',
        kind: 'tip',
        title: `You're saving ${Math.round(rate * 100)}% of your income`,
        body: `You're close to the 20% target (${formatCedis(target)}). A little more would get you there.`,
      })
    } else {
      out.push({
        id: 'good-savings',
        kind: 'good',
        title: `Great: saving ${Math.round(rate * 100)}% of your income`,
        body: `You're above the 20% target. Keep it up.`,
      })
    }
  }

  // 7. One unusually big expense.
  if (month.length >= MIN_ENTRIES) {
    const biggest = month.reduce((a, b) => (b.amount > a.amount ? b : a))
    if (biggest.amount >= 5000 && biggest.amount > 3 * median(month.map((t) => t.amount))) {
      out.push({
        id: 'big-expense',
        kind: 'info',
        title: `Biggest expense: ${formatCedis(biggest.amount)}`,
        body: `${name(biggest.categoryId)}${biggest.note ? ` (${biggest.note})` : ''} on ${fromISO(biggest.date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })} is far above your usual spend.`,
      })
    }
  }

  return out.sort((a, b) => RANK[a.kind] - RANK[b.kind])
}
