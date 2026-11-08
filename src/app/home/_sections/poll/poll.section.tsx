'use client'

import React from 'react'
import type { PollViewModel as PollData } from '@/app/_shared/poll/types/poll-view-model.types'
import PollPublicSection from './poll-public.section'

interface PollSectionProps {
  poll: PollData
  members: { id: string; name: string; image?: string; active: boolean }[]
  activities: { id: string; name: string; label: string; iconName?: string }[]
  onVote: (memberId: string, activityId: string) => void
  onRefresh: () => void
}

export default function PollSection({ poll, onVote, onRefresh, members, activities }: PollSectionProps) {
  return (
    <PollPublicSection poll={poll} members={members} activities={activities} onVote={onVote} onRefresh={onRefresh} />
  )
}
