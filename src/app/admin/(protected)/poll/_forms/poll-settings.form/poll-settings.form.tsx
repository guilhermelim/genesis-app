'use client'

import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePollSettingsForm } from './poll-settings.hook'
import type { PollSettingsFormValues } from './poll-settings.schema'

const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function PollSettingsForm({
  initialValues,
  onSubmit,
  onCancel,
}: {
  initialValues: PollSettingsFormValues
  onSubmit: (data: PollSettingsFormValues) => void | Promise<void>
  onCancel: () => void
}) {
  const { form, handleSubmit, errors, isSubmitting } = usePollSettingsForm({ initialValues, onSubmit })
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr_1fr]">
        <Controller
          name="weekday"
          control={form.control}
          render={({ field }) => (
            <div className="grid gap-2">
              <Label>Dia padrão</Label>
              <Select
                items={weekdays.map((label, value) => ({ label, value: String(value) }))}
                value={String(field.value)}
                onValueChange={value => field.onChange(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectGroup>
                    {weekdays.map((day, index) => (
                      <SelectItem key={day} value={String(index)}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.weekday && <p className="text-xs text-destructive">{errors.weekday.message}</p>}
            </div>
          )}
        />
        <Controller
          name="hour"
          control={form.control}
          render={({ field }) => (
            <div className="grid gap-2">
              <Label>Hora</Label>
              <Input
                type="number"
                min={0}
                max={23}
                value={field.value}
                onChange={event => field.onChange(Number(event.target.value))}
              />
              {errors.hour && <p className="text-xs text-destructive">{errors.hour.message}</p>}
            </div>
          )}
        />
        <Controller
          name="minute"
          control={form.control}
          render={({ field }) => (
            <div className="grid gap-2">
              <Label>Minuto</Label>
              <Input
                type="number"
                min={0}
                max={59}
                value={field.value}
                onChange={event => field.onChange(Number(event.target.value))}
              />
              {errors.minute && <p className="text-xs text-destructive">{errors.minute.message}</p>}
            </div>
          )}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar configuração'}
        </Button>
      </div>
    </form>
  )
}
