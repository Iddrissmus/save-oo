import { db, type Category, type Settings, type Transaction } from '@/db/schema'

interface BackupFile {
  app: 'save-oo'
  version: 1
  exportedAt: string
  settings: Settings
  categories: Category[]
  transactions: Transaction[]
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
  const file: BackupFile = {
    app: 'save-oo',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: (await db.settings.get(1))!,
    categories: await db.categories.toArray(),
    transactions: await db.transactions.toArray(),
  }
  download(`save-oo-backup-${stamp()}.json`, JSON.stringify(file, null, 2), 'application/json')
}

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

export async function exportCSV() {
  const categories = new Map((await db.categories.toArray()).map((c) => [c.id, c.name]))
  const rows = (await db.transactions.orderBy('date').toArray()).map((t) =>
    [t.date, (t.amount / 100).toFixed(2), categories.get(t.categoryId) ?? 'Other', t.note].map(csvCell).join(','),
  )
  download(`save-oo-expenses-${stamp()}.csv`, ['Date,Amount (GHS),Category,Note', ...rows].join('\n'), 'text/csv')
}

/** Replace ALL local data with the contents of a backup file. Throws on a bad file. */
export async function importJSON(text: string) {
  const file = JSON.parse(text) as Partial<BackupFile>
  if (file.app !== 'save-oo' || !Array.isArray(file.transactions) || !Array.isArray(file.categories) || !file.settings) {
    throw new Error('This is not a Save-oo backup file.')
  }
  const valid = file.transactions.every(
    (t) => Number.isSafeInteger(t.amount) && t.amount > 0 && typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date),
  )
  if (!valid) throw new Error('The backup contains invalid expenses.')

  await db.transaction('rw', db.transactions, db.categories, db.settings, async () => {
    await Promise.all([db.transactions.clear(), db.categories.clear(), db.settings.clear()])
    await db.categories.bulkAdd(file.categories!)
    await db.transactions.bulkAdd(file.transactions!)
    await db.settings.add({ ...file.settings!, id: 1 })
  })
}

/** Wipe everything and start fresh (re-seeds defaults). */
export async function resetAll() {
  await db.delete()
  location.reload()
}
