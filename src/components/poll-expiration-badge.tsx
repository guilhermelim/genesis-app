import { Clock3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function PollExpirationBadge({ expiresAt, active }: { expiresAt?: Date; active?: boolean }) {
  const expiration = expiresAt ? new Date(expiresAt) : undefined
  const isExpired = Boolean(expiration && expiration.getTime() <= new Date().getTime())
  const isInProgress = Boolean(active && !isExpired)
  const formattedExpiration = expiration
    ? expiration.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : undefined

  return (
    <Badge variant={isExpired ? 'destructive' : isInProgress ? 'default' : 'outline'} className="gap-1.5 font-normal">
      <Clock3 className="size-3.5" />
      {formattedExpiration
        ? isExpired
          ? `Finalizada em ${formattedExpiration}`
          : isInProgress
            ? `Em andamento até ${formattedExpiration}`
            : `Vencimento em ${formattedExpiration}`
        : 'Vencimento não definido'}
    </Badge>
  )
}
