'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { pollSettingsDefaultValues } from './poll-settings.default-values'
import { pollSettingsSchema, type PollSettingsFormValues } from './poll-settings.schema'

export function usePollSettingsForm({
  initialValues,
  onSubmit,
}: {
  initialValues: PollSettingsFormValues
  onSubmit: (data: PollSettingsFormValues) => void | Promise<void>
}) {
  const form = useForm<PollSettingsFormValues>({
    resolver: zodResolver(pollSettingsSchema),
    defaultValues: { ...pollSettingsDefaultValues, ...initialValues },
  })
  return {
    form,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
  }
}
