'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth/auth-client'
import { loginDefaultValues } from './login.default-values'
import { loginSchema, type LoginFormValues } from './login.schema'

export function useLoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string>()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues,
  })

  const handleSubmit = form.handleSubmit(async ({ email, password }) => {
    setError(undefined)
    const result = await authClient.signIn.email({ email, password })
    if (result.error) {
      setError(result.error.message || 'Não foi possível iniciar sessão')
      return
    }
    router.replace('/admin')
    router.refresh()
  })

  return { form, handleSubmit, errors: form.formState.errors, isSubmitting: form.formState.isSubmitting, error }
}
