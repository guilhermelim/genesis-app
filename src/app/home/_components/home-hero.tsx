import Image from 'next/image'
import { HandHeart, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type PollPhoto = {
  id: string
  dataUrl: string
  isPrimary: boolean
}

export default function HomeHero({
  memberCount,
  photos = [],
  pollTitle,
}: {
  memberCount: number
  photos?: PollPhoto[]
  pollTitle?: string
}) {
  const featuredPhoto = photos.find(photo => photo.isPrimary) ?? photos[0]

  return (
    <section className="space-y-6">
      {featuredPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={featuredPhoto.dataUrl}
          alt={pollTitle ? `Imagem de destaque: ${pollTitle}` : 'Imagem de destaque da enquete'}
          className="h-auto w-full rounded-2xl object-contain shadow-lg shadow-primary/5"
        />
      ) : (
        <Image
          src="/genesis-banner.png"
          alt="Genesis Banner"
          width={1200}
          height={300}
          className="h-auto w-full rounded-2xl object-contain shadow-lg shadow-primary/5"
          priority
        />
      )}
      <div className="space-y-3 text-center">
        <Badge variant="secondary" className="px-3 py-1">
          Voluntariado da comunidade
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Life Group Gênesis</h1>
        <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Escolha como você gostaria de servir nas atividades do Life Group.
        </p>
      </div>
      <Card className="border-primary/10 bg-linear-to-br from-primary/4 via-card to-card">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <HandHeart className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">Sirva em poucos passos</p>
              <p className="text-sm text-muted-foreground">Escolha seu nome e onde deseja servir.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <Users className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">{memberCount} membros participando</p>
              <p className="text-sm text-muted-foreground">Resultados atualizados em tempo real.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
