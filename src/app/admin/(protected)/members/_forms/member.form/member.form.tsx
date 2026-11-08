'use client'

import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import MemberImageInput from '../../_components/member-image-input.component'
import { useMemberForm } from './member.hook'
import type { MemberFormValues } from './member.schema'

export default function MemberForm({
  onSubmit,
  initialValues,
  formId,
  embedded = false,
  submitLabel = 'Adicionar membro',
  resetAfterSubmit = true,
}: {
  onSubmit: (data: MemberFormValues) => void | Promise<void>
  initialValues?: Partial<MemberFormValues>
  formId?: string
  embedded?: boolean
  submitLabel?: string
  resetAfterSubmit?: boolean
}) {
  const { form, handleSubmit, errors, isSubmitting } = useMemberForm({ initialValues, onSubmit, resetAfterSubmit })
  const { control, register } = form
  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-5">
      <Controller name="id" control={control} render={({ field }) => <input type="hidden" {...field} />} />
      <div className="space-y-2">
        <Label htmlFor={`${formId ?? 'member'}-name`}>Nome do membro</Label>
        <Input id={`${formId ?? 'member'}-name`} {...register('name')} placeholder="Ex.: Ana Souza" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <Controller
        name="image"
        control={control}
        render={({ field }) => <MemberImageInput value={field.value} onChange={value => field.onChange(value ?? '')} />}
      />
      <Controller
        name="active"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <Switch id={`${formId ?? 'member'}-active`} checked={field.value} onCheckedChange={field.onChange} />
            <Label htmlFor={`${formId ?? 'member'}-active`}>{field.value ? 'Membro ativo' : 'Membro inativo'}</Label>
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
