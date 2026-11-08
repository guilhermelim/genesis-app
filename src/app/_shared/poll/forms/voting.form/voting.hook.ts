'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { votingDefaultValues } from './voting.default-values'
import { votingSchema, type VotingFormValues } from './voting.schema'
import type { PollActivity } from '../../types/poll-activity.types'
import type { PollMember } from '../../types/poll-member.types'
import { getAvailablePollActivities, getAvailablePollMembers } from '../../lib/poll-sorting'

export function useVotingForm({
  poll,
  members,
  activities,
  onSubmit,
}: {
  poll: { votes: Array<{ memberId: string; activityId: string }>; active?: boolean; expiresAt?: Date }
  members: PollMember[]
  activities: PollActivity[]
  onSubmit: (data: VotingFormValues) => void | Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [now] = useState(() => new Date().getTime())
  const form = useForm<VotingFormValues>({ resolver: zodResolver(votingSchema), defaultValues: votingDefaultValues })
  const selectedMemberId = useWatch({ control: form.control, name: 'memberId' })
  const votedMembers = useMemo(() => new Set(poll.votes.map(vote => vote.memberId)), [poll.votes])
  const votedActivities = useMemo(() => new Set(poll.votes.map(vote => vote.activityId)), [poll.votes])
  const sortedMembers = useMemo(() => getAvailablePollMembers(members, votedMembers), [members, votedMembers])
  const availableActivities = useMemo(
    () => getAvailablePollActivities(activities, votedActivities),
    [activities, votedActivities],
  )
  const selectedMember = members.find(member => member.id === selectedMemberId)
  const canVote = Boolean(poll.active && poll.expiresAt && poll.expiresAt.getTime() > now)
  useEffect(() => {
    const stored = localStorage.getItem('genesis:last-member')
    if (stored && members.some(member => member.id === stored)) form.reset(values => ({ ...values, memberId: stored }))
  }, [members, form])
  const handleSubmit = form.handleSubmit(async data => {
    setLoading(true)
    try {
      await onSubmit(data)
      form.reset()
    } finally {
      setLoading(false)
    }
  })
  return {
    form,
    handleSubmit,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    loading,
    selectedMember,
    sortedMembers,
    availableActivities,
    canVote,
  }
}
