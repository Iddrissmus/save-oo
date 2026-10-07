import Dexie, { type EntityTable } from 'dexie'

export interface Category {
  id: number
  name: string
  icon: string // key into CATEGORY_ICONS (src/lib/categoryIcons.ts)
  color: string // key into CATEGORY_COLORS
}

export interface Transaction {
  id: number
  amount: number // pesewas
  categoryId: number
  note: string
  date: string // YYYY-MM-DD (local date)
  createdAt: number
}

export interface Income {
  id: number
  amount: number // pesewas
  source: string // e.g. Salary, Allowance
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
  lastBackupAt?: number // ms timestamp of the last export
}

export const INCOME_SOURCES = ['Salary', 'Allowance', 'Business', 'Gift', 'Other']

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Food', icon: 'food', color: 'orange' },
  { name: 'Transport', icon: 'transport', color: 'blue' },
  { name: 'Airtime/Data', icon: 'phone', color: 'violet' },
  { name: 'Bills', icon: 'bills', color: 'amber' },
  { name: 'Rent', icon: 'home', color: 'rose' },
  { name: 'Health', icon: 'health', color: 'red' },
  { name: 'Savings', icon: 'savings', color: 'emerald' },
  { name: 'Other', icon: 'other', color: 'slate' },
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
  incomes: EntityTable<Income, 'id'>
}

db.version(1).stores({
  transactions: '++id, date, categoryId',
  categories: '++id, name',
  settings: 'id',
})

// v2: emoji -> icon + color. Same indexes; only the row shape changes.
db.version(2)
  .stores({
    transactions: '++id, date, categoryId',
    categories: '++id, name',
    settings: 'id',
  })
  .upgrade(async (tx) => {
    await tx
      .table('categories')
      .toCollection()
      .modify((c: Category & { emoji?: string }) => {
        const match = DEFAULT_CATEGORIES.find((d) => d.name === c.name)
        c.icon = match?.icon ?? 'other'
        c.color = match?.color ?? 'slate'
        delete c.emoji
      })
  })

// v3: income table.
db.version(3).stores({
  transactions: '++id, date, categoryId',
  categories: '++id, name',
  settings: 'id',
  incomes: '++id, date',
})

db.on('populate', (tx) => {
  tx.table('categories').bulkAdd(DEFAULT_CATEGORIES)
  tx.table('settings').add(DEFAULT_SETTINGS)
})
