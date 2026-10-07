import { fromISO, toISO } from './dates'

export type Frequency = 'weekly' | 'monthly'

/** The occurrence after `iso`. Monthly ones stay on `dayOfMonth`, clamped to short months. */
export function nextOccurrence(iso: string, frequency: Frequency, dayOfMonth: number): string {
  const d = fromISO(iso)
  if (frequency === 'weekly') return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const lastDay = new Date(y, m + 1, 0).getDate()
  return toISO(new Date(y, m, Math.min(dayOfMonth, lastDay)))
}

/**
 * Every occurrence from `nextDue` up to and including `today`, plus the next date still to come.
 * `cap` stops a very old start date from creating hundreds of entries in one go.
 */
export function dueOccurrences(
  nextDue: string,
  today: string,
  frequency: Frequency,
  dayOfMonth: number,
  cap = 60,
): { dates: string[]; nextDue: string } {
  const dates: string[] = []
  let cur = nextDue
  while (cur <= today && dates.length < cap) {
    dates.push(cur)
    cur = nextOccurrence(cur, frequency, dayOfMonth)
  }
  return { dates, nextDue: cur }
}

/** First occurrence on or after `today` (used when resuming a paused item, so nothing is back-filled). */
export function firstOnOrAfter(nextDue: string, today: string, frequency: Frequency, dayOfMonth: number): string {
  let cur = nextDue
  while (cur < today) cur = nextOccurrence(cur, frequency, dayOfMonth)
  return cur
}

export function describeFrequency(frequency: Frequency, dayOfMonth: number): string {
  if (frequency === 'weekly') return 'Every week'
  const s = ['th', 'st', 'nd', 'rd']
  const v = dayOfMonth % 100
  return `Monthly on the ${dayOfMonth}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`
}
