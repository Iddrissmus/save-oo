import { describe, expect, it } from 'vitest'
import type { Category, Transaction } from '@/db/schema'
import { buildInsights, type InsightInput } from './insights'

const categories: Category[] = [
  { id: 1, name: 'Food', icon: 'food', color: 'orange' },
  { id: 2, name: 'Transport', icon: 'transport', color: 'blue' },
]

let n = 0
const tx = (amount: number, categoryId: number, date: string): Transaction => ({
  id: ++n,
  amount,
  categoryId,
  date,
  note: '',
  createdAt: n,
})

const base = (over: Partial<InsightInput>): InsightInput => ({
  today: '2026-10-10',
  month: [],
  previous: [],
  categories,
  budget: 0,
  income: 0,
  ...over,
})

const ids = (i: InsightInput) => buildInsights(i).map((x) => x.id)

describe('buildInsights', () => {
  it('asks for more data when there is little', () => {
    expect(ids(base({ month: [tx(500, 1, '2026-10-01')] }))).toEqual(['keep-logging'])
  })

  it('warns when the month is forecast to exceed the budget', () => {
    // 10 days, GH₵500 spent => ~GH₵1550 projected over 31 days, budget GH₵1000.
    const month = Array.from({ length: 5 }, (_, i) => tx(10000, 1, `2026-10-0${i + 1}`))
    const result = buildInsights(base({ month, budget: 100000 }))
    const w = result.find((i) => i.id === 'forecast-over')
    expect(w).toBeDefined()
    expect(w!.kind).toBe('warning')
    expect(w!.saving).toBe(55000)
  })

  it('flags a category running well above its usual level', () => {
    const previous = [tx(10000, 1, '2026-09-05'), tx(10000, 2, '2026-09-06')]
    const month = Array.from({ length: 5 }, (_, i) => tx(10000, 1, `2026-10-0${i + 1}`))
    expect(ids(base({ month, previous }))).toContain('high-1')
  })

  it('spots many small spends', () => {
    const month = Array.from({ length: 9 }, (_, i) => tx(500, 2, `2026-10-0${(i % 9) + 1}`))
    expect(ids(base({ month }))).toContain('small-spends')
  })

  it('reports savings rate from income', () => {
    const month = Array.from({ length: 5 }, (_, i) => tx(10000, 1, `2026-10-0${i + 1}`))
    expect(ids(base({ month, income: 55000 }))).toContain('low-savings')
    expect(ids(base({ month, income: 40000 }))).toContain('overspent-income')
    expect(ids(base({ month, income: 100000 }))).toContain('good-savings')
  })

  it('puts warnings before good news', () => {
    const month = Array.from({ length: 5 }, (_, i) => tx(10000, 1, `2026-10-0${i + 1}`))
    const kinds = buildInsights(base({ month, income: 40000, budget: 1_000_000 })).map((i) => i.kind)
    expect(kinds.indexOf('warning')).toBeLessThan(kinds.indexOf('good') === -1 ? Infinity : kinds.indexOf('good'))
  })
})
