import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import MonthSwitcher from '@/components/MonthSwitcher'
import SegmentedControl from '@/components/SegmentedControl'
import TransactionRow from '@/components/TransactionRow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCategories, useIncomes, useTransactions } from '@/db/hooks'
import { CATEGORY_ICONS } from '@/lib/categoryIcons'
import { formatDay, monthRange, todayISO } from '@/lib/dates'
import { filterIncomes, filterTransactions, hasFilters, type Filters } from '@/lib/filters'
import { cedisToPesewas, formatCedis } from '@/lib/money'
import { totalOf } from '@/lib/stats'
import { cn } from '@/lib/utils'

const ALL_TIME = { from: '0000-01-01', to: '9999-12-31' }

/** Empty text means "not set"; unparseable text is ignored rather than blocking the list. */
const parseAmount = (s: string) => (s.trim() === '' ? undefined : (cedisToPesewas(s) ?? undefined))

export default function History() {
  const [view, setView] = useState<'expense' | 'income'>('expense')
  const [month, setMonth] = useState(todayISO())
  const [allTime, setAllTime] = useState(false)
  const [text, setText] = useState('')
  const [categoryId, setCategoryId] = useState<number>()
  const [minText, setMinText] = useState('')
  const [maxText, setMaxText] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { from, to } = allTime ? ALL_TIME : monthRange(month)
  const transactions = useTransactions(from, to)
  const incomes = useIncomes(from, to)
  const categories = useCategories()

  if (!transactions || !incomes || !categories) return null
  const byId = new Map(categories.map((c) => [c.id, c]))

  const filters: Filters = { text, categoryId: view === 'expense' ? categoryId : undefined, min: parseAmount(minText), max: parseAmount(maxText) }
  const active = hasFilters(filters)
  const shownExpenses = filterTransactions(transactions, filters, categories)
  const shownIncomes = filterIncomes(incomes, filters)
  const extraCount = Number(categoryId !== undefined && view === 'expense') + Number(minText !== '') + Number(maxText !== '')

  const clear = () => {
    setText('')
    setCategoryId(undefined)
    setMinText('')
    setMaxText('')
  }

  const groups = new Map<string, typeof shownExpenses>()
  for (const t of shownExpenses) groups.set(t.date, [...(groups.get(t.date) ?? []), t])

  return (
    <main className="space-y-4 p-5">
      <h1 className="text-xl font-semibold">History</h1>
      <SegmentedControl
        value={view}
        onChange={setView}
        options={[
          { value: 'expense', label: 'Expenses' },
          { value: 'income', label: 'Income' },
        ]}
      />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={view === 'expense' ? 'Search notes, categories, amounts' : 'Search source, notes, amounts'}
            className="h-10 bg-card pl-9 pr-9"
          />
          {text && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setText('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters || extraCount ? 'default' : 'outline'}
          className="relative h-10 w-10"
          size="icon"
          aria-label="Filters"
          onClick={() => setShowFilters((s) => !s)}
        >
          <SlidersHorizontal />
          {extraCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
              {extraCount}
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <section className="space-y-3 rounded-2xl bg-card p-4 shadow-sm">
          {view === 'expense' && (
            <div className="space-y-2">
              <h2 className="text-sm text-muted-foreground">Category</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const Icon = CATEGORY_ICONS[c.icon] ?? CATEGORY_ICONS.other
                  const on = categoryId === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(on ? undefined : c.id)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm',
                        on ? 'border-primary bg-primary/10 font-medium text-primary' : 'border-border',
                      )}
                    >
                      <Icon className="size-3.5" />
                      {c.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <h2 className="text-sm text-muted-foreground">Amount (GH₵)</h2>
            <div className="grid grid-cols-2 gap-2">
              <Input inputMode="decimal" value={minText} onChange={(e) => setMinText(e.target.value)} placeholder="Min" className="h-10" />
              <Input inputMode="decimal" value={maxText} onChange={(e) => setMaxText(e.target.value)} placeholder="Max" className="h-10" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={allTime} onChange={(e) => setAllTime(e.target.checked)} className="size-4 accent-primary" />
            Search all months
          </label>
        </section>
      )}

      {allTime ? (
        <p className="text-center text-sm font-medium">All months</p>
      ) : (
        <MonthSwitcher month={month} onChange={setMonth} />
      )}

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>
          {view === 'expense'
            ? `${shownExpenses.length} expense${shownExpenses.length === 1 ? '' : 's'} · ${formatCedis(totalOf(shownExpenses))}`
            : `${shownIncomes.length} ${shownIncomes.length === 1 ? 'entry' : 'entries'} · ${formatCedis(totalOf(shownIncomes))}`}
        </span>
        {active && (
          <button type="button" onClick={clear} className="text-primary underline underline-offset-2">
            Clear filters
          </button>
        )}
      </div>

      {view === 'expense' ? (
        <>
          {groups.size === 0 && (
            <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              {active ? 'No expenses match your search.' : 'No expenses this month.'}
            </p>
          )}
          {[...groups].map(([date, rows]) => (
            <section key={date}>
              <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>{allTime ? `${formatDay(date)} · ${date.slice(0, 4)}` : formatDay(date)}</span>
                <span className="tabular-nums">{formatCedis(totalOf(rows))}</span>
              </div>
              <div className="divide-y rounded-2xl bg-card px-4 shadow-sm">
                {rows.map((t) => (
                  <TransactionRow key={t.id} t={t} category={byId.get(t.categoryId)} />
                ))}
              </div>
            </section>
          ))}
        </>
      ) : (
        <>
          {shownIncomes.length === 0 && (
            <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              {active ? 'No income matches your search.' : 'No income recorded this month.'}{' '}
              {!active && (
                <Link to="/add-income" className="text-primary">
                  Add income
                </Link>
              )}
            </p>
          )}
          {shownIncomes.length > 0 && (
            <div className="divide-y rounded-2xl bg-card px-4 shadow-sm">
              {shownIncomes.map((i) => (
                <Link key={i.id} to={`/edit-income/${i.id}`} className="flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{i.source}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {allTime ? `${formatDay(i.date)} · ${i.date.slice(0, 4)}` : formatDay(i.date)}
                      {i.note ? ` · ${i.note}` : ''}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    +{formatCedis(i.amount)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
