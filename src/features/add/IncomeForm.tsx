import { X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Keypad, { AmountDisplay } from '@/components/Keypad'
import SegmentedControl from '@/components/SegmentedControl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIncome } from '@/db/hooks'
import { addIncome, deleteIncome, updateIncome } from '@/db/repo'
import { INCOME_SOURCES, type Income } from '@/db/schema'
import { todayISO } from '@/lib/dates'
import { pressKey } from '@/lib/keypad'
import { cedisToPesewas, formatCedis } from '@/lib/money'
import { cn } from '@/lib/utils'

/** Add (/add-income) or edit (/edit-income/:id) income. */
export default function IncomeForm() {
  const { id } = useParams()
  const editId = id ? Number(id) : undefined
  const existing = useIncome(editId)

  if (editId !== undefined && !existing) return null
  return <Form key={editId ?? 'new'} existing={existing} />
}

function Form({ existing }: { existing?: Income }) {
  const navigate = useNavigate()
  const [amount, setAmount] = useState(existing ? (existing.amount / 100).toFixed(2) : '')
  const [source, setSource] = useState(existing?.source ?? '')
  const [note, setNote] = useState(existing?.note ?? '')
  const [date, setDate] = useState(existing?.date ?? todayISO())

  const pesewas = cedisToPesewas(amount)
  const canSave = pesewas !== null && pesewas > 0 && source !== ''

  const save = async () => {
    if (!canSave) return
    const data = { amount: pesewas, source, note: note.trim(), date }
    if (existing) await updateIncome(existing.id, data)
    else await addIncome(data)
    toast.success(existing ? 'Income updated' : `Income ${formatCedis(pesewas)} added`)
    navigate(-1)
  }

  const remove = async () => {
    if (existing && confirm('Delete this income?')) {
      await deleteIncome(existing.id)
      toast('Income deleted')
      navigate(-1)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 p-5">
      <header className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="icon" aria-label="Close" onClick={() => navigate(-1)}>
          <X />
        </Button>
        {existing ? (
          <>
            <h1 className="font-semibold">Edit income</h1>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={remove}>
              Delete
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1">
              <SegmentedControl
                value="income"
                options={[
                  { value: 'expense', label: 'Expense' },
                  { value: 'income', label: 'Income' },
                ]}
                onChange={(v) => v === 'expense' && navigate('/add', { replace: true })}
              />
            </div>
            <span className="w-9" />
          </>
        )}
      </header>

      <AmountDisplay amount={amount} label="Money received" />

      <section className="flex flex-wrap justify-center gap-2">
        {INCOME_SOURCES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSource(s)}
            className={cn(
              'rounded-full border-2 px-4 py-2 text-sm',
              source === s ? 'border-primary bg-primary/5 font-medium' : 'border-transparent bg-card',
            )}
          >
            {s}
          </button>
        ))}
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
        <Keypad onPress={(k) => setAmount((a) => pressKey(a, k))} />
        <Button onClick={save} disabled={!canSave} size="lg" className="h-12 w-full rounded-2xl text-base">
          {existing ? 'Save changes' : 'Save income'}
        </Button>
      </div>
    </main>
  )
}
