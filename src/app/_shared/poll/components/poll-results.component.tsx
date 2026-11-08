'use client'
import { useMemo } from 'react'
import type { PollViewModel as PollData } from '../types/poll-view-model.types'
import type { PollMember } from '../types/poll-member.types'
import type { PollActivity } from '../types/poll-activity.types'
import { getPollVoteRecords } from '../lib/poll-view-model'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart3 } from 'lucide-react'

export default function PollResultsComponent({
  poll,
  members,
  activities,
  showHeader = true,
}: {
  poll: PollData
  members: PollMember[]
  activities: PollActivity[]
  showHeader?: boolean
  showAnalytics?: boolean
  showVoteTimes?: boolean
}) {
  const records = useMemo(() => getPollVoteRecords(poll, members, activities), [poll, members, activities])
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <CardTitle>Inscrições voluntárias</CardTitle>
          </div>
          <CardDescription>Total de inscrições registradas: {poll.votes.length}</CardDescription>
        </CardHeader>
      )}
      <CardContent className={showHeader ? '' : 'pt-6'}>
        {!records.length ? (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Ainda não há inscrições registradas. Seja o primeiro a participar!
          </p>
        ) : (
          <div className="space-y-2 sm:overflow-hidden sm:rounded-lg sm:border">
            <div className="space-y-2 sm:hidden">
              {records.map(record => (
                <div key={record.id} className="space-y-3 rounded-lg border bg-muted/20 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage src={record.member?.image} alt="" />
                      <AvatarFallback>{record.member?.name?.[0] ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Membro</p>
                      <p className="truncate font-medium">{record.member?.name ?? 'Membro não encontrado'}</p>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Atividade escolhida</p>
                      <p className="break-words">
                        {record.activity
                          ? `${record.activity.label} - ${record.activity.name}`
                          : 'Atividade não encontrada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Horário</p>
                      <Badge variant="outline">{new Date(record.votedAt).toLocaleString('pt-BR')}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Membro</TableHead>
                    <TableHead>Atividade escolhida</TableHead>
                    <TableHead>Horário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarImage src={record.member?.image} alt="" />
                            <AvatarFallback>{record.member?.name?.[0] ?? '?'}</AvatarFallback>
                          </Avatar>
                          {record.member?.name ?? 'Membro não encontrado'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.activity
                          ? `${record.activity.label} - ${record.activity.name}`
                          : 'Atividade não encontrada'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <Badge variant="outline">{new Date(record.votedAt).toLocaleString('pt-BR')}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
