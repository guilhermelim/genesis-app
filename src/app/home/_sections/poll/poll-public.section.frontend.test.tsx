import { render, screen } from '@testing-library/react'
import PollPublicSection from './poll-public.section'

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
      <div>Qual atividade?</div>
      <div>membros disponíveis</div>
      <div>atividades disponíveis</div>
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

describe('PollPublicSection', () => {
  it('composes the voting form and results for an available poll', () => {
    const onVote = jest.fn()
    const onRefresh = jest.fn()
    render(
      <PollPublicSection
        poll={poll}
        members={[{ id: 'member-1', name: 'Ana', image: undefined, active: true }]}
        activities={[{ id: 'activity-1', name: 'Ação social', label: '09:00h' }]}
        onVote={onVote}
        onRefresh={onRefresh}
      />,
    )

    expect(screen.getByText('Qual atividade?')).toBeInTheDocument()
    expect(screen.getByText('Ainda não há inscrições registradas. Seja o primeiro a participar!')).toBeInTheDocument()
    expect(screen.getByText('membros disponíveis')).toBeInTheDocument()
    expect(screen.getByText('atividades disponíveis')).toBeInTheDocument()
    screen.getByRole('button', { name: 'Inscrever-se' }).click()
    screen.getByRole('button', { name: 'Atualizar' }).click()
    expect(onVote).toHaveBeenCalledWith('member-1', 'activity-1')
    expect(onRefresh).toHaveBeenCalled()
  })
})
