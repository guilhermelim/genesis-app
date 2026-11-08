import { render, screen } from '@testing-library/react'
import PollSection from './poll.section'

jest.mock('./poll-public.section', () => ({
  __esModule: true,
  default: ({ poll, onVote, onRefresh }: { poll: { title: string }; onVote: () => void; onRefresh: () => void }) => (
    <div data-testid="poll-public">
      {poll.title}
      <button onClick={onVote}>vote</button>
      <button onClick={onRefresh}>refresh</button>
    </div>
  ),
}))

it('delegates poll data and callbacks to the public poll section', () => {
  const onVote = jest.fn()
  const onRefresh = jest.fn()
  render(
    <PollSection
      poll={{
        id: 'poll-1',
        name: 'Enquete',
        title: 'Qual atividade?',
        description: 'Descrição',
        photos: [],
        votes: [],
        active: true,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }}
      members={[]}
      activities={[]}
      onVote={onVote}
      onRefresh={onRefresh}
    />,
  )

  expect(screen.getByTestId('poll-public')).toHaveTextContent('Qual atividade?')
  expect(screen.getByRole('button', { name: 'vote' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'refresh' })).toBeInTheDocument()
})
