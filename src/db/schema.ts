import Dexie, { type EntityTable } from 'dexie'

export interface Category {
  id: number
  name: string
  emoji: string
}

export interface Transaction {
  id: number
  amount: number // pesewas
  categoryId: number
  note: string
  date: string // YYYY-MM-DD (local date)
  createdAt: number
}

export interface Settings {
  id: 1 // single row
  username: string
  onboarded: boolean
  monthlyBudget: number // pesewas, 0 = not set
  savingsGoal: number // pesewas, 0 = not set
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Food', emoji: '🍲' },
  { name: 'Transport', emoji: '🚌' },
  { name: 'Airtime/Data', emoji: '📱' },
  { name: 'Bills', emoji: '💡' },
  { name: 'Rent', emoji: '🏠' },
  { name: 'Health', emoji: '💊' },
  { name: 'Savings', emoji: '🐷' },
  { name: 'Other', emoji: '🧾' },
]

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  username: '',
  onboarded: false,
  monthlyBudget: 0,
  savingsGoal: 0,
}

export const db = new Dexie('save-oo') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>
  categories: EntityTable<Category, 'id'>
  settings: EntityTable<Settings, 'id'>
}

db.version(1).stores({
  transactions: '++id, date, categoryId',
  categories: '++id, name',
  settings: 'id',
})

db.on('populate', (tx) => {
  tx.table('categories').bulkAdd(DEFAULT_CATEGORIES)
  tx.table('settings').add(DEFAULT_SETTINGS)
})
