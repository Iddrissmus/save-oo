import { useState } from 'react'
import MonthSwitcher from '@/components/MonthSwitcher'
import TransactionRow from '@/components/TransactionRow'
import { useCategories, useTransactions } from '@/db/hooks'
import { formatDay, monthRange, todayISO } from '@/lib/dates'
import { formatCedis } from '@/lib/money'
import { totalOf } from '@/lib/stats'

export default function History() {
  const [month, setMonth] = useState(todayISO())
  const { from, to } = monthRange(month)
  const transactions = useTransactions(from, to)
  const categories = useCategories()

  if (!transactions || !categories) return null
  const byId = new Map(categories.map((c) => [c.id, c]))

  const groups = new Map<string, typeof transactions>()
  for (const t of transactions) groups.set(t.date, [...(groups.get(t.date) ?? []), t])

  return (
    <main className="space-y-4 p-5">
      <h1 className="text-xl font-semibold">History</h1>
      <MonthSwitcher month={month} onChange={setMonth} />
      <p className="text-center text-sm text-muted-foreground">
        {transactions.length} expenses · {formatCedis(totalOf(transactions))}
      </p>

      {groups.size === 0 && (
        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No expenses this month.
        </p>
      )}
      {[...groups].map(([date, rows]) => (
        <section key={date}>
          <div className="mb-1 flex justify-between text-sm text-muted-foreground">
            <span>{formatDay(date)}</span>
            <span className="tabular-nums">{formatCedis(totalOf(rows))}</span>
          </div>
          <div className="divide-y rounded-2xl bg-card px-4 shadow-sm">
            {rows.map((t) => (
              <TransactionRow key={t.id} t={t} category={byId.get(t.categoryId)} />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
