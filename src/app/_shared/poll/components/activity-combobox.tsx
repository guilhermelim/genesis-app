'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from 'cn'
import { getActivityIcon } from '@/lib/activity-icons'

export interface ActivityComboboxActivity {
  id: string
  name: string
  label: string
  iconName?: string
}

export default function ActivityCombobox({
  activities,
  value,
  onValueChange,
}: {
  activities: ActivityComboboxActivity[]
  value: string
  onValueChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputId = useId()
  const listId = `${inputId}-list`
  const selectedActivity = activities.find(activity => activity.id === value)
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
  const filteredActivities = activities.filter(activity =>
    `${activity.label} ${activity.name}`.toLocaleLowerCase('pt-BR').includes(normalizedQuery),
  )
  const activeIndex = Math.min(highlightedIndex, Math.max(filteredActivities.length - 1, 0))

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const selectActivity = (activity: ActivityComboboxActivity) => {
    onValueChange(activity.id)
    setQuery(`${activity.label} - ${activity.name}`)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={inputId}
          value={open ? query : selectedActivity ? `${selectedActivity.label} - ${selectedActivity.name}` : ''}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={open ? listId : undefined}
          aria-expanded={open}
          autoComplete="off"
          placeholder="Busque por horário ou atividade..."
          className="h-11 pr-10 pl-9"
          onFocus={() => {
            setQuery(selectedActivity ? `${selectedActivity.label} - ${selectedActivity.name}` : '')
            setOpen(true)
          }}
          onChange={event => {
            setQuery(event.target.value)
            onValueChange('')
            setHighlightedIndex(0)
            setOpen(true)
          }}
          onKeyDown={event => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setOpen(true)
              setHighlightedIndex(index => Math.min(index + 1, filteredActivities.length - 1))
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setHighlightedIndex(index => Math.max(index - 1, 0))
            }
            if (event.key === 'Enter' && open && filteredActivities[activeIndex]) {
              event.preventDefault()
              selectActivity(filteredActivities[activeIndex])
            }
            if (event.key === 'Escape') {
              setOpen(false)
              setQuery(selectedActivity ? `${selectedActivity.label} - ${selectedActivity.name}` : '')
            }
          }}
        />
        <ChevronDown
          className={cn(
            'pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </div>
      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Atividades disponíveis"
          className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {filteredActivities.length ? (
            filteredActivities.map((activity, index) => (
              <button
                key={activity.id}
                type="button"
                role="option"
                aria-selected={activity.id === value}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm outline-none transition-colors',
                  'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground',
                  index === activeIndex && 'bg-accent text-accent-foreground',
                )}
                onMouseDown={event => event.preventDefault()}
                onClick={() => selectActivity(activity)}
              >
                {(() => {
                  const Icon = getActivityIcon(activity.iconName)
                  return <Icon className="size-4 shrink-0 text-primary" />
                })()}
                <span className="min-w-0 flex-1 truncate">
                  {activity.label} - {activity.name}
                </span>
                {activity.id === value && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhuma atividade encontrada.</p>
          )}
        </div>
      )}
    </div>
  )
}
