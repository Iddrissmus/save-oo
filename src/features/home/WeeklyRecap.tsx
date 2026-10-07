import { CalendarDays, TrendingDown, TrendingUp, X } from 'lucide-react'
import { useCategories, useSettings, useTransactions } from '@/db/hooks'
import { saveSettings } from '@/db/repo'
import { fromISO, todayISO } from '@/lib/dates'
import { formatCedis } from '@/lib/money'
import { lastWeekRange, summarizeWeek } from '@/lib/weekly'

const short = (iso: string) => fromISO(iso).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })

/** Last week's recap. Shown until dismissed; a new one appears each week. */
export default function WeeklyRecap() {
  const settings = useSettings()
  const categories = useCategories()
  const { from, to, prevFrom } = lastWeekRange(todayISO())
  const rows = useTransactions(prevFrom, to)
  if (!settings || !categories || !rows) return null

  const summary = summarizeWeek(
    rows.filter((t) => t.date >= from),
    rows.filter((t) => t.date < from),
    from,
    to,
  )
  if (summary.count === 0 || settings.weeklyDismissed === from) return null

  const topName = categories.find((c) => c.id === summary.topCategoryId)?.name
  const up = (summary.changePct ?? 0) > 0
  const Trend = up ? TrendingUp : TrendingDown

  return (
    <section className="space-y-3 rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <CalendarDays className="size-5 text-primary" /> Last week
          <span className="text-xs font-normal text-muted-foreground">
            {short(summary.from)} – {short(summary.to)}
          </span>
        </div>
        <button
          type="button"
          aria-label="Dismiss weekly recap"
          onClick={() => saveSettings({ weeklyDismissed: from })}
          className="-m-1 rounded-full p-1 text-muted-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold tabular-nums">{formatCedis(summary.total)}</span>
        {summary.changePct !== null && summary.changePct !== 0 && (
          <span
            className={`flex items-center gap-1 text-sm ${up ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}
          >
            <Trend className="size-4" />
            {Math.abs(summary.changePct)}% {up ? 'more' : 'less'} than the week before
          </span>
        )}
      </div>

      <ul className="space-y-1 text-sm text-muted-foreground">
        {topName && (
          <li>
            Most went on <b className="text-foreground">{topName}</b> ({formatCedis(summary.topCategoryTotal)}).
          </li>
        )}
        {summary.biggestDay && (
          <li>
            Biggest day: <b className="text-foreground">{short(summary.biggestDay.date)}</b> (
            {formatCedis(summary.biggestDay.total)}).
          </li>
        )}
        <li>
          {summary.noSpendDays > 0
            ? `${summary.noSpendDays} day${summary.noSpendDays > 1 ? 's' : ''} with no spending. Nice.`
            : 'You spent something every day.'}
        </li>
      </ul>
    </section>
  )
}
