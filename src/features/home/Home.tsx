import { BellRing, Flame, HardDriveDownload, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import InsightCard from '@/components/InsightCard'
import TransactionRow from '@/components/TransactionRow'
import { Button, buttonVariants } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useCategories, useIncomes, useSettings, useTransactions } from '@/db/hooks'
import { useInsights } from '@/features/insights/useInsights'
import { useHabit } from './useHabit'
import WeeklyRecap from './WeeklyRecap'
import { daysSince, formatMonth, monthRange, todayISO } from '@/lib/dates'
import { formatCedis } from '@/lib/money'
import { budgetStatus, totalOf } from '@/lib/stats'

const BACKUP_EVERY_DAYS = 7

export default function Home() {
  const settings = useSettings()
  const { from, to } = monthRange()
  const transactions = useTransactions(from, to)
  const incomes = useIncomes(from, to)
  const categories = useCategories()
  const insights = useInsights()
  const habit = useHabit()

  if (!settings || !transactions || !incomes || !categories) return null
  const byId = new Map(categories.map((c) => [c.id, c]))
  const monthTotal = totalOf(transactions)
  const todayTotal = totalOf(transactions.filter((t) => t.date === todayISO()))
  const hasBudget = settings.monthlyBudget > 0
  const status = budgetStatus(settings.monthlyBudget, monthTotal, todayISO())

  const income = totalOf(incomes)
  const saved = income - monthTotal
  const goal = settings.savingsGoal
  const needsBackup = transactions.length + incomes.length > 0 && daysSince(settings.lastBackupAt) >= BACKUP_EVERY_DAYS
  const topTip = insights?.find((i) => i.id !== 'keep-logging')

  return (
    <main className="space-y-6 p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Hi, {settings.username} 👋</p>
          <h1 className="text-xl font-semibold">Your money this month</h1>
        </div>
        {habit && habit.streak > 0 && (
          <span
            className="flex shrink-0 items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
            title="Days in a row you logged your spending"
          >
            <Flame className="size-4" /> {habit.streak}
          </span>
        )}
      </header>

      {habit?.showNudge && (
        <section className="space-y-3 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900 dark:bg-sky-500/10 dark:text-sky-200">
          <p className="flex items-center gap-2 font-semibold">
            <BellRing className="size-5" /> Nothing logged today yet
          </p>
          <p>
            Did you spend anything today? {habit.streak > 0 && `Log it to keep your ${habit.streak}-day streak going.`}
          </p>
          <div className="flex gap-2">
            <Link to="/add" className={buttonVariants({ className: 'h-9 flex-1' })}>
              Add expense
            </Link>
            <Button variant="outline" className="h-9 flex-1" onClick={habit.markNoSpend}>
              Nothing spent today
            </Button>
          </div>
        </section>
      )}

      {needsBackup && (
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200"
        >
          <HardDriveDownload className="size-5 shrink-0" />
          <span>
            <b>Back up your data.</b> It lives only on this phone. Tap to export a backup.
          </span>
        </Link>
      )}

      <section className="rounded-3xl bg-linear-to-br from-teal-600 to-teal-800 p-5 text-white shadow-lg">
        <p className="text-sm opacity-80">Spent in {formatMonth()}</p>
        <p className="mt-1 text-4xl font-semibold tabular-nums">{formatCedis(monthTotal)}</p>
        <p className="mt-1 text-sm opacity-80">Today: {formatCedis(todayTotal)}</p>

        {hasBudget ? (
          <div className="mt-5 space-y-2">
            <Progress value={Math.min(100, status.percentUsed)} className="h-2 bg-white/25 [&>div]:bg-white" />
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

      <section className="space-y-3 rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
          <TrendingUp className="size-5 text-primary" /> Savings this month
        </div>
        {income > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <Figure label="Income" value={formatCedis(income)} />
              <Figure label="Spent" value={formatCedis(monthTotal)} />
              <Figure
                label={saved >= 0 ? 'Saved' : 'Short by'}
                value={formatCedis(Math.abs(saved))}
                tone={saved >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}
              />
            </div>
            {goal > 0 ? (
              <div className="space-y-1">
                <Progress value={Math.max(0, Math.min(100, Math.round((saved / goal) * 100)))} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {saved >= goal
                    ? `Goal of ${formatCedis(goal)} reached 🎉`
                    : `${formatCedis(Math.max(0, goal - saved))} to go to reach your ${formatCedis(goal)} goal`}
                </p>
              </div>
            ) : (
              <Link to="/settings" className="text-sm text-primary">
                Set a savings goal →
              </Link>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add your income to see how much you are saving.{' '}
            <Link to="/add-income" className="text-primary">
              Add income
            </Link>
          </p>
        )}
      </section>

      <WeeklyRecap />

      {topTip && (
        <section className="space-y-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">For you</h2>
            <Link to="/insights" className="text-sm text-primary">
              More tips
            </Link>
          </div>
          <InsightCard insight={topTip} />
        </section>
      )}

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

function Figure({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-semibold tabular-nums ${tone ?? ''}`}>{value}</p>
    </div>
  )
}
