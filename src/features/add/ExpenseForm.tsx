import { Delete, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/categoryIcons'
import { useCategories, useTransaction } from '@/db/hooks'
import { addTransaction, deleteTransaction, updateTransaction } from '@/db/repo'
import type { Transaction } from '@/db/schema'
import { todayISO } from '@/lib/dates'
import { cedisToPesewas, formatCedis } from '@/lib/money'
import { cn } from '@/lib/utils'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back']

/** Apply one keypad press to the amount text, keeping it a valid cedi amount. */
function pressKey(amount: string, key: string): string {
  if (key === 'back') return amount.slice(0, -1)
  if (key === '.') {
    if (amount.includes('.')) return amount
    return amount === '' ? '0.' : amount + '.'
  }
  if (amount.length >= 9) return amount
  const decimals = amount.split('.')[1]
  if (decimals !== undefined && decimals.length >= 2) return amount
  return amount === '0' ? key : amount + key
}

/** Add (/add) or edit (/edit/:id) an expense. */
export default function ExpenseForm() {
  const { id } = useParams()
  const editId = id ? Number(id) : undefined
  const existing = useTransaction(editId)

  // Wait for the row before mounting the form so initial state is correct.
  if (editId !== undefined && !existing) return null
  return <Form key={editId ?? 'new'} existing={existing} />
}

function Form({ existing }: { existing?: Transaction }) {
  const navigate = useNavigate()
  const categories = useCategories()
  const [amount, setAmount] = useState(existing ? (existing.amount / 100).toFixed(2) : '')
  const [categoryId, setCategoryId] = useState<number | undefined>(existing?.categoryId)
  const [note, setNote] = useState(existing?.note ?? '')
  const [date, setDate] = useState(existing?.date ?? todayISO())

  const pesewas = cedisToPesewas(amount)
  const canSave = pesewas !== null && pesewas > 0 && categoryId !== undefined

  const save = async () => {
    if (!canSave) return
    const data = { amount: pesewas, categoryId, note: note.trim(), date }
    if (existing) await updateTransaction(existing.id, data)
    else await addTransaction(data)
    toast.success(existing ? 'Expense updated' : `Saved ${formatCedis(pesewas)}`)
    navigate(-1)
  }

  const remove = async () => {
    if (existing && confirm('Delete this expense?')) {
      await deleteTransaction(existing.id)
      toast('Expense deleted')
      navigate(-1)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 p-5">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="icon" aria-label="Close" onClick={() => navigate(-1)}>
          <X />
        </Button>
        <h1 className="font-semibold">{existing ? 'Edit expense' : 'Add expense'}</h1>
        {existing ? (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={remove}>
            Delete
          </Button>
        ) : (
          <span className="w-9" />
        )}
      </header>

      <div className="py-2 text-center">
        <p className="text-sm text-muted-foreground">Amount</p>
        <p className={cn('text-5xl font-semibold tabular-nums', !amount && 'text-muted-foreground/50')}>
          <span className="mr-1 text-3xl text-muted-foreground">GH₵</span>
          {amount || '0.00'}
        </p>
      </div>

      <section>
        <div className="grid grid-cols-4 gap-2">
          {categories?.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon] ?? CATEGORY_ICONS.other
            const color = CATEGORY_COLORS[c.color] ?? CATEGORY_COLORS.slate
            const selected = categoryId === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl border-2 p-2 text-xs transition-colors',
                  selected ? 'border-primary bg-primary/5 font-medium' : 'border-transparent bg-card',
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

      <div className="grid grid-cols-2 gap-2">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={80}
          placeholder="Note (optional)"
          className="h-11 bg-card"
        />
        <Input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="h-11 bg-card"
        />
      </div>

      <div className="mt-auto space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              aria-label={k === 'back' ? 'Backspace' : k}
              onClick={() => setAmount((a) => pressKey(a, k))}
              className="flex h-14 items-center justify-center rounded-2xl bg-card text-2xl font-medium shadow-sm active:bg-muted"
            >
              {k === 'back' ? <Delete className="size-6" /> : k}
            </button>
          ))}
        </div>
        <Button onClick={save} disabled={!canSave} size="lg" className="h-12 w-full rounded-2xl text-base">
          {existing ? 'Save changes' : 'Save expense'}
        </Button>
      </div>
    </main>
  )
}
