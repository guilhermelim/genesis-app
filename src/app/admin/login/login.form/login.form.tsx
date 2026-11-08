'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLoginForm } from './login.hook'

export default function LoginForm() {
  const { form, handleSubmit, errors, isSubmitting, error } = useLoginForm()
  const { register } = form

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível entrar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" {...register('email')} type="email" autoComplete="email" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" {...register('password')} type="password" autoComplete="current-password" />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
