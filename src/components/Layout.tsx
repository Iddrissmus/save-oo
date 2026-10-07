import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="mx-auto min-h-dvh max-w-md pb-32">
      <Outlet />
      <BottomNav />
    </div>
  )
}
