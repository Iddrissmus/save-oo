import { Delete } from 'lucide-react'
import { KEYPAD_KEYS } from '@/lib/keypad'
import { cn } from '@/lib/utils'

export function AmountDisplay({ amount, label = 'Amount' }: { amount: string; label?: string }) {
  return (
    <div className="py-2 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn('text-5xl font-semibold tabular-nums', !amount && 'text-muted-foreground/50')}>
        <span className="mr-1 text-3xl text-muted-foreground">GH₵</span>
        {amount || '0.00'}
      </p>
    </div>
  )
}

export default function Keypad({ onPress }: { onPress: (key: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYPAD_KEYS.map((k) => (
        <button
          key={k}
          type="button"
          aria-label={k === 'back' ? 'Backspace' : k}
          onClick={() => onPress(k)}
          className="flex h-14 items-center justify-center rounded-2xl bg-card text-2xl font-medium shadow-sm active:bg-muted"
        >
          {k === 'back' ? <Delete className="size-6" /> : k}
        </button>
      ))}
    </div>
  )
}
