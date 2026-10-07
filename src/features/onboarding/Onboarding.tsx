import { useState } from 'react'
import { saveSettings } from '../../db/repo'

const INTRO = [
  {
    emoji: '✍️',
    title: 'Log every spend',
    body: 'Add what you spend in seconds, down to the last pesewa. Small spends add up, so nothing gets left out.',
  },
  {
    emoji: '🔍',
    title: 'See where it goes',
    body: 'Get a clear view of your spending by day and by category, so you know exactly where your money disappears.',
  },
  {
    emoji: '🐷',
    title: 'Save with a plan',
    body: 'Set a monthly budget and a savings goal, and always know how much you have left to spend.',
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0) // 0 = name, 1..n = intro cards
  const [name, setName] = useState('')
  const trimmed = name.trim()

  const finish = (username: string) => saveSettings({ username, onboarded: true })

  if (step === 0) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
        <div>
          <h1 className="text-3xl font-semibold text-teal-700">Save-oo</h1>
          <p className="mt-2 text-slate-600">Know where every pesewa goes.</p>
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
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="Your name"
              className="rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <button
            type="submit"
            disabled={!trimmed}
            className="rounded-xl bg-teal-700 px-4 py-3 font-medium text-white disabled:opacity-40"
          >
            Continue
          </button>
        </form>
      </main>
    )
  }

  const card = INTRO[step - 1]
  const isLast = step === INTRO.length

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-between p-6">
      <div className="flex justify-end">
        <button onClick={() => finish(trimmed)} className="text-sm text-slate-500">
          Skip
        </button>
      </div>

      <section className="flex flex-col items-center gap-4 text-center">
        <div className="text-7xl">{card.emoji}</div>
        <h2 className="text-2xl font-semibold">{card.title}</h2>
        <p className="text-slate-600">{card.body}</p>
      </section>

      <div className="flex flex-col gap-6">
        <div className="flex justify-center gap-2" aria-hidden>
          {INTRO.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i === step - 1 ? 'bg-teal-700' : 'bg-slate-300'}`}
            />
          ))}
        </div>
        <button
          onClick={() => (isLast ? finish(trimmed) : setStep(step + 1))}
          className="rounded-xl bg-teal-700 px-4 py-3 font-medium text-white"
        >
          {isLast ? `Let's go, ${trimmed}` : 'Next'}
        </button>
      </div>
    </main>
  )
}
