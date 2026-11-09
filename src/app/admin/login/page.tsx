'use client'

import * as React from 'react'
import LoginForm from './login.form/login.form'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminLoginPage() {
  return (
    <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-xl shadow-primary/5 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden min-h-140 overflow-hidden bg-primary p-8 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Image
            src="/genesis-logo.svg"
            alt="Genesis Servir"
            width={400}
            height={351}
            className="object-contain"
            priority
          />
        </div>
        <div className="relative z-10 flex items-center gap-2 font-semibold">
          <span className="grid size-9 place-items-center rounded-xl bg-white/15">
            <LockKeyhole className="size-4" />
          </span>{' '}
          Genesis Servir
        </div>
        <div className="relative z-10 max-w-sm">
          <p className="mb-3 text-sm font-medium text-primary-foreground/70">Área restrita</p>
          <h2 className="text-3xl font-bold tracking-tight">Organize sua comunidade com simplicidade.</h2>
          <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
            Acesse o painel para cuidar dos membros, atividades e inscrições voluntárias.
          </p>
        </div>
        <p className="relative z-10 text-xs text-primary-foreground/60">Administração Genesis Servir</p>
      </div>
      <div className="flex items-center p-5 sm:p-10">
        <div className="w-full">
          <CardHeader className="px-0 pt-0">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground lg:hidden">
              <LockKeyhole className="size-4 text-primary" /> Genesis Servir
            </div>
            <CardTitle className="text-2xl">Acesso administrativo</CardTitle>
            <CardDescription className="mt-1">Entre para gerenciar o Genesis Servir.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <LoginForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Voltar para{' '}
              <Link href="/home" className="font-medium text-primary underline-offset-4 hover:underline">
                página inicial
              </Link>
            </p>
          </CardContent>
        </div>
      </div>
    </div>
  )
}
