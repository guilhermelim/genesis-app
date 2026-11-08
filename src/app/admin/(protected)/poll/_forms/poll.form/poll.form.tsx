'use client'

import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import PollPhotoManager from '../../_components/poll-photo-manager.component'
import PollDateTimePicker from '../../_components/poll-date-time-picker.component'
import { usePollForm } from './poll.hook'
import type { PollData, PollFormValues } from './poll.schema'
import { Save } from 'lucide-react'

export default function PollForm({
  poll,
  defaultExpiresAt,
  submitLabel,
  formId,
  embedded = false,
  onSubmit,
}: {
  poll?: PollData
  defaultExpiresAt?: Date
  submitLabel: string
  formId?: string
  embedded?: boolean
  onSubmit: (data: PollFormValues) => void | Promise<void>
}) {
  const { form, handleSubmit, photos, setPhotos, handleFilesSelected, photoError, errors, isSubmitting } = usePollForm({
    poll,
    defaultExpiresAt,
    onSubmit,
  })
  const { control } = form
  const content = (
    <form
      id={formId}
      onSubmit={handleSubmit}
      onDragOver={event => {
        if (event.dataTransfer.types.includes('Files')) event.preventDefault()
      }}
      onDrop={event => {
        if (!event.dataTransfer.files.length) return
        event.preventDefault()
        void handleFilesSelected(event.dataTransfer.files)
      }}
      className="space-y-4"
    >
      {(['name', 'title', 'description'] as const).map(field => (
        <Controller
          key={field}
          name={field}
          control={control}
          render={({ field: input }) => (
            <div className="space-y-2">
              <Label htmlFor={`poll-form-${field}`}>
                {field === 'name' ? 'Nome interno' : field === 'title' ? 'Título' : 'Descrição'}
              </Label>
              {field === 'description' ? (
                <Textarea id={`poll-form-${field}`} {...input} rows={3} />
              ) : (
                <Input id={`poll-form-${field}`} {...input} />
              )}
              {errors[field] && <span className="text-xs text-destructive">{errors[field]?.message}</span>}
            </div>
          )}
        />
      ))}
      <Controller
        name="expiresAt"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>Data e hora de vencimento</Label>
            <PollDateTimePicker value={field.value} onChange={field.onChange} />
          </div>
        )}
      />
      <PollPhotoManager
        photos={photos}
        onChange={setPhotos}
        onFilesSelected={files => void handleFilesSelected(files)}
        error={photoError ?? errors.photos?.message}
      />
      {!embedded && (
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          <Save className="size-4" /> {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      )}
    </form>
  )
  return embedded ? (
    content
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>{poll ? 'Editar voluntariado' : 'Novo voluntariado'}</CardTitle>
        <CardDescription>Preencha os dados e fotos para criar ou atualizar o voluntariado.</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}
