import { fireEvent, render, screen } from '@testing-library/react'
import { Button, buttonVariants } from './button'

describe('Button', () => {
  it('renders an accessible button and forwards interaction', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Save</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies variants and supports disabled state', () => {
    render(
      <Button variant="destructive" size="lg" disabled>
        Delete
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('bg-destructive/10', 'h-9')
    expect(buttonVariants({ variant: 'link' })).toContain('underline')
  })
})
