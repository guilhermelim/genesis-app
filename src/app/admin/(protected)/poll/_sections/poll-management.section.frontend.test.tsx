import { render, screen } from '@testing-library/react'
import PollManagementSection from './poll-management.section'

jest.mock('@/app/_shared/poll/forms/voting.form/voting.form', () => ({
  __esModule: true,
  default: ({
    onSubmit,
    onRefresh,
  }: {
    onSubmit: (value: { memberId: string; activityId: string }) => void
    onRefresh: () => void
  }) => (
    <>
      <button type="button" onClick={() => onSubmit({ memberId: 'member-1', activityId: 'activity-1' })}>
        Inscrever-se
      </button>
      <button type="button" onClick={onRefresh}>
        Atualizar
      </button>
    </>
  ),
}))

const poll = {
  id: 'poll-1',
  name: 'Enquete semanal',
  title: 'Qual atividade?',
  description: 'Escolha uma opção',
  photos: [],
  active: true,
  expiresAt: new Date(Date.now() + 60_000),
  createdAt: new Date(),
  updatedAt: new Date(),
  votes: [],
}

describe('PollManagementSection', () => {
  it('shows administrative poll metrics and results mode', () => {
    render(
      <PollManagementSection
        poll={poll}
        members={[{ id: 'member-1', name: 'Ana', image: undefined, active: true }]}
        activities={[{ id: 'activity-1', name: 'Ação social', label: '09:00h' }]}
        onVote={jest.fn()}
        onRefresh={jest.fn()}
        mode="results"
      />,
    )

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Votos registrados')).toBeInTheDocument()
    expect(screen.getAllByText('1')).toHaveLength(2)
    expect(screen.getByText('Membros disponíveis')).toBeInTheDocument()
    expect(screen.getByText('Atividades disponíveis')).toBeInTheDocument()
    expect(screen.getByText('Qual atividade?')).toBeInTheDocument()
  })

  it('does not render voting controls for an unavailable poll', () => {
    render(
      <PollManagementSection
        poll={{ ...poll, active: false }}
        members={[]}
        activities={[]}
        onVote={jest.fn()}
        onRefresh={jest.fn()}
        mode="vote"
      />,
    )

    expect(screen.queryByRole('button', { name: 'Inscrever-se' })).not.toBeInTheDocument()
    expect(screen.getByText('Votos registrados')).toBeInTheDocument()
  })

  it('forwards vote and refresh actions for an available poll', async () => {
    const onVote = jest.fn()
    const onRefresh = jest.fn()
    render(
      <PollManagementSection
        poll={poll}
        members={[]}
        activities={[]}
        onVote={onVote}
        onRefresh={onRefresh}
        mode="vote"
      />,
    )
    screen.getByRole('button', { name: 'Inscrever-se' }).click()
    screen.getByRole('button', { name: 'Atualizar' }).click()
    expect(onVote).toHaveBeenCalledWith('member-1', 'activity-1')
    expect(onRefresh).toHaveBeenCalled()
  })
})
