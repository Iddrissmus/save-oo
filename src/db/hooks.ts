import { useLiveQuery } from 'dexie-react-hooks'
import { getSettings, listCategories, listTransactions } from './repo'
import { db } from './schema'

/** Live settings; undefined while the first read is in flight. */
export function useSettings() {
  return useLiveQuery(() => getSettings())
}

export function useCategories() {
  return useLiveQuery(() => listCategories())
}

/** Transactions in [from, to], newest first. undefined while loading. */
export function useTransactions(from: string, to: string) {
  return useLiveQuery(async () => {
    const rows = await listTransactions(from, to)
    return rows.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  }, [from, to])
}

/** Income in [from, to], newest first. undefined while loading. */
export function useIncomes(from: string, to: string) {
  return useLiveQuery(async () => {
    const rows = await db.incomes.where('date').between(from, to, true, true).toArray()
    return rows.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  }, [from, to])
}

export function useIncome(id: number | undefined) {
  return useLiveQuery(() => (id === undefined ? undefined : db.incomes.get(id)), [id])
}

export function useRecurringList() {
  return useLiveQuery(() => db.recurring.orderBy('nextDue').toArray())
}

export function useRecurringItem(id: number | undefined) {
  return useLiveQuery(() => (id === undefined ? undefined : db.recurring.get(id)), [id])
}

export function useTransaction(id: number | undefined) {
  return useLiveQuery(() => (id === undefined ? undefined : db.transactions.get(id)), [id])
}
