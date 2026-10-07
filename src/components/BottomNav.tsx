import { BarChart3, Home, Plus, Receipt, Settings } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/history', label: 'History', Icon: Receipt },
  { to: '/insights', label: 'Insights', Icon: BarChart3 },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

export default function BottomNav() {
  return (
    <>
      <Link
        to="/add"
        aria-label="Add expense"
        className="fixed bottom-20 right-[max(1rem,calc(50%-14rem+1rem))] z-10 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
      >
        <Plus className="size-7" />
      </Link>
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <ul className="mx-auto flex max-w-md">
          {items.map(({ to, label, Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 py-2 text-xs',
                    isActive ? 'font-semibold text-primary' : 'text-muted-foreground',
                  )
                }
              >
                <Icon className="size-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
