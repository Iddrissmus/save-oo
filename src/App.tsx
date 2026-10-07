import { HashRouter, Route, Routes } from 'react-router-dom'

function Home() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold text-teal-700">Save-oo</h1>
      <p className="mt-2 text-slate-600">Track every pesewa you spend.</p>
    </main>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </HashRouter>
  )
}
