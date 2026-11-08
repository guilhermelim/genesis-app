import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'

it('opens options and reports the selected value', async () => {
  const user = userEvent.setup()
  render(
    <Select defaultValue="a">
      <SelectTrigger size="sm" aria-label="Fruit">
        <SelectValue placeholder="Choose" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="a">Apple</SelectItem>
          <SelectSeparator />
          <SelectItem value="b">Banana</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>,
  )
  await user.click(screen.getByRole('combobox', { name: 'Fruit' }))
  await user.keyboard('{ArrowDown}')
  expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
  await user.click(screen.getByRole('option', { name: 'Banana' }))
  expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('b')
})
