import { Repeat } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Category, Transaction } from '@/db/schema'
import { formatCedis } from '@/lib/money'
import CategoryBadge from './CategoryBadge'

export default function TransactionRow({ t, category }: { t: Transaction; category?: Category }) {
  return (
    <Link to={`/edit/${t.id}`} className="flex items-center gap-3 py-3">
      <CategoryBadge category={category} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 truncate font-medium">
          {category?.name ?? 'Other'}
          {t.recurringId !== undefined && <Repeat className="size-3 text-muted-foreground" aria-label="Recurring" />}
        </span>
        {t.note && <span className="block truncate text-sm text-muted-foreground">{t.note}</span>}
      </span>
      <span className="font-semibold tabular-nums">{formatCedis(t.amount)}</span>
    </Link>
  )
}
