'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { optimizePollPhotoFiles, type PollPhotoInput } from '../../_components/poll-photo-manager.component'
import { pollDefaultValues } from './poll.default-values'
import { pollSchema, type PollData, type PollFormValues } from './poll.schema'

export function usePollForm({
  poll,
  defaultExpiresAt,
  onSubmit,
}: {
  poll?: PollData
  defaultExpiresAt?: Date
  onSubmit: (data: PollFormValues) => void | Promise<void>
}) {
  const [photos, setPhotos] = useState<PollPhotoInput[]>(poll?.photos ?? [])
  const [photoError, setPhotoError] = useState<string>()
  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollSchema),
    defaultValues: pollDefaultValues(poll, defaultExpiresAt),
  })
  const setPhotosValue = (next: PollPhotoInput[]) => {
    setPhotos(next)
    form.setValue('photos', next, { shouldValidate: true, shouldDirty: true })
  }
  const handleFilesSelected = async (files: FileList | File[]) => {
    try {
      setPhotoError(undefined)
      const next = await optimizePollPhotoFiles(files)
      setPhotosValue([...photos, ...next].map((photo, index) => ({ ...photo, isPrimary: index === 0 })))
    } catch (cause) {
      setPhotoError(cause instanceof Error ? cause.message : 'Não foi possível processar as fotos.')
    }
  }
  const handleSubmit = form.handleSubmit(onSubmit)
  return {
    form,
    handleSubmit,
    photos,
    setPhotos: setPhotosValue,
    handleFilesSelected,
    photoError,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
  }
}
