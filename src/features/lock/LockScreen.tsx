import { Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { resetAll } from '@/lib/backup'
import { verifyPin } from '@/lib/pin'
import PinEntry from './PinEntry'

const MAX_TRIES = 5
const WAIT_SECONDS = 30

export default function LockScreen({ salt, hash, onUnlock }: { salt: string; hash: string; onUnlock: () => void }) {
  const [fails, setFails] = useState(0)
  const [error, setError] = useState('')
  const [wait, setWait] = useState(0) // seconds left before another try

  useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  const check = async (pin: string) => {
    if (await verifyPin(pin, salt, hash)) return onUnlock()
    const next = fails + 1
    setFails(next)
    if (next % MAX_TRIES === 0) {
      setWait(WAIT_SECONDS * (next / MAX_TRIES))
      setError('')
    } else {
      setError('Wrong PIN')
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 p-6">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Lock className="size-7" />
      </span>
      <PinEntry
        title="Enter your PIN"
        subtitle={wait > 0 ? `Too many tries. Wait ${wait}s.` : 'Save-oo is locked'}
        error={error}
        disabled={wait > 0}
        onComplete={check}
      />
      <button
        type="button"
        className="text-sm text-muted-foreground underline underline-offset-4"
        onClick={() => {
          if (
            confirm(
              'Forgot your PIN? The only way in is to ERASE all data on this device. You can then restore from a backup file. Erase now?',
            )
          )
            resetAll()
        }}
      >
        Forgot PIN?
      </button>
    </main>
  )
}
