import { describe, expect, it } from 'vitest'
import type { Transaction } from '@/db/schema'
import { addDays, startOfWeek } from './dates'
import { currentStreak } from './streak'
import { lastWeekRange, summarizeWeek } from './weekly'

const tx = (id: number, amount: number, categoryId: number, date: string): Transaction => ({
  id,
  amount,
  categoryId,
  date,
  note: '',
  createdAt: id,
})

describe('week helpers', () => {
  it('finds Monday for any day of the week', () => {
    // 2026-10-07 is a Wednesday.
    expect(startOfWeek('2026-10-07')).toBe('2026-10-05')
    expect(startOfWeek('2026-10-05')).toBe('2026-10-05')
    expect(startOfWeek('2026-10-11')).toBe('2026-10-05') // Sunday belongs to the Monday before
  })

  it('addDays crosses month ends', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('lastWeekRange is the previous full Mon-Sun week', () => {
    expect(lastWeekRange('2026-10-07')).toEqual({
      from: '2026-09-28',
      to: '2026-10-04',
      prevFrom: '2026-09-21',
      prevTo: '2026-09-27',
    })
  })
})

describe('summarizeWeek', () => {
  const week = [tx(1, 1000, 1, '2026-09-28'), tx(2, 3000, 2, '2026-09-28'), tx(3, 500, 1, '2026-09-30')]
  const prev = [tx(4, 2000, 1, '2026-09-22')]

  it('totals, compares with the previous week and finds the top category and biggest day', () => {
    const s = summarizeWeek(week, prev, '2026-09-28', '2026-10-04')
    expect(s.total).toBe(4500)
    expect(s.count).toBe(3)
    expect(s.changePct).toBe(125)
    expect(s.topCategoryId).toBe(2)
    expect(s.topCategoryTotal).toBe(3000)
    expect(s.biggestDay).toEqual({ date: '2026-09-28', total: 4000 })
    expect(s.noSpendDays).toBe(5) // 2 of 7 days had spending
  })

  it('has no comparison when the previous week is empty', () => {
    expect(summarizeWeek(week, [], '2026-09-28', '2026-10-04').changePct).toBeNull()
  })
})

describe('currentStreak', () => {
  it('counts consecutive logged days ending today', () => {
    expect(currentStreak(new Set(['2026-10-07', '2026-10-06', '2026-10-05']), '2026-10-07')).toBe(3)
  })

  it('does not break just because today is not logged yet', () => {
    expect(currentStreak(new Set(['2026-10-06', '2026-10-05']), '2026-10-07')).toBe(2)
  })

  it('breaks on a missed day', () => {
    expect(currentStreak(new Set(['2026-10-07', '2026-10-05']), '2026-10-07')).toBe(1)
    expect(currentStreak(new Set(['2026-10-04']), '2026-10-07')).toBe(0)
  })
})
