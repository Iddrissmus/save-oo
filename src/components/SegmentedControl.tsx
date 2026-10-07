import { cn } from '@/lib/utils'

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div role="tablist" className="grid auto-cols-fr grid-flow-col rounded-xl bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-lg py-1.5 text-sm font-medium transition-colors',
            o.value === value ? 'bg-card shadow-sm' : 'text-muted-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
