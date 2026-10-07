import { useEffect } from 'react'
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
import { todayISO } from '@/lib/dates'

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

export default function App() {
  const settings = useSettings()
  useRecurringJob(!!settings?.onboarded)

  if (!settings) return null // first read from IndexedDB in flight
  if (!settings.onboarded) return <Onboarding />

  return (
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
  )
}
