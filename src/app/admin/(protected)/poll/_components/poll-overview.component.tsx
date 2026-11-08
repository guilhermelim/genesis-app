import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Vote } from 'lucide-react'
import Image from 'next/image'
import type { PollViewModel as PollData } from '@/app/_shared/poll/types/poll-view-model.types'
import PollExpirationBadge from '@/components/poll-expiration-badge'

export default function PollOverview({ poll }: { poll: PollData }) {
  return (
    <Card className="overflow-visible shadow-md shadow-primary/5">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center gap-2 text-sm text-primary">
          <Vote className="size-4" /> {poll.name}
        </div>
        <CardTitle className="text-2xl sm:text-3xl">{poll.title}</CardTitle>
        <CardDescription className="max-w-2xl">{poll.description}</CardDescription>
        <div className="flex flex-wrap gap-2">
          <Badge variant={poll.active ? 'default' : 'outline'}>{poll.active ? 'Ativa' : 'Encerrada'}</Badge>
          <PollExpirationBadge expiresAt={poll.expiresAt} active={poll.active} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {poll.photos?.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {poll.photos.map((photo, index) => (
              <div
                key={photo.id}
                className={`relative aspect-video w-full overflow-hidden rounded-lg ${photo.isPrimary ? 'ring-2 ring-primary' : ''}`}
              >
                <Image
                  src={photo.dataUrl}
                  alt={`${poll.title} - foto ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">Este voluntariado não possui fotos.</p>
        )}
      </CardContent>
    </Card>
  )
}
