import { useCategories, useIncomes, useSettings, useTransactions } from '@/db/hooks'
import { addMonths, monthRange, todayISO } from '@/lib/dates'
import { buildInsights, type Insight } from '@/lib/insights'
import { totalOf } from '@/lib/stats'

/** Smart tips for the current month, from this month plus up to 3 earlier ones. undefined while loading. */
export function useInsights(): Insight[] | undefined {
  const today = todayISO()
  const { from: monthFrom, to } = monthRange(today)
  const historyFrom = addMonths(today, -3)
  const history = useTransactions(historyFrom, to)
  const incomes = useIncomes(monthFrom, to)
  const categories = useCategories()
  const settings = useSettings()

  if (!history || !incomes || !categories || !settings) return undefined
  return buildInsights({
    today,
    month: history.filter((t) => t.date >= monthFrom),
    previous: history.filter((t) => t.date < monthFrom),
    categories,
    budget: settings.monthlyBudget,
    income: totalOf(incomes),
  })
}
