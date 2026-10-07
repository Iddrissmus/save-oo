import { Lock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { saveSettings } from '@/db/repo'
import { generateSalt, hashPin, verifyPin } from '@/lib/pin'
import PinEntry from './PinEntry'
import { useLock } from './lockContext'

type Step =
  | { kind: 'idle' }
  | { kind: 'verify'; then: 'remove' | 'change' }
  | { kind: 'new' }
  | { kind: 'confirm'; first: string }

export default function AppLockCard({ salt, hash }: { salt?: string; hash?: string }) {
  const { unlock, lockNow } = useLock()
  const [step, setStep] = useState<Step>({ kind: 'idle' })
  const [error, setError] = useState('')
  const hasPin = !!(salt && hash)

  const go = (s: Step) => {
    setError('')
    setStep(s)
  }

  const verifyCurrent = async (pin: string, then: 'remove' | 'change') => {
    if (!salt || !hash || !(await verifyPin(pin, salt, hash))) return setError('Wrong PIN')
    if (then === 'change') return go({ kind: 'new' })
    await saveSettings({ pinHash: undefined, pinSalt: undefined })
    toast.success('App lock turned off')
    go({ kind: 'idle' })
  }

  const confirmNew = async (pin: string, first: string) => {
    if (pin !== first) {
      setError("PINs didn't match. Try again.")
      return setStep({ kind: 'new' })
    }
    const newSalt = generateSalt()
    await saveSettings({ pinSalt: newSalt, pinHash: await hashPin(pin, newSalt) })
    unlock() // you just proved you know it, so don't lock yourself out mid-session
    toast.success('App lock is on')
    go({ kind: 'idle' })
  }

  return (
    <section className="space-y-3 rounded-2xl bg-card p-4 shadow-sm">
      <h2 className="flex items-center gap-2 font-semibold">
        <Lock className="size-4" /> App lock
      </h2>

      {step.kind === 'idle' && (
        <>
          <p className="text-sm text-muted-foreground">
            Ask for a 4-digit PIN when the app opens and after it has been away for a minute. It keeps nosy people out
            of your spending, but it is a privacy screen, not encryption.
          </p>
          {hasPin ? (
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={lockNow}>
                Lock now
              </Button>
              <Button variant="outline" onClick={() => go({ kind: 'verify', then: 'change' })}>
                Change
              </Button>
              <Button variant="outline" onClick={() => go({ kind: 'verify', then: 'remove' })}>
                Turn off
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={() => go({ kind: 'new' })}>
              Set a PIN
            </Button>
          )}
        </>
      )}

      {step.kind !== 'idle' && (
        <div className="space-y-3 py-2">
          {step.kind === 'verify' && (
            <PinEntry key="verify" title="Enter your current PIN" error={error} onComplete={(p) => verifyCurrent(p, step.then)} />
          )}
          {step.kind === 'new' && (
            <PinEntry
              key="new"
              title="Choose a 4-digit PIN"
              subtitle="If you forget it, the only way back in is to erase the app's data and restore a backup."
              error={error}
              onComplete={(p) => go({ kind: 'confirm', first: p })}
            />
          )}
          {step.kind === 'confirm' && (
            <PinEntry key="confirm" title="Enter it again" error={error} onComplete={(p) => confirmNew(p, step.first)} />
          )}
          <Button variant="ghost" className="w-full" onClick={() => go({ kind: 'idle' })}>
            Cancel
          </Button>
        </div>
      )}
    </section>
  )
}
