import { createContext, useContext } from 'react'

interface LockApi {
  /** Mark the app as unlocked for this session (used right after a PIN is set). */
  unlock: () => void
  /** Show the lock screen now. */
  lockNow: () => void
}

export const LockContext = createContext<LockApi>({ unlock: () => {}, lockNow: () => {} })

export const useLock = () => useContext(LockContext)
