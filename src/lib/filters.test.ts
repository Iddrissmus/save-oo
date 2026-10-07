import { describe, expect, it } from 'vitest'
import type { Category, Income, Transaction } from '@/db/schema'
import { filterIncomes, filterTransactions, hasFilters } from './filters'

const categories: Category[] = [
  { id: 1, name: 'Food', icon: 'food', color: 'orange' },
  { id: 2, name: 'Transport', icon: 'transport', color: 'blue' },
]

const tx = (id: number, amount: number, categoryId: number, note = ''): Transaction => ({
  id,
  amount,
  categoryId,
  note,
  date: '2026-10-01',
  createdAt: id,
})

const rows = [tx(1, 1250, 1, 'Waakye'), tx(2, 300, 2, 'Trotro to work'), tx(3, 5000, 1, 'Groceries')]
const ids = (r: Transaction[]) => r.map((t) => t.id)

describe('filterTransactions', () => {
  it('returns everything with no filters', () => {
    expect(ids(filterTransactions(rows, { text: '' }, categories))).toEqual([1, 2, 3])
  })

  it('searches notes and category names, ignoring case', () => {
    expect(ids(filterTransactions(rows, { text: 'TROTRO' }, categories))).toEqual([2])
    expect(ids(filterTransactions(rows, { text: 'food' }, categories))).toEqual([1, 3])
  })

  it('searches by amount as typed', () => {
    expect(ids(filterTransactions(rows, { text: '12.50' }, categories))).toEqual([1])
  })

  it('filters by category and amount range (inclusive)', () => {
    expect(ids(filterTransactions(rows, { text: '', categoryId: 1 }, categories))).toEqual([1, 3])
    expect(ids(filterTransactions(rows, { text: '', min: 1250, max: 5000 }, categories))).toEqual([1, 3])
    expect(ids(filterTransactions(rows, { text: '', max: 300 }, categories))).toEqual([2])
  })

  it('combines filters with AND', () => {
    expect(ids(filterTransactions(rows, { text: 'gro', categoryId: 1, min: 2000 }, categories))).toEqual([3])
  })
})

describe('filterIncomes', () => {
  const incomes: Income[] = [
    { id: 1, amount: 100000, source: 'Salary', note: '', date: '2026-10-01', createdAt: 1 },
    { id: 2, amount: 5000, source: 'Gift', note: 'Birthday', date: '2026-10-02', createdAt: 2 },
  ]
  it('matches source, note and range', () => {
    expect(filterIncomes(incomes, { text: 'birth' }).map((i) => i.id)).toEqual([2])
    expect(filterIncomes(incomes, { text: '', min: 10000 }).map((i) => i.id)).toEqual([1])
  })
})

describe('hasFilters', () => {
  it('detects active filters', () => {
    expect(hasFilters({ text: '  ' })).toBe(false)
    expect(hasFilters({ text: 'x' })).toBe(true)
    expect(hasFilters({ text: '', min: 0 })).toBe(true)
  })
})
