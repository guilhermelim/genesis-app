'use client'

import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ActivityIconPicker from '../../_components/activity-icon-picker.component'
import { useActivityForm } from './activity.hook'
import type { ActivityFormValues } from './activity.schema'

export default function ActivityForm({
  onSubmit,
  initialValues,
  submitLabel = 'Adicionar',
  formId,
  embedded = false,
  resetAfterSubmit = true,
}: {
  onSubmit: (data: ActivityFormValues) => void | Promise<void>
  initialValues?: Partial<ActivityFormValues>
  submitLabel?: string
  formId?: string
  embedded?: boolean
  resetAfterSubmit?: boolean
}) {
  const { form, handleSubmit, errors, isSubmitting } = useActivityForm({ initialValues, onSubmit, resetAfterSubmit })
  const { control } = form
  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-5">
      {(['label', 'name', 'description'] as const).map(field => (
        <Controller
          key={field}
          name={field}
          control={control}
          render={({ field: input }) => (
            <div className="space-y-2">
              <Label htmlFor={`activity-${field}`}>
                {field === 'label' ? 'Prefixo (ex.: 7:30h)' : field === 'name' ? 'Nome da atividade' : 'Descrição'}
              </Label>
              {field === 'description' ? (
                <Textarea
                  id={`activity-${field}`}
                  {...input}
                  rows={3}
                  placeholder="Conte um pouco sobre esta atividade..."
                />
              ) : (
                <Input id={`activity-${field}`} {...input} />
              )}
              {errors[field] && <span className="text-xs text-destructive">{errors[field]?.message}</span>}
            </div>
          )}
        />
      ))}
      <Controller
        name="iconName"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>Ícone da atividade</Label>
            <ActivityIconPicker value={field.value} onChange={field.onChange} />
            {errors.iconName && <span className="text-xs text-destructive">{errors.iconName.message}</span>}
          </div>
        )}
      />
      {!embedded && (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      )}
    </form>
  )
}
