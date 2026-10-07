import { X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import SegmentedControl from '@/components/SegmentedControl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCategories, useRecurringItem } from '@/db/hooks'
import { addRecurring, deleteRecurring, generateDueRecurring, updateRecurring } from '@/db/recurring'
import type { Recurring } from '@/db/schema'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/categoryIcons'
import { fromISO, todayISO } from '@/lib/dates'
import { cedisToPesewas } from '@/lib/money'
import type { Frequency } from '@/lib/recurring'
import { cn } from '@/lib/utils'

/** Add (/recurring/new) or edit (/recurring/:id) a recurring expense. */
export default function RecurringForm() {
  const { id } = useParams()
  const editId = id && id !== 'new' ? Number(id) : undefined
  const existing = useRecurringItem(editId)

  if (editId !== undefined && !existing) return null
  return <Form key={editId ?? 'new'} existing={existing} />
}

function Form({ existing }: { existing?: Recurring }) {
  const navigate = useNavigate()
  const categories = useCategories()
  const [amount, setAmount] = useState(existing ? (existing.amount / 100).toFixed(2) : '')
  const [categoryId, setCategoryId] = useState<number | undefined>(existing?.categoryId)
  const [note, setNote] = useState(existing?.note ?? '')
  const [frequency, setFrequency] = useState<Frequency>(existing?.frequency ?? 'monthly')
  const [date, setDate] = useState(existing?.nextDue ?? todayISO())

  const pesewas = cedisToPesewas(amount)
  const canSave = pesewas !== null && pesewas > 0 && categoryId !== undefined && date !== ''
  const backfills = !existing && date < todayISO()

  const save = async () => {
    if (!canSave) return
    const data = {
      amount: pesewas,
      categoryId,
      note: note.trim(),
      frequency,
      dayOfMonth: fromISO(date).getDate(),
      nextDue: date,
    }
    if (existing) await updateRecurring(existing.id, data)
    else await addRecurring({ ...data, active: true })
    // A start date of today (or earlier) is already due, so create it right away.
    const created = await generateDueRecurring(todayISO())
    toast.success(created > 0 ? `Saved and added ${created} expense${created > 1 ? 's' : ''}` : 'Recurring expense saved')
    navigate('/recurring', { replace: true })
  }

  const remove = async () => {
    if (existing && confirm('Delete this recurring expense? Expenses it already created stay in your history.')) {
      await deleteRecurring(existing.id)
      toast('Recurring expense deleted')
      navigate('/recurring', { replace: true })
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 p-5">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="icon" aria-label="Close" onClick={() => navigate(-1)}>
          <X />
        </Button>
        <h1 className="font-semibold">{existing ? 'Edit recurring' : 'New recurring expense'}</h1>
        {existing ? (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={remove}>
            Delete
          </Button>
        ) : (
          <span className="w-9" />
        )}
      </header>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">Amount (GH₵)</span>
        <Input
          autoFocus={!existing}
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 500"
          className="h-12 bg-card text-xl"
        />
        {amount && pesewas === null && <span className="text-destructive">Enter an amount like 12 or 12.50</span>}
      </label>

      <section className="space-y-2">
        <h2 className="text-sm text-muted-foreground">Category</h2>
        <div className="grid grid-cols-4 gap-2">
          {categories?.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon] ?? CATEGORY_ICONS.other
            const color = CATEGORY_COLORS[c.color] ?? CATEGORY_COLORS.slate
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl border-2 p-2 text-xs transition-colors',
                  categoryId === c.id ? 'border-primary bg-primary/5 font-medium' : 'border-transparent bg-card',
                )}
              >
                <span className={cn('flex size-9 items-center justify-center rounded-full', color.chip)}>
                  <Icon className="size-4" />
                </span>
                <span className="w-full truncate text-center">{c.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={80}
        placeholder="Name or note, e.g. Rent"
        className="h-11 bg-card"
      />

      <section className="space-y-2">
        <h2 className="text-sm text-muted-foreground">How often</h2>
        <SegmentedControl
          value={frequency}
          onChange={setFrequency}
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'weekly', label: 'Weekly' },
          ]}
        />
      </section>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground">{existing ? 'Next due date' : 'First date'}</span>
        <Input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="h-11 bg-card" />
        {frequency === 'monthly' && (
          <span className="text-muted-foreground">
            Repeats on day {date ? fromISO(date).getDate() : '?'} each month (the last day in shorter months).
          </span>
        )}
        {backfills && (
          <span className="block text-amber-700 dark:text-amber-300">
            This date is in the past, so the missed ones will be added as expenses now.
          </span>
        )}
      </label>

      <Button onClick={save} disabled={!canSave} size="lg" className="mt-auto h-12 w-full rounded-2xl text-base">
        Save
      </Button>
    </main>
  )
}
