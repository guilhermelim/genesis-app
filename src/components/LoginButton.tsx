'use client'

import Link from 'next/link'
import { authClient } from '@/lib/auth/auth-client'
import { buttonVariants } from '@/components/ui/button'
import { cn } from 'cn'

export default function LoginButton() {
  const { data: session, isPending } = authClient.useSession()
  if (isPending) return null
  return (
    <Link href={session ? '/admin' : '/admin/login'} className={cn(buttonVariants({ size: 'sm' }))}>
      {session ? 'Painel' : 'Entrar'}
    </Link>
  )
}
