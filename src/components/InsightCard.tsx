import { AlertTriangle, CheckCircle2, Info, Lightbulb, type LucideIcon } from 'lucide-react'
import type { Insight, InsightKind } from '@/lib/insights'
import { formatCedis } from '@/lib/money'
import { cn } from '@/lib/utils'

const STYLE: Record<InsightKind, { Icon: LucideIcon; box: string }> = {
  warning: { Icon: AlertTriangle, box: 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200' },
  tip: { Icon: Lightbulb, box: 'bg-teal-50 text-teal-900 dark:bg-teal-500/10 dark:text-teal-200' },
  info: { Icon: Info, box: 'bg-sky-50 text-sky-900 dark:bg-sky-500/10 dark:text-sky-200' },
  good: { Icon: CheckCircle2, box: 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200' },
}

export default function InsightCard({ insight }: { insight: Insight }) {
  const { Icon, box } = STYLE[insight.kind]
  return (
    <div className={cn('flex gap-3 rounded-2xl p-4', box)}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="space-y-1 text-sm">
        <p className="font-semibold">{insight.title}</p>
        <p className="opacity-90">{insight.body}</p>
        {insight.saving ? (
          <p className="font-medium">Could free up about {formatCedis(insight.saving)}</p>
        ) : null}
      </div>
    </div>
  )
}
