import { useEffect, useMemo, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { toast } from 'sonner'
import Layout from '@/components/Layout'
import { useSettings } from '@/db/hooks'
import { generateDueRecurring } from '@/db/recurring'
import ExpenseForm from '@/features/add/ExpenseForm'
import IncomeForm from '@/features/add/IncomeForm'
import Help from '@/features/help/Help'
import History from '@/features/history/History'
import Home from '@/features/home/Home'
import Insights from '@/features/insights/Insights'
import Onboarding from '@/features/onboarding/Onboarding'
import RecurringPage from '@/features/recurring/Recurring'
import RecurringForm from '@/features/recurring/RecurringForm'
import Settings from '@/features/settings/Settings'
import LockScreen from '@/features/lock/LockScreen'
import { LockContext } from '@/features/lock/lockContext'
import { todayISO } from '@/lib/dates'

const RELOCK_AFTER_MS = 60_000 // lock again after the app has been in the background this long

/** Create any recurring expenses that have come due, on launch and whenever the app is reopened. */
function useRecurringJob(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const run = () =>
      generateDueRecurring(todayISO()).then((n) => {
        if (n > 0) toast(`Added ${n} recurring expense${n > 1 ? 's' : ''}`)
      })
    run()
    const onVisible = () => document.visibilityState === 'visible' && run()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [enabled])
}

/** Re-lock when the app comes back after being hidden for a while. */
function useRelock(enabled: boolean, lock: () => void) {
  useEffect(() => {
    if (!enabled) return
    let hiddenAt = 0
    const onChange = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now()
      else if (hiddenAt && Date.now() - hiddenAt > RELOCK_AFTER_MS) lock()
    }
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [enabled, lock])
}

export default function App() {
  const settings = useSettings()
  const [unlocked, setUnlocked] = useState(false)
  const hasPin = !!(settings?.pinHash && settings.pinSalt)
  const lockApi = useMemo(() => ({ unlock: () => setUnlocked(true), lockNow: () => setUnlocked(false) }), [])
  useRecurringJob(!!settings?.onboarded)
  useRelock(hasPin, lockApi.lockNow)

  if (!settings) return null // first read from IndexedDB in flight
  if (!settings.onboarded) return <Onboarding />
  if (hasPin && !unlocked) {
    return <LockScreen salt={settings.pinSalt!} hash={settings.pinHash!} onUnlock={lockApi.unlock} />
  }

  return (
    <LockContext.Provider value={lockApi}>
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/recurring" element={<RecurringPage />} />
          <Route path="/help" element={<Help />} />
        </Route>
        <Route path="/add" element={<ExpenseForm />} />
        <Route path="/edit/:id" element={<ExpenseForm />} />
        <Route path="/add-income" element={<IncomeForm />} />
        <Route path="/edit-income/:id" element={<IncomeForm />} />
        <Route path="/recurring/:id" element={<RecurringForm />} />
      </Routes>
    </HashRouter>
    </LockContext.Provider>
  )
}
