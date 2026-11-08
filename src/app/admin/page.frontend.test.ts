import { redirect } from 'next/navigation'
import AdminPage from './page'

jest.mock('next/navigation', () => ({ redirect: jest.fn() }))

it('redirects the admin root to member management', async () => {
  await AdminPage()
  expect(redirect).toHaveBeenCalledWith('/admin/members')
})
