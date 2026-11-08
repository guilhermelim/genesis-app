'use client'

import ReactMarkdown from 'react-markdown'
import { ChevronDown, Info } from 'lucide-react'
import { getActivityIcon } from '@/lib/activity-icons'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface Activity {
  id: string
  name: string
  label: string
  description: string
  iconName?: string
}

export default function ActivitiesDescriptionSection({ activities }: { activities: Activity[] }) {
  return (
    <section className="w-full min-w-0 space-y-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Info className="size-4" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Como servir com excelência</h2>
          <p className="mt-1 text-sm text-muted-foreground">Conheça os detalhes de cada atividade antes de votar.</p>
        </div>
      </div>
      {!activities.length ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Nenhuma atividade cadastrada.</CardContent>
        </Card>
      ) : (
        <div className="grid w-full min-w-0 gap-3">
          {activities.map(activity => (
            <details
              key={activity.id}
              className="group w-full min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm"
            >
              <summary className="flex min-h-14 w-full cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-medium outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                <span className="flex min-w-0 items-center gap-2 truncate">
                  {(() => {
                    const Icon = getActivityIcon(activity.iconName)
                    return <Icon className="size-4 shrink-0 text-primary" />
                  })()}
                  {activity.name}
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t px-4 py-4 text-sm text-muted-foreground">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {(() => {
                      const Icon = getActivityIcon(activity.iconName)
                      return <Icon className="mr-1 size-3" />
                    })()}{' '}
                    {activity.label}
                  </Badge>
                </div>
                <div className="prose prose-sm max-w-none break-words dark:prose-invert">
                  <ReactMarkdown>{activity.description}</ReactMarkdown>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  )
}
