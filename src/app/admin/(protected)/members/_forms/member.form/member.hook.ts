'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { memberDefaultValues } from './member.default-values'
import { memberSchema, type MemberFormValues } from './member.schema'

export function useMemberForm({
  initialValues,
  onSubmit,
  resetAfterSubmit = true,
}: {
  initialValues?: Partial<MemberFormValues>
  onSubmit: (data: MemberFormValues) => void | Promise<void>
  resetAfterSubmit?: boolean
}) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { ...memberDefaultValues, ...initialValues },
  })
  const handleSubmit = form.handleSubmit(async data => {
    await onSubmit({ ...data, image: data.image || undefined })
    if (resetAfterSubmit) form.reset(memberDefaultValues)
  })
  return { form, handleSubmit, errors: form.formState.errors, isSubmitting: form.formState.isSubmitting }
}
