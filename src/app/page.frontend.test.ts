import { redirect } from 'next/navigation'
import RootPage from './page'

jest.mock('next/navigation', () => ({ redirect: jest.fn() }))

it('redirects the root route to home', () => {
  RootPage()
  expect(redirect).toHaveBeenCalledWith('/home')
})
