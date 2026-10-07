// Dates are plain local "YYYY-MM-DD" strings so day grouping never shifts with timezones.

const pad = (n: number) => String(n).padStart(2, '0')

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): string {
  return toISO(new Date())
}

/** First and last day of the month containing `iso` (default: today). */
export function monthRange(iso: string = todayISO()): { from: string; to: string } {
  const d = fromISO(iso)
  return {
    from: toISO(new Date(d.getFullYear(), d.getMonth(), 1)),
    to: toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
  }
}

/** Same day-of-month clamped to 1st: any date inside the month `n` months away. */
export function addMonths(iso: string, n: number): string {
  const d = fromISO(iso)
  return toISO(new Date(d.getFullYear(), d.getMonth() + n, 1))
}

export function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7)
}

/** All days from `from` to `to` inclusive. */
export function eachDay(from: string, to: string): string[] {
  const days: string[] = []
  const d = fromISO(from)
  const end = fromISO(to)
  for (; d <= end; d.setDate(d.getDate() + 1)) days.push(toISO(d))
  return days
}

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso)
  return toISO(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n))
}

/** Monday of the week containing `iso`. */
export function startOfWeek(iso: string): string {
  const day = fromISO(iso).getDay() // 0 = Sunday
  return addDays(iso, -((day + 6) % 7))
}

export function currentHour(): number {
  return new Date().getHours()
}

/** Whole days since a ms timestamp; Infinity if there is none. */
export function daysSince(ms: number | undefined): number {
  return ms ? Math.floor((Date.now() - ms) / 86_400_000) : Infinity
}

export function formatDay(iso: string): string {
  const today = new Date()
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  if (iso === toISO(today)) return 'Today'
  if (iso === toISO(yesterday)) return 'Yesterday'
  return fromISO(iso).toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatMonth(iso: string = todayISO()): string {
  return fromISO(iso).toLocaleDateString('en-GH', { month: 'long', year: 'numeric' })
}
