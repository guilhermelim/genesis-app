import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaginationControls } from './pagination-controls'

const replace = jest.fn()
const searchParams = new URLSearchParams('filter=active')
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/items',
  useSearchParams: () => searchParams,
}))

it('shows summary and changes page through the router', async () => {
  const user = userEvent.setup()
  const onPageChange = jest.fn()
  render(<PaginationControls page={2} pageSize={10} totalItems={35} onPageChange={onPageChange} />)
  expect(screen.getByText('Exibindo 11-20 de 35 itens.')).toBeInTheDocument()
  await user.click(screen.getByText('Próxima'))
  expect(onPageChange).toHaveBeenCalledWith(3, 10)
  expect(replace).toHaveBeenCalledWith('/items?filter=active&page=3&pageSize=10', { scroll: false })
})

it('normalizes options and renders compact pagination without a summary', () => {
  render(
    <PaginationControls
      page={1}
      pageSize={0}
      totalItems={100}
      pageSizeOptions={[0, 5, 5, -2]}
      showSummary={false}
      pageSizeLabel="Size"
      previousLabel="Prev"
      nextLabel="Next"
    />,
  )
  expect(screen.getByText('Size')).toBeInTheDocument()
  expect(screen.queryByText(/Exibindo/)).not.toBeInTheDocument()
  expect(screen.getByText('Next')).toBeInTheDocument()
  expect(screen.getAllByRole('combobox')[0]).toHaveTextContent('5')
  const { unmount } = render(<PaginationControls page={1} pageSize={7} totalItems={7} pageSizeOptions={[5, 10]} />)
  expect(screen.getAllByRole('combobox').at(-1)).toHaveTextContent('7')
  unmount()
})

it('styles and handles the last page', () => {
  render(<PaginationControls page={2} pageSize={10} totalItems={20} />)
  expect(screen.getByText('Próxima').closest('a,button')).toHaveClass('pointer-events-none')
})

it('handles empty results, synchronized query parameters and page-size changes', async () => {
  const user = userEvent.setup()
  searchParams.delete('filter')
  searchParams.set('page', '1')
  searchParams.set('pageSize', '5')
  const onPageSizeChange = jest.fn()
  render(
    <PaginationControls
      page={1}
      pageSize={5}
      totalItems={0}
      onPageSizeChange={onPageSizeChange}
      pageSizeOptions={[5, 10]}
    />,
  )
  expect(screen.getByText('Exibindo 0-0 de 0 itens.')).toBeInTheDocument()
  await user.click(screen.getByRole('combobox'))
  await user.click(await screen.findByRole('option', { name: '10' }))
  expect(onPageSizeChange).toHaveBeenCalledWith(10)
  expect(replace).toHaveBeenCalledWith('/items?page=1&pageSize=10', { scroll: false })
})

it('ignores selecting the already active page size', async () => {
  const user = userEvent.setup()
  const onPageSizeChange = jest.fn()
  render(
    <PaginationControls
      page={1}
      pageSize={5}
      totalItems={5}
      onPageSizeChange={onPageSizeChange}
      pageSizeOptions={[5, 10]}
    />,
  )
  await user.click(screen.getAllByRole('combobox').at(-1)!)
  await user.click(await screen.findByRole('option', { name: '5' }))
  expect(onPageSizeChange).not.toHaveBeenCalled()
})

it('uses the default error handler when a request fails', async () => {
  const user = userEvent.setup()
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  render(
    <PaginationControls
      page={1}
      pageSize={5}
      totalItems={10}
      onPageChange={jest.fn().mockRejectedValue(new Error('failed'))}
    />,
  )
  await user.click(screen.getByText('2'))
  expect(errorSpy).toHaveBeenCalled()
  errorSpy.mockRestore()
})

it('ignores invalid and current page requests and reports callback failures', async () => {
  const user = userEvent.setup()
  const onError = jest.fn()
  const onPageChange = jest.fn().mockRejectedValue(new Error('failed'))
  render(
    <PaginationControls
      page={1}
      pageSize={10}
      totalItems={20}
      onPageChange={onPageChange}
      onError={onError}
      pageSizeOptions={[]}
    />,
  )
  await user.click(screen.getByText('Anterior'))
  expect(onPageChange).not.toHaveBeenCalled()
  await user.click(screen.getByText('2'))
  expect(onError).toHaveBeenCalledWith(expect.any(Error))
})
