import { Delete } from 'lucide-react'
import { useState } from 'react'
import { PIN_LENGTH } from '@/lib/pin'
import { cn } from '@/lib/utils'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']

/** Dots plus a numeric pad. Calls `onComplete` as soon as the last digit is entered. */
export default function PinEntry({
  title,
  subtitle,
  error,
  disabled,
  onComplete,
}: {
  title: string
  subtitle?: string
  error?: string
  disabled?: boolean
  onComplete: (pin: string) => void
}) {
  const [pin, setPin] = useState('')

  const press = (key: string) => {
    if (disabled || key === '') return
    if (key === 'back') return setPin((p) => p.slice(0, -1))
    if (pin.length >= PIN_LENGTH) return
    const next = pin + key
    if (next.length === PIN_LENGTH) {
      setPin('')
      onComplete(next)
    } else {
      setPin(next)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex gap-4" aria-label={`${pin.length} of ${PIN_LENGTH} digits entered`}>
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <span
            key={i}
            className={cn('size-4 rounded-full border-2 border-primary', i < pin.length && 'bg-primary')}
          />
        ))}
      </div>

      <p className="h-5 text-sm text-destructive" role="alert">
        {error}
      </p>

      <div className="grid w-full max-w-xs grid-cols-3 gap-3">
        {KEYS.map((k, i) =>
          k === '' ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              aria-label={k === 'back' ? 'Backspace' : k}
              disabled={disabled}
              onClick={() => press(k)}
              className="flex h-16 items-center justify-center rounded-full bg-card text-2xl font-medium shadow-sm active:bg-muted disabled:opacity-40"
            >
              {k === 'back' ? <Delete className="size-6" /> : k}
            </button>
          ),
        )}
      </div>
    </div>
  )
}
