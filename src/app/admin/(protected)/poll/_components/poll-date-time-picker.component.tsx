'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Check, ChevronDownIcon, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const hours = Array.from({ length: 24 }, (_, index) => index)
const minutes = Array.from({ length: 60 }, (_, index) => index)

export default function PollDateTimePicker({ value, onChange }: { value?: Date; onChange: (value?: Date) => void }) {
  const [open, setOpen] = React.useState(false)
  const [timeOpen, setTimeOpen] = React.useState(false)
  const date = value ? new Date(value) : undefined
  const time = date ? format(date, 'HH:mm') : ''

  const updateTime = (hour: number, minute: number) => {
    if (!date) return
    const next = new Date(date)
    next.setHours(hour, minute, 0, 0)
    onChange(next)
  }

  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-3 sm:w-fit sm:max-w-none sm:grid-cols-[11rem_8rem]">
      <div className="min-w-0 space-y-2">
        <Label>Data</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button variant="outline" className="w-full justify-between font-normal">
                <span className="flex items-center gap-2">
                  <CalendarIcon className="size-4" />
                  {date ? format(date, 'dd/MM/yyyy') : 'Selecionar data'}
                </span>
                <ChevronDownIcon className="size-4" />
              </Button>
            }
          />
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              defaultMonth={date}
              onSelect={selected => {
                if (!selected) return
                const next = date ? new Date(date) : new Date()
                next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate())
                onChange(next)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="min-w-0 space-y-2">
        <Label>Horário</Label>
        <Popover open={timeOpen} onOpenChange={setTimeOpen}>
          <PopoverTrigger
            render={
              <Button variant="outline" disabled={!date} className="w-full justify-between font-normal">
                <span className="flex items-center gap-2">
                  <Clock3 className="size-4" />
                  {time || 'Selecionar horário'}
                </span>
                <ChevronDownIcon className="size-4" />
              </Button>
            }
          />
          <PopoverContent className="w-auto max-w-[calc(100vw-1rem)] overflow-hidden p-3" align="end">
            <div className="flex max-w-full gap-3 overflow-hidden">
              <TimeColumn
                label="Hora"
                selected={date?.getHours()}
                values={hours}
                formatValue={hour => String(hour).padStart(2, '0')}
                onSelect={hour => updateTime(hour, date?.getMinutes() ?? 0)}
              />
              <TimeColumn
                label="Minuto"
                selected={date?.getMinutes()}
                values={minutes}
                formatValue={minute => String(minute).padStart(2, '0')}
                onSelect={minute => updateTime(date?.getHours() ?? 0, minute)}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

function TimeColumn({
  label,
  selected,
  values,
  formatValue,
  onSelect,
}: {
  label: string
  selected?: number
  values: number[]
  formatValue: (value: number) => string
  onSelect: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-center text-xs font-medium text-muted-foreground">{label}</p>
      <div className="grid max-h-56 gap-1 overflow-x-hidden overflow-y-auto pr-1">
        {values.map(value => (
          <Button
            key={value}
            type="button"
            variant={selected === value ? 'default' : 'ghost'}
            size="sm"
            className="relative w-10 justify-center px-1 font-normal"
            onClick={() => onSelect(value)}
          >
            {formatValue(value)}
            {selected === value && <Check className="absolute right-0.5 size-3.5" />}
          </Button>
        ))}
      </div>
    </div>
  )
}
