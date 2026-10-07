import { ChevronLeft, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import CategoryBadge from '@/components/CategoryBadge'
import { Button, buttonVariants } from '@/components/ui/button'
import { useCategories, useRecurringList } from '@/db/hooks'
import { setRecurringActive } from '@/db/recurring'
import { formatDay, todayISO } from '@/lib/dates'
import { formatCedis } from '@/lib/money'
import { describeFrequency } from '@/lib/recurring'

export default function RecurringPage() {
  const items = useRecurringList()
  const categories = useCategories()
  if (!items || !categories) return null
  const byId = new Map(categories.map((c) => [c.id, c]))

  return (
    <main className="space-y-4 p-5">
      <header className="space-y-1">
        <Link to="/settings" className="-ml-1 inline-flex items-center text-sm text-muted-foreground">
          <ChevronLeft className="size-4" /> Settings
        </Link>
        <h1 className="text-xl font-semibold">Recurring expenses</h1>
        <p className="text-sm text-muted-foreground">
          Rent, data bundles, subscriptions. Save-oo adds them for you on the due date, even if you were away.
        </p>
      </header>

      {items.length === 0 && (
        <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nothing set up yet.
        </p>
      )}

      <ul className="space-y-2">
        {items.map((r) => (
          <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
            <Link to={`/recurring/${r.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <CategoryBadge category={byId.get(r.categoryId)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{r.note || byId.get(r.categoryId)?.name || 'Expense'}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {describeFrequency(r.frequency, r.dayOfMonth)} ·{' '}
                  {r.active ? `next ${formatDay(r.nextDue)}` : 'paused'}
                </span>
              </span>
              <span className="font-semibold tabular-nums">{formatCedis(r.amount)}</span>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setRecurringActive(r, !r.active, todayISO())}>
              {r.active ? 'Pause' : 'Resume'}
            </Button>
          </li>
        ))}
      </ul>

      <Link to="/recurring/new" className={buttonVariants({ className: 'h-10 w-full' })}>
        <Plus /> Add recurring expense
      </Link>
    </main>
  )
}
