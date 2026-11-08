'use client'

import { Controller } from 'react-hook-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import PollExpirationBadge from '@/components/poll-expiration-badge'
import { HandHeart } from 'lucide-react'
import MemberCombobox from '../../components/member-combobox'
import ActivityCombobox from '../../components/activity-combobox'
import { useVotingForm } from './voting.hook'
import type { VotingFormValues } from './voting.schema'
import { toast } from 'sonner'
import type { PollActivity } from '../../types/poll-activity.types'
import type { PollMember } from '../../types/poll-member.types'

export default function VotingForm({
  poll,
  members,
  activities,
  onSubmit,
  onRefresh,
}: {
  poll: {
    name: string
    title: string
    description: string
    votes: Array<{ memberId: string; activityId: string }>
    active?: boolean
    expiresAt?: Date
  }
  members: PollMember[]
  activities: PollActivity[]
  onSubmit: (data: VotingFormValues) => void | Promise<void>
  onRefresh: () => void
}) {
  const {
    form,
    handleSubmit,
    errors,
    isSubmitting,
    loading,
    selectedMember,
    sortedMembers,
    availableActivities,
    canVote,
  } = useVotingForm({
    poll,
    members,
    activities,
    onSubmit: async data => {
      await onSubmit(data)
      toast.success('Inscrição registrada', { description: 'Sua participação foi salva com sucesso.' })
      onRefresh()
    },
  })
  return (
    <Card className="overflow-visible shadow-md shadow-primary/5">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center gap-2 text-sm text-primary">
          <HandHeart className="size-4" /> {poll.name}
        </div>
        <CardTitle className="text-2xl sm:text-3xl">{poll.title}</CardTitle>
        <CardDescription className="max-w-2xl">{poll.description}</CardDescription>
        <PollExpirationBadge expiresAt={poll.expiresAt} active={poll.active} />
      </CardHeader>
      {!canVote ? (
        <CardContent className="p-6 text-center text-muted-foreground">
          Este voluntariado já foi finalizado e não aceita novas inscrições.
        </CardContent>
      ) : (
        <CardContent className="space-y-5 p-4 sm:p-6">
          {selectedMember && (
            <Alert className="justify-center border-primary/20 bg-primary/[0.04] py-5 text-center">
              <AlertDescription className="flex w-full flex-col items-center gap-3">
                <Avatar size="lg" className="!size-24 ring-4 ring-primary/10 sm:!size-28">
                  <AvatarImage src={selectedMember.image} alt="" />
                  <AvatarFallback>{selectedMember.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm leading-6">
                  Bem-vindo de volta,<strong className="block text-base text-foreground">{selectedMember.name}!</strong>
                </span>
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Controller
              name="memberId"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="memberId">Quem vai participar?</Label>
                  <MemberCombobox
                    members={sortedMembers}
                    value={field.value}
                    onValueChange={field.onChange}
                    onSelected={member => localStorage.setItem('genesis:last-member', member.id)}
                  />
                  {errors.memberId && <span className="text-xs text-destructive">{errors.memberId.message}</span>}
                </div>
              )}
            />
            <Controller
              name="activityId"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="activityId">Escolha onde deseja servir</Label>
                  <ActivityCombobox
                    activities={availableActivities}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                  {errors.activityId && <span className="text-xs text-destructive">{errors.activityId.message}</span>}
                </div>
              )}
            />
            <Button size="lg" type="submit" disabled={loading || isSubmitting} className="w-full">
              {loading || isSubmitting ? 'Inscrevendo...' : 'Inscrever-se'}
            </Button>
          </form>
          <div className="grid gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground sm:grid-cols-3 sm:text-center">
            <span>
              <strong className="text-foreground">{sortedMembers.length}</strong> membros disponíveis
            </span>
            <span>
              <strong className="text-foreground">{availableActivities.length}</strong> atividades disponíveis
            </span>
            <span>
              <strong className="text-foreground">{poll.votes.length}</strong> inscrições registradas
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
