import { db, DEFAULT_SETTINGS, type Income, type Settings, type Transaction } from './schema'

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

export type NewIncome = Omit<Income, 'id' | 'createdAt'>

export function addIncome(i: NewIncome) {
  return db.incomes.add({ ...i, createdAt: Date.now() } as Income)
}

export function updateIncome(id: number, changes: Partial<NewIncome>) {
  return db.incomes.update(id, changes)
}

export function deleteIncome(id: number) {
  return db.incomes.delete(id)
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
