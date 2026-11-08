import type { Metadata } from 'next'
import * as React from 'react'
import './index.css'
import AppFooter from '@/components/layout/app-footer'
import AppHeader from '@/components/layout/app-header'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Genesis Servir | Voluntariado Life Group',
  description: 'Sistema de voluntariado para atividades do Life Group da Igreja da Paz',
  icons: {
    icon: [{ url: '/genesis-logo.svg', type: 'image/svg+xml', sizes: 'any' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:py-12">{children}</main>
            <AppFooter />
          </div>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
