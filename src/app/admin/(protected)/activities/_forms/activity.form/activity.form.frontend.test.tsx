import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import ActivityForm from './activity.form'
import { activityIconOptions } from '@/lib/activity-icons'

describe('ActivityForm', () => {
  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<ActivityForm onSubmit={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(await screen.findByText('O prefixo da atividade é obrigatório')).toBeInTheDocument()
    expect(screen.getByText('O nome da atividade é obrigatório')).toBeInTheDocument()
    expect(screen.getByText('A descrição da atividade é obrigatória')).toBeInTheDocument()
  })

  it('submits edited values and supports embedded mode', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(
      <ActivityForm
        onSubmit={onSubmit}
        initialValues={{
          label: '07:30h',
          name: 'Corrida',
          description: 'Descrição',
          iconName: activityIconOptions[0].name,
        }}
        submitLabel="Salvar"
      />,
    )

    await user.click(screen.getByRole('button', { name: activityIconOptions[1].label }))
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      label: '07:30h',
      name: 'Corrida',
      description: 'Descrição',
      iconName: activityIconOptions[1].name,
    })
  })
})
