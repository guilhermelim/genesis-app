'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'
import { cn } from 'cn'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { LogOut, Settings } from 'lucide-react'
import PageContainer from '@/components/layout/page-container'

const tabs = [
  { href: '/admin/members', label: 'Membros' },
  { href: '/admin/activities', label: 'Atividades' },
  { href: '/admin/poll', label: 'Voluntariado' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <PageContainer className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline">
              <Settings className="mr-1 size-3" /> Administração
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Painel de Administração</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Gerencie membros, atividades e voluntariados em um só lugar.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await authClient.signOut()
            router.replace('/admin/login')
          }}
        >
          <LogOut className="size-4" /> Sair
        </Button>
      </header>
      <nav
        aria-label="Seções da administração"
        className="flex w-full gap-1 overflow-x-auto rounded-xl border bg-muted/60 p-1"
      >
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={pathname === tab.href ? 'page' : undefined}
            className={cn(
              buttonVariants({ variant: pathname === tab.href ? 'default' : 'ghost', size: 'sm' }),
              'shrink-0',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </PageContainer>
  )
}
