import { render, screen } from '@testing-library/react'
import ActivitiesDescriptionSection from './activities-description.section'

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

describe('ActivitiesDescriptionSection', () => {
  it('shows the empty state when there are no activities', () => {
    render(<ActivitiesDescriptionSection activities={[]} />)

    expect(screen.getByText('Nenhuma atividade cadastrada.')).toBeInTheDocument()
  })

  it('lists activity details in expandable items', () => {
    render(
      <ActivitiesDescriptionSection
        activities={[
          {
            id: 'activity-1',
            name: 'Ação social',
            label: '09:00h',
            description: '**Servir** ao próximo',
            iconName: 'Heart',
          },
        ]}
      />,
    )

    expect(screen.getByText('Ação social')).toBeInTheDocument()
    expect(screen.getByText('09:00h')).toBeInTheDocument()
    expect(screen.getByText('**Servir** ao próximo')).toBeInTheDocument()
  })
})
