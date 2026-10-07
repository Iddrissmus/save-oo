import { addDays } from './dates'

/**
 * Consecutive days (ending today) on which the user logged something or confirmed "nothing spent".
 * Today not being logged yet does not break the streak; it only counts once the day is logged.
 */
export function currentStreak(loggedDays: Set<string>, today: string): number {
  let day = loggedDays.has(today) ? today : addDays(today, -1)
  let streak = 0
  while (loggedDays.has(day)) {
    streak++
    day = addDays(day, -1)
  }
  return streak
}
