'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { activityDefaultValues } from './activity.default-values'
import { activitySchema, type ActivityFormValues } from './activity.schema'

export function useActivityForm({
  initialValues,
  onSubmit,
  resetAfterSubmit = true,
}: {
  initialValues?: Partial<ActivityFormValues>
  onSubmit: (data: ActivityFormValues) => void | Promise<void>
  resetAfterSubmit?: boolean
}) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: { ...activityDefaultValues, ...initialValues },
  })
  const handleSubmit = form.handleSubmit(async data => {
    await onSubmit(data)
    if (resetAfterSubmit) form.reset(activityDefaultValues)
  })
  return { form, handleSubmit, errors: form.formState.errors, isSubmitting: form.formState.isSubmitting }
}
