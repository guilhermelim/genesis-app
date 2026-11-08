import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

it.each(['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const)(
  'renders the %s variant',
  variant => {
    render(<Badge variant={variant}>Status</Badge>)
    expect(screen.getByText('Status')).toHaveAttribute('data-slot', 'badge')
    expect(screen.getByText('Status')).toHaveClass('group/badge')
  },
)
