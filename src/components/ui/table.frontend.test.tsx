import { render, screen } from '@testing-library/react'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './table'

it('renders a semantic table with slots and caption', () => {
  render(
    <Table>
      <TableCaption>Users</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ada</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
        </TableRow>
      </TableFooter>
    </Table>,
  )
  expect(screen.getByRole('table')).toHaveAttribute('data-slot', 'table')
  expect(screen.getByRole('columnheader')).toHaveTextContent('Name')
  expect(screen.getAllByRole('cell')[0]).toHaveTextContent('Ada')
  expect(screen.getByText('Users')).toHaveAttribute('data-slot', 'table-caption')
  expect(screen.getByText('Total')).toHaveAttribute('data-slot', 'table-cell')
})
