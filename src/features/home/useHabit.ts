import { useSettings, useTransactions } from '@/db/hooks'
import { saveSettings } from '@/db/repo'
import { addDays, currentHour, todayISO } from '@/lib/dates'
import { currentStreak } from '@/lib/streak'

const WINDOW_DAYS = 60
const NUDGE_FROM_HOUR = 17

/** Logging streak and the evening "have you logged today?" nudge. undefined while loading. */
export function useHabit() {
  const settings = useSettings()
  const today = todayISO()
  const recent = useTransactions(addDays(today, -WINDOW_DAYS), today)
  if (!settings || !recent) return undefined

  const noSpend = settings.noSpendDays ?? []
  // Recurring expenses are created automatically, so they don't count as the user logging.
  const logged = new Set([...recent.filter((t) => t.recurringId === undefined).map((t) => t.date), ...noSpend])
  const loggedToday = logged.has(today)

  return {
    streak: currentStreak(logged, today),
    loggedToday,
    showNudge: !loggedToday && currentHour() >= NUDGE_FROM_HOUR,
    markNoSpend: () =>
      saveSettings({ noSpendDays: [...noSpend.filter((d) => d >= addDays(today, -WINDOW_DAYS)), today] }),
  }
}
