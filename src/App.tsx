import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSettings } from './db/hooks'
import Onboarding from './features/onboarding/Onboarding'

function Home({ username }: { username: string }) {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold text-teal-700">Hi, {username}</h1>
      <p className="mt-2 text-slate-600">Track every pesewa you spend.</p>
    </main>
  )
}

export default function App() {
  const settings = useSettings()

  if (!settings) return null // first read from IndexedDB in flight
  if (!settings.onboarded) return <Onboarding />

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home username={settings.username} />} />
      </Routes>
    </HashRouter>
  )
}
