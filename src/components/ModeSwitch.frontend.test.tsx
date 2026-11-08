import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModeSwitch from './ModeSwitch'

const setTheme = jest.fn()
let currentTheme: string | undefined = 'dark'
let mounted = true
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useSyncExternalStore: () => mounted,
}))
jest.mock('next-themes', () => ({ useTheme: () => ({ theme: currentTheme, setTheme }) }))

it('renders a placeholder before hydration', () => {
  mounted = false

  const { container } = render(<ModeSwitch />)

  expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  mounted = true
})

it('opens an accessible theme menu and changes theme', async () => {
  const user = userEvent.setup()
  render(<ModeSwitch />)
  const toggle = screen.getByRole('button', { name: 'Tema: Escuro' })
  await user.click(toggle)
  expect(screen.getByRole('menu', { name: 'Selecionar tema' })).toBeInTheDocument()
  await user.click(screen.getByRole('menuitemradio', { name: 'Claro' }))
  expect(setTheme).toHaveBeenCalledWith('light')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
})

it('renders the light theme selection', async () => {
  const user = userEvent.setup()
  currentTheme = 'light'
  render(<ModeSwitch />)

  await user.click(screen.getByRole('button', { name: 'Tema: Claro' }))
  expect(screen.getByRole('menuitemradio', { name: 'Claro' })).toHaveAttribute('aria-checked', 'true')
  await user.click(screen.getByRole('menuitemradio', { name: 'Sistema' }))
  await user.click(screen.getByRole('button', { name: 'Tema: Claro' }))
  await user.click(screen.getByRole('menuitemradio', { name: 'Escuro' }))
})

it('closes the menu with escape or outside interaction and supports system theme', async () => {
  const user = userEvent.setup()
  currentTheme = undefined
  render(<ModeSwitch />)
  const toggle = screen.getByRole('button', { name: 'Tema: Sistema' })
  await user.click(toggle)
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  await user.click(toggle)
  fireEvent.pointerDown(document.body)
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  currentTheme = 'unknown'
})
