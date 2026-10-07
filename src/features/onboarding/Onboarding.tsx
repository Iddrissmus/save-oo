import { LineChart, PiggyBank, PenLine, Wallet, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { saveSettings } from '@/db/repo'
import { cn } from '@/lib/utils'

const INTRO: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: PenLine,
    title: 'Log every spend',
    body: 'Add what you spend in seconds, down to the last pesewa. Small spends add up, so nothing gets left out.',
  },
  {
    Icon: LineChart,
    title: 'See where it goes',
    body: 'Get a clear view of your spending by day and by category, so you know exactly where your money disappears.',
  },
  {
    Icon: PiggyBank,
    title: 'Save with a plan',
    body: 'Set a monthly budget and a savings goal, and always know how much you have left to spend each day.',
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0) // 0 = name, 1..n = intro cards
  const [name, setName] = useState('')
  const trimmed = name.trim()

  const finish = () => saveSettings({ username: trimmed, onboarded: true })

  if (step === 0) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 p-6">
        <div className="space-y-3">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Wallet className="size-7" />
          </span>
          <h1 className="text-3xl font-semibold">Save-oo</h1>
          <p className="text-muted-foreground">Know where every pesewa goes.</p>
        </div>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (trimmed) setStep(1)
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="font-medium">What should we call you?</span>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="Your name"
              className="h-12 bg-card text-lg"
            />
          </label>
          <Button type="submit" disabled={!trimmed} size="lg" className="h-12 rounded-2xl text-base">
            Continue
          </Button>
        </form>
      </main>
    )
  }

  const { Icon, title, body } = INTRO[step - 1]
  const isLast = step === INTRO.length

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-between p-6">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={finish} className="text-muted-foreground">
          Skip
        </Button>
      </div>

      <section className="flex flex-col items-center gap-5 text-center">
        <span className="flex size-28 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-14" />
        </span>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{body}</p>
      </section>

      <div className="flex flex-col gap-6">
        <div className="flex justify-center gap-2" aria-hidden>
          {INTRO.map((_, i) => (
            <span
              key={i}
              className={cn('h-2 rounded-full transition-all', i === step - 1 ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30')}
            />
          ))}
        </div>
        <Button
          size="lg"
          className="h-12 rounded-2xl text-base"
          onClick={() => (isLast ? finish() : setStep(step + 1))}
        >
          {isLast ? `Let's go, ${trimmed}` : 'Next'}
        </Button>
      </div>
    </main>
  )
}
