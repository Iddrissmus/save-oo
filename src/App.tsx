import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import { useSettings } from '@/db/hooks'
import ExpenseForm from '@/features/add/ExpenseForm'
import IncomeForm from '@/features/add/IncomeForm'
import History from '@/features/history/History'
import Home from '@/features/home/Home'
import Insights from '@/features/insights/Insights'
import Onboarding from '@/features/onboarding/Onboarding'
import Settings from '@/features/settings/Settings'

export default function App() {
  const settings = useSettings()

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
        </Route>
        <Route path="/add" element={<ExpenseForm />} />
        <Route path="/edit/:id" element={<ExpenseForm />} />
        <Route path="/add-income" element={<IncomeForm />} />
        <Route path="/edit-income/:id" element={<IncomeForm />} />
      </Routes>
    </HashRouter>
  )
}
