import Link from 'next/link'
import LoginButton from '@/components/LoginButton'
import ModeSwitch from '@/components/ModeSwitch'
import GenesisLogo from '@/components/genesis-logo'

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/home" className="group flex min-w-0 items-center gap-2" aria-label="Ir para o início">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 shadow-sm ring-1 ring-primary/20 transition-transform group-hover:scale-105">
            <GenesisLogo variant="brand" />
          </span>
          <span className="truncate text-base font-semibold tracking-tight">Genesis Servir</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <ModeSwitch />
          <LoginButton />
        </div>
      </nav>
    </header>
  )
}
