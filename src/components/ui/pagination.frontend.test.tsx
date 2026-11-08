import { render, screen } from '@testing-library/react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'

it('provides labelled navigation links and active state', () => {
  render(
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious text="Back" href="/?page=1" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/?page=2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext text="Forward" href="/?page=3" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>,
  )
  expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument()
  expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument()
  expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page')
  expect(screen.getByText('More pages')).toBeInTheDocument()
})
