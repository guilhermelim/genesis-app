import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import AdminShell from './_components/admin-shell.client'

export const dynamic = 'force-dynamic'

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect('/admin/login')
  }

  if (session.user.role !== 'admin') {
    redirect('/')
  }

  return <AdminShell>{children}</AdminShell>
}
