import type { Category, Income, Transaction } from '@/db/schema'

export interface Filters {
  text: string
  categoryId?: number // expenses only
  min?: number // pesewas, inclusive
  max?: number // pesewas, inclusive
}

export const hasFilters = (f: Filters) =>
  f.text.trim() !== '' || f.categoryId !== undefined || f.min !== undefined || f.max !== undefined

/** "12.50" for 1250: lets people search by amount as they would type it. */
const amountText = (pesewas: number) => (pesewas / 100).toFixed(2)

function matches(haystack: string[], amount: number, f: Filters): boolean {
  const q = f.text.trim().toLowerCase()
  if (q && !haystack.some((h) => h.toLowerCase().includes(q))) return false
  if (f.min !== undefined && amount < f.min) return false
  if (f.max !== undefined && amount > f.max) return false
  return true
}

export function filterTransactions(rows: Transaction[], f: Filters, categories: Category[]): Transaction[] {
  const names = new Map(categories.map((c) => [c.id, c.name]))
  return rows.filter(
    (t) =>
      (f.categoryId === undefined || t.categoryId === f.categoryId) &&
      matches([t.note, names.get(t.categoryId) ?? 'Other', amountText(t.amount)], t.amount, f),
  )
}

export function filterIncomes(rows: Income[], f: Filters): Income[] {
  return rows.filter((i) => matches([i.note, i.source, amountText(i.amount)], i.amount, f))
}
