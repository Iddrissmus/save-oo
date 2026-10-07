import { useState } from 'react'
import { Link } from 'react-router-dom'
import MonthSwitcher from '@/components/MonthSwitcher'
import SegmentedControl from '@/components/SegmentedControl'
import TransactionRow from '@/components/TransactionRow'
import { useCategories, useIncomes, useTransactions } from '@/db/hooks'
import { formatDay, monthRange, todayISO } from '@/lib/dates'
import { formatCedis } from '@/lib/money'
import { totalOf } from '@/lib/stats'

export default function History() {
  const [view, setView] = useState<'expense' | 'income'>('expense')
  const [month, setMonth] = useState(todayISO())
  const { from, to } = monthRange(month)
  const transactions = useTransactions(from, to)
  const incomes = useIncomes(from, to)
  const categories = useCategories()

  if (!transactions || !incomes || !categories) return null
  const byId = new Map(categories.map((c) => [c.id, c]))

  const groups = new Map<string, typeof transactions>()
  for (const t of transactions) groups.set(t.date, [...(groups.get(t.date) ?? []), t])

  return (
    <main className="space-y-4 p-5">
      <h1 className="text-xl font-semibold">History</h1>
      <SegmentedControl
        value={view}
        onChange={setView}
        options={[
          { value: 'expense', label: 'Expenses' },
          { value: 'income', label: 'Income' },
        ]}
      />
      <MonthSwitcher month={month} onChange={setMonth} />

      {view === 'expense' ? (
        <>
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
        </>
      ) : (
        <>
          <p className="text-center text-sm text-muted-foreground">
            {incomes.length} entries · {formatCedis(totalOf(incomes))}
          </p>
          {incomes.length === 0 && (
            <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No income recorded this month.{' '}
              <Link to="/add-income" className="text-primary">
                Add income
              </Link>
            </p>
          )}
          {incomes.length > 0 && (
            <div className="divide-y rounded-2xl bg-card px-4 shadow-sm">
              {incomes.map((i) => (
                <Link key={i.id} to={`/edit-income/${i.id}`} className="flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{i.source}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {formatDay(i.date)}
                      {i.note ? ` · ${i.note}` : ''}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    +{formatCedis(i.amount)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
