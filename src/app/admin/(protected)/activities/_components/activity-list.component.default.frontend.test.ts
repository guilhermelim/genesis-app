import { ActivityListDefaultValues } from './activity-list.component.default'

it('provides an empty activity list item with the default icon', () => {
  expect(ActivityListDefaultValues).toEqual({
    id: '',
    label: '',
    name: '',
    description: '',
    iconName: 'default',
  })
})
