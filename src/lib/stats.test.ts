import { describe, expect, it } from 'vitest'
import type { Transaction } from '@/db/schema'
import { budgetStatus, dailyTotals, totalsByCategory } from './stats'

const tx = (id: number, amount: number, categoryId: number, date: string): Transaction => ({
  id,
  amount,
  categoryId,
  date,
  note: '',
  createdAt: id,
})

describe('totalsByCategory', () => {
  it('sums per category, biggest first', () => {
    const rows = [tx(1, 500, 1, '2026-10-01'), tx(2, 1500, 2, '2026-10-01'), tx(3, 250, 1, '2026-10-02')]
    expect(totalsByCategory(rows)).toEqual([
      { categoryId: 2, total: 1500 },
      { categoryId: 1, total: 750 },
    ])
  })
})

describe('dailyTotals', () => {
  it('includes zero-spend days', () => {
    const rows = [tx(1, 500, 1, '2026-10-01'), tx(2, 300, 1, '2026-10-03')]
    expect(dailyTotals(rows, '2026-10-01', '2026-10-03')).toEqual([
      { date: '2026-10-01', total: 500 },
      { date: '2026-10-02', total: 0 },
      { date: '2026-10-03', total: 300 },
    ])
  })
})

describe('budgetStatus', () => {
  it('computes what is left and a per-day allowance', () => {
    // Oct 2026 has 31 days; on the 22nd there are 10 days left including today.
    const s = budgetStatus(100000, 30000, '2026-10-22')
    expect(s.left).toBe(70000)
    expect(s.daysLeft).toBe(10)
    expect(s.perDay).toBe(7000)
    expect(s.percentUsed).toBe(30)
  })

  it('reports over-budget as negative left and zero allowance', () => {
    const s = budgetStatus(10000, 12000, '2026-10-31')
    expect(s.left).toBe(-2000)
    expect(s.perDay).toBe(0)
  })

  it('handles no budget set', () => {
    expect(budgetStatus(0, 500, '2026-10-05').percentUsed).toBe(0)
  })
})
