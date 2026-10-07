import { Link } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'
import TransactionRow from '@/components/TransactionRow'
import { useCategories, useSettings, useTransactions } from '@/db/hooks'
import { formatMonth, monthRange, todayISO } from '@/lib/dates'
import { formatCedis } from '@/lib/money'
import { budgetStatus, totalOf } from '@/lib/stats'

export default function Home() {
  const settings = useSettings()
  const { from, to } = monthRange()
  const transactions = useTransactions(from, to)
  const categories = useCategories()

  if (!settings || !transactions || !categories) return null
  const byId = new Map(categories.map((c) => [c.id, c]))
  const monthTotal = totalOf(transactions)
  const todayTotal = totalOf(transactions.filter((t) => t.date === todayISO()))
  const hasBudget = settings.monthlyBudget > 0
  const status = budgetStatus(settings.monthlyBudget, monthTotal, todayISO())

  return (
    <main className="space-y-6 p-5">
      <header>
        <p className="text-sm text-muted-foreground">Hi, {settings.username} 👋</p>
        <h1 className="text-xl font-semibold">Your money this month</h1>
      </header>

      <section className="rounded-3xl bg-linear-to-br from-teal-600 to-teal-800 p-5 text-white shadow-lg">
        <p className="text-sm opacity-80">Spent in {formatMonth()}</p>
        <p className="mt-1 text-4xl font-semibold tabular-nums">{formatCedis(monthTotal)}</p>
        <p className="mt-1 text-sm opacity-80">Today: {formatCedis(todayTotal)}</p>

        {hasBudget ? (
          <div className="mt-5 space-y-2">
            <Progress
              value={Math.min(100, status.percentUsed)}
              className="h-2 bg-white/25 [&>div]:bg-white"
            />
            <div className="flex justify-between text-sm">
              <span>{status.left >= 0 ? `${formatCedis(status.left)} left` : `${formatCedis(-status.left)} over`}</span>
              <span className="opacity-80">of {formatCedis(settings.monthlyBudget)}</span>
            </div>
            {status.left > 0 && (
              <p className="text-sm opacity-90">
                Safe to spend about <b>{formatCedis(status.perDay)}</b> a day for {status.daysLeft} more days.
              </p>
            )}
          </div>
        ) : (
          <Link to="/settings" className="mt-4 inline-block text-sm underline underline-offset-4">
            Set a monthly budget →
          </Link>
        )}
      </section>

      <section>
        <div className="mb-1 flex items-baseline justify-between">
          <h2 className="font-semibold">Recent</h2>
          <Link to="/history" className="text-sm text-primary">
            See all
          </Link>
        </div>
        {transactions.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nothing yet. Tap + to log your first expense.
          </p>
        ) : (
          <div className="divide-y rounded-2xl bg-card px-4 shadow-sm">
            {transactions.slice(0, 5).map((t) => (
              <TransactionRow key={t.id} t={t} category={byId.get(t.categoryId)} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
