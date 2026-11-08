import { render, screen } from '@testing-library/react'
import { ThemeProvider } from './theme-provider'

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
}))

it('renders children inside the theme provider', () => {
  render(
    <ThemeProvider>
      <span>Application</span>
    </ThemeProvider>,
  )
  expect(screen.getByTestId('theme-provider')).toContainElement(screen.getByText('Application'))
})
