import { BookOpen, ChevronRight, Download, FileUp, Moon, Plus, Repeat, Sun, Trash2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import CategoryBadge from '@/components/CategoryBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCategories, useSettings } from '@/db/hooks'
import { db } from '@/db/schema'
import { saveSettings } from '@/db/repo'
import { exportCSV, exportJSON, importJSON, resetAll } from '@/lib/backup'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/categoryIcons'
import { cedisToPesewas } from '@/lib/money'
import { cn } from '@/lib/utils'

export default function Settings() {
  const settings = useSettings()
  if (!settings) return null
  return (
    <main className="space-y-5 p-5">
      <h1 className="text-xl font-semibold">Settings</h1>
      <Link to="/help" className="flex items-center gap-3 rounded-2xl bg-primary/10 p-4 text-primary">
        <BookOpen className="size-5" />
        <span className="flex-1 font-medium">How to use Save-oo</span>
        <ChevronRight className="size-5" />
      </Link>
      <Link to="/recurring" className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
        <Repeat className="size-5 text-primary" />
        <span className="flex-1">
          <span className="block font-medium">Recurring expenses</span>
          <span className="block text-sm text-muted-foreground">Rent, bundles, subscriptions</span>
        </span>
        <ChevronRight className="size-5 text-muted-foreground" />
      </Link>
      <Profile username={settings.username} />
      <Goals budget={settings.monthlyBudget} goal={settings.savingsGoal} />
      <Categories />
      <Appearance />
      <Data lastBackupAt={settings.lastBackupAt} />
    </main>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl bg-card p-4 shadow-sm">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Profile({ username }: { username: string }) {
  const [name, setName] = useState(username)
  return (
    <Card title="Profile">
      <div className="flex gap-2">
        <Input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <Button
          disabled={!name.trim() || name.trim() === username}
          onClick={() => saveSettings({ username: name.trim() }).then(() => toast.success('Name updated'))}
        >
          Save
        </Button>
      </div>
    </Card>
  )
}

function Goals({ budget, goal }: { budget: number; goal: number }) {
  const toText = (p: number) => (p ? (p / 100).toFixed(2) : '')
  const [b, setB] = useState(toText(budget))
  const [g, setG] = useState(toText(goal))
  const parsed = (s: string) => (s.trim() === '' ? 0 : cedisToPesewas(s))
  const bp = parsed(b)
  const gp = parsed(g)

  return (
    <Card title="Budget & savings">
      <label className="block space-y-1 text-sm">
        <span className="text-muted-foreground">Monthly budget (GH₵)</span>
        <Input inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} placeholder="e.g. 1500" />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted-foreground">Monthly savings goal (GH₵)</span>
        <Input inputMode="decimal" value={g} onChange={(e) => setG(e.target.value)} placeholder="e.g. 300" />
      </label>
      <Button
        className="w-full"
        disabled={bp === null || gp === null || (bp === budget && gp === goal)}
        onClick={() => saveSettings({ monthlyBudget: bp!, savingsGoal: gp! }).then(() => toast.success('Saved'))}
      >
        Save
      </Button>
    </Card>
  )
}

const ICON_KEYS = Object.keys(CATEGORY_ICONS)
const COLOR_KEYS = Object.keys(CATEGORY_COLORS)

function Categories() {
  const categories = useCategories()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('shopping')
  const [color, setColor] = useState('teal')

  const add = async () => {
    const n = name.trim()
    if (!n) return
    await db.categories.add({ name: n, icon, color } as never)
    setName('')
    setAdding(false)
  }

  const remove = async (id: number) => {
    const used =
      (await db.transactions.where('categoryId').equals(id).count()) +
      (await db.recurring.where('categoryId').equals(id).count())
    if (used > 0) return toast.error(`${used} expenses or recurring items use this category, so it can't be deleted.`)
    await db.categories.delete(id)
  }

  return (
    <Card title="Categories">
      <ul className="space-y-2">
        {categories?.map((c) => (
          <li key={c.id} className="flex items-center gap-3">
            <CategoryBadge category={c} className="size-8" />
            <span className="flex-1">{c.name}</span>
            <Button variant="ghost" size="icon" aria-label={`Delete ${c.name}`} onClick={() => remove(c.id)}>
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="space-y-3 rounded-xl border p-3">
          <Input autoFocus value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          <div className="flex flex-wrap gap-2">
            {ICON_KEYS.map((k) => {
              const Icon = CATEGORY_ICONS[k]
              return (
                <button
                  key={k}
                  type="button"
                  aria-label={k}
                  onClick={() => setIcon(k)}
                  className={cn('rounded-lg border-2 p-2', icon === k ? 'border-primary' : 'border-transparent bg-muted')}
                >
                  <Icon className="size-4" />
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {COLOR_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                aria-label={k}
                onClick={() => setColor(k)}
                className={cn('size-7 rounded-full border-2', CATEGORY_COLORS[k].bar, color === k ? 'border-foreground' : 'border-transparent')}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button className="flex-1" disabled={!name.trim()} onClick={add}>
              Add
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setAdding(true)}>
          <Plus /> Add category
        </Button>
      )}
    </Card>
  )
}

function Appearance() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === 'dark'
  return (
    <Card title="Appearance">
      <Button variant="outline" className="w-full" onClick={() => setTheme(dark ? 'light' : 'dark')}>
        {dark ? <Sun /> : <Moon />} Switch to {dark ? 'light' : 'dark'} mode
      </Button>
    </Card>
  )
}

function Data({ lastBackupAt }: { lastBackupAt?: number }) {
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = async (file?: File) => {
    if (!file) return
    if (!confirm('Importing replaces ALL data on this device with the backup. Continue?')) return
    try {
      await importJSON(await file.text())
      toast.success('Backup restored')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not read that file.')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <Card title="Your data">
      <p className="text-sm text-muted-foreground">
        Everything is stored only on this device. Export a backup now and then so you never lose it.
      </p>
      <p className="text-sm font-medium">
        {lastBackupAt ? `Last backup: ${new Date(lastBackupAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'No backup yet'}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={exportJSON}>
          <Download /> Backup
        </Button>
        <Button variant="outline" onClick={exportCSV}>
          <Download /> CSV
        </Button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
        <FileUp /> Restore from backup
      </Button>
      <Button
        variant="ghost"
        className="w-full text-destructive"
        onClick={() => confirm('Delete ALL your data? This cannot be undone.') && resetAll()}
      >
        Erase all data
      </Button>
    </Card>
  )
}
