import { render, screen } from '@testing-library/react'
import PollResultsComponent from './poll-results.component'

const basePoll = {
  id: 'poll-1',
  name: 'Enquete',
  title: 'Título',
  description: 'Descrição',
  photos: [],
  active: true,
  expiresAt: new Date(Date.now() + 60_000),
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('PollResultsComponent', () => {
  it('shows the empty results state', () => {
    render(<PollResultsComponent poll={{ ...basePoll, votes: [] }} members={[]} activities={[]} />)

    expect(screen.getByText('Ainda não há inscrições registradas. Seja o primeiro a participar!')).toBeInTheDocument()
    expect(screen.getByText('Total de inscrições registradas: 0')).toBeInTheDocument()
  })

  it('renders known and missing member/activity records', () => {
    render(
      <PollResultsComponent
        poll={{
          ...basePoll,
          votes: [
            { id: 'vote-1', memberId: 'member-1', activityId: 'activity-1', votedAt: new Date('2025-01-01T10:00:00Z') },
            { id: 'vote-2', memberId: 'missing', activityId: 'missing', votedAt: new Date('2025-01-01T11:00:00Z') },
          ],
        }}
        members={[{ id: 'member-1', name: 'Ana', image: undefined, active: true }]}
        activities={[{ id: 'activity-1', label: '07:30h', name: 'Corrida', iconName: 'Bike' }]}
      />,
    )

    expect(screen.getAllByText('Ana')).toHaveLength(2)
    expect(screen.getAllByText('07:30h - Corrida')).toHaveLength(2)
    expect(screen.getAllByText('Membro não encontrado')).toHaveLength(2)
    expect(screen.getAllByText('Atividade não encontrada')).toHaveLength(2)
  })

  it('can render without the header', () => {
    render(<PollResultsComponent poll={{ ...basePoll, votes: [] }} members={[]} activities={[]} showHeader={false} />)

    expect(screen.queryByText('Inscrições voluntárias')).not.toBeInTheDocument()
  })
})
