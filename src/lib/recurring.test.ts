import { describe, expect, it } from 'vitest'
import { describeFrequency, dueOccurrences, firstOnOrAfter, nextOccurrence } from './recurring'

describe('nextOccurrence', () => {
  it('moves weekly by 7 days across a month end', () => {
    expect(nextOccurrence('2026-10-28', 'weekly', 28)).toBe('2026-11-04')
  })

  it('keeps monthly on the same day', () => {
    expect(nextOccurrence('2026-10-15', 'monthly', 15)).toBe('2026-11-15')
    expect(nextOccurrence('2026-12-15', 'monthly', 15)).toBe('2027-01-15')
  })

  it('clamps day 31 to short months and recovers afterwards', () => {
    expect(nextOccurrence('2026-01-31', 'monthly', 31)).toBe('2026-02-28')
    expect(nextOccurrence('2026-02-28', 'monthly', 31)).toBe('2026-03-31')
    expect(nextOccurrence('2028-01-31', 'monthly', 31)).toBe('2028-02-29')
  })
})

describe('dueOccurrences', () => {
  it('returns nothing when not yet due', () => {
    expect(dueOccurrences('2026-11-01', '2026-10-10', 'monthly', 1)).toEqual({ dates: [], nextDue: '2026-11-01' })
  })

  it('catches up on every missed date', () => {
    const r = dueOccurrences('2026-07-05', '2026-10-10', 'monthly', 5)
    expect(r.dates).toEqual(['2026-07-05', '2026-08-05', '2026-09-05', '2026-10-05'])
    expect(r.nextDue).toBe('2026-11-05')
  })

  it('includes today and is idempotent once nextDue has advanced', () => {
    const first = dueOccurrences('2026-10-10', '2026-10-10', 'weekly', 10)
    expect(first.dates).toEqual(['2026-10-10'])
    expect(dueOccurrences(first.nextDue, '2026-10-10', 'weekly', 10).dates).toEqual([])
  })

  it('respects the cap', () => {
    expect(dueOccurrences('2020-01-01', '2026-10-10', 'weekly', 1, 5).dates).toHaveLength(5)
  })
})

describe('firstOnOrAfter', () => {
  it('skips missed dates without back-filling', () => {
    expect(firstOnOrAfter('2026-07-05', '2026-10-10', 'monthly', 5)).toBe('2026-11-05')
    expect(firstOnOrAfter('2026-10-10', '2026-10-10', 'monthly', 10)).toBe('2026-10-10')
  })
})

describe('describeFrequency', () => {
  it('words it nicely', () => {
    expect(describeFrequency('weekly', 3)).toBe('Every week')
    expect(describeFrequency('monthly', 1)).toBe('Monthly on the 1st')
    expect(describeFrequency('monthly', 22)).toBe('Monthly on the 22nd')
    expect(describeFrequency('monthly', 11)).toBe('Monthly on the 11th')
    expect(describeFrequency('monthly', 31)).toBe('Monthly on the 31st')
  })
})
