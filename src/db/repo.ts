import { db, DEFAULT_SETTINGS, type Settings, type Transaction } from './schema'

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>

export function addTransaction(t: NewTransaction) {
  return db.transactions.add({ ...t, createdAt: Date.now() } as Transaction)
}

export function updateTransaction(id: number, changes: Partial<NewTransaction>) {
  return db.transactions.update(id, changes)
}

export function deleteTransaction(id: number) {
  return db.transactions.delete(id)
}

/** Transactions with date in [from, to] inclusive (YYYY-MM-DD), newest first. */
export function listTransactions(from: string, to: string) {
  return db.transactions.where('date').between(from, to, true, true).reverse().sortBy('date')
}

export function listCategories() {
  return db.categories.toArray()
}

export async function getSettings(): Promise<Settings> {
  return (await db.settings.get(1)) ?? DEFAULT_SETTINGS
}

export function saveSettings(changes: Partial<Omit<Settings, 'id'>>) {
  return db.settings.update(1, changes)
}
