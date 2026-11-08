import { MemberListDefaultValues } from './member-list.component.default'

it('provides an inactive-image-free default member item', () => {
  expect(MemberListDefaultValues).toEqual({ id: '', name: '', active: true })
})
