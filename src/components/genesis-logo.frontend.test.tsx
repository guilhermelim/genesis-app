import { render, screen } from '@testing-library/react'
import GenesisLogo from './genesis-logo'

describe('GenesisLogo', () => {
  it('renders the original green brand SVG by default', () => {
    render(<GenesisLogo />)

    expect(screen.getByRole('img', { name: 'Logo Genesis' })).toHaveAttribute('src', '/genesis-logo.svg')
  })

  it('can render the reusable theme-colored mask variant', () => {
    render(<GenesisLogo variant="theme" />)

    expect(screen.getByRole('img', { name: 'Logo Genesis' })).toHaveClass(
      "[mask-image:url('/genesis-logo.svg')]",
      'bg-primary',
    )
  })
})
