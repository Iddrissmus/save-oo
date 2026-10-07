import { dueOccurrences, firstOnOrAfter } from '@/lib/recurring'
import { db, type Recurring, type Transaction } from './schema'

export type NewRecurring = Omit<Recurring, 'id' | 'createdAt'>

export function addRecurring(r: NewRecurring) {
  return db.recurring.add({ ...r, createdAt: Date.now() } as Recurring)
}

export function updateRecurring(id: number, changes: Partial<NewRecurring>) {
  return db.recurring.update(id, changes)
}

export function deleteRecurring(id: number) {
  return db.recurring.delete(id)
}

/** Pause or resume. Resuming skips missed dates instead of back-filling them. */
export async function setRecurringActive(r: Recurring, active: boolean, today: string) {
  await db.recurring.update(r.id, {
    active,
    ...(active && { nextDue: firstOnOrAfter(r.nextDue, today, r.frequency, r.dayOfMonth) }),
  })
}

/**
 * Create an expense for every recurring date that has come due (including ones missed while the
 * app was closed). Runs in one transaction and advances `nextDue`, so repeat calls never duplicate.
 * Returns how many expenses were created.
 */
export function generateDueRecurring(today: string): Promise<number> {
  return db.transaction('rw', db.recurring, db.transactions, async () => {
    const due = await db.recurring.where('nextDue').belowOrEqual(today).filter((r) => r.active).toArray()
    let created = 0
    for (const r of due) {
      const { dates, nextDue } = dueOccurrences(r.nextDue, today, r.frequency, r.dayOfMonth)
      await db.transactions.bulkAdd(
        dates.map(
          (date) =>
            ({
              amount: r.amount,
              categoryId: r.categoryId,
              note: r.note,
              date,
              createdAt: Date.now(),
              recurringId: r.id,
            }) as Transaction,
        ),
      )
      await db.recurring.update(r.id, { nextDue })
      created += dates.length
    }
    return created
  })
}
