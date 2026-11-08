'use client'

import { cn } from 'cn'
import { activityIconOptions } from '@/lib/activity-icons'

export default function ActivityIconPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {activityIconOptions.map(option => {
        const Icon = option.icon
        const selected = value === option.name

        return (
          <button
            key={option.name}
            type="button"
            title={option.label}
            aria-label={option.label}
            aria-pressed={selected}
            onClick={() => onChange(option.name)}
            className={cn(
              'group flex min-h-28 min-w-0 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border bg-background p-3 text-muted-foreground transition-all',
              'hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/[0.04] hover:text-primary hover:shadow-sm',
              'focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20',
              selected && 'border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20',
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted/70 transition-colors group-hover:bg-primary/10">
              <Icon className="size-5" />
            </span>
            <span className="line-clamp-2 w-full min-w-0 overflow-hidden text-center text-xs leading-tight break-words whitespace-normal">
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
