import { describe, expect, it } from 'vitest'
import { formatDay, fromISO, monthRange, toISO } from './dates'

describe('dates', () => {
  it('round-trips ISO strings without timezone shift', () => {
    expect(toISO(fromISO('2026-03-01'))).toBe('2026-03-01')
  })

  it('computes month range including leap February', () => {
    expect(monthRange('2028-02-10')).toEqual({ from: '2028-02-01', to: '2028-02-29' })
    expect(monthRange('2026-12-15')).toEqual({ from: '2026-12-01', to: '2026-12-31' })
  })

  it('labels today and yesterday', () => {
    const now = new Date()
    expect(formatDay(toISO(now))).toBe('Today')
    expect(formatDay(toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)))).toBe('Yesterday')
  })
})
