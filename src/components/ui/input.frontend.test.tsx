import { render, screen } from '@testing-library/react'
import { Input } from './input'

describe('Input', () => {
  it('forwards type, value and invalid state', () => {
    render(<Input aria-label="Email" type="email" defaultValue="a@b.test" aria-invalid />)
    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveValue('a@b.test')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })
})
