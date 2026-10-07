import { useState } from 'react'
import CategoryBadge from '@/components/CategoryBadge'
import MonthSwitcher from '@/components/MonthSwitcher'
import { useCategories, useTransactions } from '@/db/hooks'
import { CATEGORY_COLORS } from '@/lib/categoryIcons'
import { fromISO, isSameMonth, monthRange, todayISO } from '@/lib/dates'
import { formatCedis } from '@/lib/money'
import { dailyTotals, totalOf, totalsByCategory } from '@/lib/stats'

export default function Insights() {
  const [month, setMonth] = useState(todayISO())
  const { from, to } = monthRange(month)
  const transactions = useTransactions(from, to)
  const categories = useCategories()

  if (!transactions || !categories) return null
  const byId = new Map(categories.map((c) => [c.id, c]))
  const total = totalOf(transactions)
  const byCategory = totalsByCategory(transactions)

  // Average over days elapsed so far in the current month, or the whole month for past ones.
  const isCurrent = isSameMonth(month, todayISO())
  const daysCounted = isCurrent ? fromISO(todayISO()).getDate() : fromISO(to).getDate()
  const daily = dailyTotals(transactions, from, isCurrent ? todayISO() : to)
  const maxDay = Math.max(1, ...daily.map((d) => d.total))
  const biggest = daily.reduce((a, b) => (b.total > a.total ? b : a), daily[0])

  return (
    <main className="space-y-5 p-5">
      <h1 className="text-xl font-semibold">Insights</h1>
      <MonthSwitcher month={month} onChange={setMonth} />

      {transactions.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No spending recorded for this month.
        </p>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3">
            <Stat label="Total spent" value={formatCedis(total)} />
            <Stat label="Average per day" value={formatCedis(Math.round(total / daysCounted))} />
            <Stat label="Expenses" value={String(transactions.length)} />
            <Stat
              label="Biggest day"
              value={formatCedis(biggest.total)}
              hint={fromISO(biggest.date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
            />
          </section>

          <section className="rounded-2xl bg-card p-4 shadow-sm">
            <h2 className="mb-3 font-semibold">Daily spending</h2>
            <div className="flex h-28 items-end gap-0.5">
              {daily.map((d) => (
                <div
                  key={d.date}
                  title={`${d.date}: ${formatCedis(d.total)}`}
                  className="flex-1 rounded-t bg-primary/80"
                  style={{ height: `${Math.max(d.total > 0 ? 4 : 1, (d.total / maxDay) * 100)}%`, opacity: d.total ? 1 : 0.2 }}
                />
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-card p-4 shadow-sm">
            <h2 className="mb-3 font-semibold">Where it went</h2>
            <ul className="space-y-4">
              {byCategory.map(({ categoryId, total: t }) => {
                const c = byId.get(categoryId)
                const pct = Math.round((t / total) * 100)
                return (
                  <li key={categoryId} className="flex items-center gap-3">
                    <CategoryBadge category={c} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{c?.name ?? 'Other'}</span>
                        <span className="tabular-nums">{formatCedis(t)}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${(CATEGORY_COLORS[c?.color ?? 'slate'] ?? CATEGORY_COLORS.slate).bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{pct}% of spending</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
