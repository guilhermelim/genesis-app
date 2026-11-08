import RootLayout, { metadata } from './layout'

jest.mock('./index.css', () => ({}))
jest.mock('@/components/layout/app-header', () => ({ __esModule: true, default: () => <header>header</header> }))
jest.mock('@/components/layout/app-footer', () => ({ __esModule: true, default: () => <footer>footer</footer> }))
jest.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme">{children}</div>,
}))
jest.mock('@/components/ui/sonner', () => ({ Toaster: () => <div data-testid="toaster" /> }))

it('renders the document shell and exports the site metadata', () => {
  const tree = RootLayout({ children: <span>page content</span> })

  expect(metadata).toEqual({
    title: 'Genesis Servir | Voluntariado Life Group',
    description: 'Sistema de voluntariado para atividades do Life Group da Igreja da Paz',
    icons: {
      icon: [{ url: '/genesis-logo.svg', type: 'image/svg+xml', sizes: 'any' }],
    },
  })
  expect(tree.type).toBe('html')
  expect(tree.props.lang).toBe('pt-BR')
  expect(tree.props.children.type).toBe('body')
  expect(tree.props.children.props.children.props.children).toHaveLength(2)
})
