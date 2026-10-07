import { db, type Category, type Income, type Recurring, type Settings, type Transaction } from '@/db/schema'
import { saveSettings } from '@/db/repo'

interface BackupFile {
  app: 'save-oo'
  version: 1
  exportedAt: string
  settings: Settings
  categories: Category[]
  transactions: Transaction[]
  incomes?: Income[] // absent in backups made before income existed
  recurring?: Recurring[] // absent in older backups
}

function download(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const stamp = () => new Date().toISOString().slice(0, 10)

export async function exportJSON() {
  const now = Date.now()
  const file: BackupFile = {
    app: 'save-oo',
    version: 1,
    exportedAt: new Date(now).toISOString(),
    settings: { ...(await db.settings.get(1))!, lastBackupAt: now },
    categories: await db.categories.toArray(),
    transactions: await db.transactions.toArray(),
    incomes: await db.incomes.toArray(),
    recurring: await db.recurring.toArray(),
  }
  download(`save-oo-backup-${stamp()}.json`, JSON.stringify(file, null, 2), 'application/json')
  await saveSettings({ lastBackupAt: now })
}

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

export async function exportCSV() {
  const categories = new Map((await db.categories.toArray()).map((c) => [c.id, c.name]))
  const expenses = (await db.transactions.toArray()).map((t) => ({
    date: t.date,
    cells: ['Expense', t.date, (t.amount / 100).toFixed(2), categories.get(t.categoryId) ?? 'Other', t.note],
  }))
  const incomes = (await db.incomes.toArray()).map((i) => ({
    date: i.date,
    cells: ['Income', i.date, (i.amount / 100).toFixed(2), i.source, i.note],
  }))
  const rows = [...expenses, ...incomes].sort((a, b) => a.date.localeCompare(b.date)).map((r) => r.cells.map(csvCell).join(','))
  download(`save-oo-${stamp()}.csv`, ['Type,Date,Amount (GHS),Category / Source,Note', ...rows].join('\n'), 'text/csv')
}

const validDate = (d: unknown) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)
const validAmount = (a: unknown) => Number.isSafeInteger(a) && (a as number) > 0

/** Replace ALL local data with the contents of a backup file. Throws on a bad file. */
export async function importJSON(text: string) {
  const file = JSON.parse(text) as Partial<BackupFile>
  if (file.app !== 'save-oo' || !Array.isArray(file.transactions) || !Array.isArray(file.categories) || !file.settings) {
    throw new Error('This is not a Save-oo backup file.')
  }
  const incomes = file.incomes ?? []
  const recurring = file.recurring ?? []
  const ok = (rows: { amount: number; date?: string; nextDue?: string }[]) =>
    rows.every((r) => validAmount(r.amount) && validDate(r.date ?? r.nextDue))
  if (!ok(file.transactions) || !ok(incomes) || !ok(recurring)) {
    throw new Error('The backup contains invalid entries.')
  }

  await db.transaction('rw', [db.transactions, db.categories, db.settings, db.incomes, db.recurring], async () => {
    await Promise.all([db.transactions.clear(), db.categories.clear(), db.settings.clear(), db.incomes.clear(), db.recurring.clear()])
    await db.categories.bulkAdd(file.categories!)
    await db.transactions.bulkAdd(file.transactions!)
    await db.incomes.bulkAdd(incomes)
    await db.recurring.bulkAdd(recurring)
    await db.settings.add({ ...file.settings!, id: 1 })
  })
}

/** Wipe everything and start fresh (re-seeds defaults). */
export async function resetAll() {
  await db.delete()
  location.reload()
}
