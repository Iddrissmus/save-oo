import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addMonths, formatMonth, isSameMonth, todayISO } from '@/lib/dates'

/** `month` is any date inside the month being shown. */
export default function MonthSwitcher({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const isCurrent = isSameMonth(month, todayISO())
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => onChange(addMonths(month, -1))}>
        <ChevronLeft />
      </Button>
      <span className="font-medium">{formatMonth(month)}</span>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Next month"
        disabled={isCurrent}
        onClick={() => onChange(addMonths(month, 1))}
      >
        <ChevronRight />
      </Button>
    </div>
  )
}
