jest.mock('better-auth/next-js', () => ({
  toNextJsHandler: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
    PATCH: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
  })),
}))
jest.mock('@/lib/auth/auth', () => ({ auth: {} }))

import { DELETE, GET, PATCH, POST, PUT } from './route'

it('exports every Better Auth HTTP handler', () => {
  for (const handler of [GET, POST, PATCH, PUT, DELETE]) {
    expect(handler).toEqual(expect.any(Function))
  }
})
