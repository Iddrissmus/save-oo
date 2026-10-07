import type { Category } from '@/db/schema'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/categoryIcons'
import { cn } from '@/lib/utils'

export default function CategoryBadge({
  category,
  className,
}: {
  category?: Pick<Category, 'icon' | 'color'>
  className?: string
}) {
  const Icon = CATEGORY_ICONS[category?.icon ?? 'other'] ?? CATEGORY_ICONS.other
  const color = CATEGORY_COLORS[category?.color ?? 'slate'] ?? CATEGORY_COLORS.slate
  return (
    <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', color.chip, className)}>
      <Icon className="size-5" />
    </span>
  )
}
