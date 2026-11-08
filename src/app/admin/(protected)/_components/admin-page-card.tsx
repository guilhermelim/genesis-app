import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPageCard({
  title,
  description,
  error,
  children,
}: {
  title: string
  description: string
  error?: ReactNode
  children: ReactNode
}) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-4 sm:p-6">
        {error}
        {children}
      </CardContent>
    </Card>
  )
}
