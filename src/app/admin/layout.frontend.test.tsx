import { render, screen } from '@testing-library/react'
import AdminLayout from './layout'

it('passes admin children through unchanged', () => {
  render(
    <AdminLayout>
      <span>admin content</span>
    </AdminLayout>,
  )
  expect(screen.getByText('admin content')).toBeInTheDocument()
})
