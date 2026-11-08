import { render } from '@testing-library/react'
import { Toaster } from './sonner'

jest.mock('next-themes', () => ({ useTheme: () => ({ theme: 'dark' }) }))
jest.mock('sonner', () => ({
  Toaster: (props: { theme: string; position?: string }) => (
    <output data-testid="mock-toaster" data-theme={props.theme} data-position={props.position} />
  ),
}))

it('passes the current theme to the toast provider', () => {
  const { container } = render(<Toaster position="top-center" />)
  expect(container.querySelector('[data-testid="mock-toaster"]')).toHaveAttribute('data-theme', 'dark')
})
